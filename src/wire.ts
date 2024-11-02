import { WritingLockedWireError, WritingReadOnlyWireError } from "./errors";
import { $wire } from "./shortcuts";
import { InputWiring, OutputWiring, WireListener } from "./types";

export class Wire<ValueType> {
  protected _listeners: WireListener<ValueType>[] = [];
  private _pipedWires: Wire<ValueType>[] = [];
  private _syncedWith: Wire<any>;
  private _syncListener: WireListener<any>;
  private _isLocked: boolean = false;
  private _lockPromise: Promise<void>;
  private _lockResolver: () => void;

  get value() {
    return this._value;
  }

  set value(value: ValueType) {
    if (this.isLocked) throw new WritingLockedWireError();
    this._value = value;
    this.emit();
  }

  get isLocked() {
    return this._isLocked;
  }

  constructor(protected _value?: ValueType) {
    this._syncListener = () => this.emit({ triggeredBySync: true });
    this._syncListener.priority = 1;
    this._lockPromise = Promise.resolve();
  }

  _applyPipe() {
    this._pipedWires.forEach((wire) => {
      wire.value = this.value;
    });
  }

  lock() {
    this._isLocked = true;
    this._lockPromise = new Promise(
      (resolve) => (this._lockResolver = resolve)
    );
  }

  unlock() {
    if (this.isLocked) {
      this._isLocked = false;
      this._lockResolver();
    }
  }

  async writeLock() {
    await this._lockPromise;
  }

  emit({
    triggeredBySync = false,
    uniqueListener,
  }: {
    triggeredBySync?: boolean;
    uniqueListener?: WireListener<ValueType>;
  } = {}) {
    if (this._syncedWith && !triggeredBySync) return false;
    if (uniqueListener) uniqueListener(this.value);
    else {
      this._listeners.sort((a, b) => (a.priority || 0) - (b.priority || 0));

      let calledListeners: WireListener<any>[] = [];
      while (true) {
        let listener = this._listeners.filter(
          (l) => !calledListeners.includes(l)
        )[0];
        if (listener) {
          calledListeners.push(listener);
          listener(this.value);
        } else break;
      }
    }
    this._applyPipe();
    return true;
  }

  wait(timeout?: number) {
    return new Promise<ValueType>((resolve) => {
      if (this.value !== undefined) resolve(this.value);
      else {
        let timeoutSchedule: any;
        const listener = (value: ValueType) => {
          if (timeout) clearTimeout(timeoutSchedule);
          this.detach(listener);
          resolve(value);
        };
        this.attach(listener);
        if (timeout)
          timeoutSchedule = setTimeout(() => {
            this.detach(listener);
            resolve(null);
          }, timeout);
      }
    });
  }

  attach(
    listener: WireListener<ValueType>,
    { skipEmit = false }: { skipEmit?: boolean } = {}
  ) {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
      if (!skipEmit && this.value != undefined)
        this.emit({ uniqueListener: listener });
      if (this._syncedWith)
        this._syncedWith.attach(this._syncListener, { skipEmit });
      return true;
    }
    return false;
  }

  detach(listener: WireListener<ValueType>) {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
      if (this._syncedWith && this._listeners.length == 0)
        this._syncedWith.detach(this._syncListener);
      return true;
    }
    return false;
  }

  sync(wire: Wire<any>) {
    if (this._syncedWith) {
      this._syncedWith.detach(this._syncListener);
    }
    this._syncedWith = wire;
    if (this._listeners.length > 0) this._syncedWith.attach(this._syncListener);
    return this;
  }

  unsync() {
    if (this._syncedWith) this._syncedWith.detach(this._syncListener);
    this._syncedWith = undefined;
    return this;
  }

  pipe(wires: Wire<ValueType>[] | undefined) {
    if (!wires) return this;
    wires.forEach((wire) => {
      if (!this._pipedWires.includes(wire)) this._pipedWires.push(wire);
    });
    if (this.value != undefined) this._applyPipe();
    return this;
  }

  unpipe(wires: Wire<ValueType>[] | undefined) {
    if (!wires) return this;
    this._pipedWires = this._pipedWires.filter((wire) => !wires.includes(wire));
    return this;
  }
}

export class ComputedWire<ValueType> extends Wire<ValueType> {
  constructor(private _compute: () => ValueType) {
    super();
  }

  get value() {
    return this._compute();
  }

  set value(_: ValueType) {
    throw new WritingReadOnlyWireError();
  }
}

export class QueueWire<ValueType> extends Wire<ValueType> {
  private _values: ValueType[] = [];

  constructor(values?: ValueType[]) {
    super();
    this._values = values || [];
  }

  get value() {
    return this._value;
  }

  set value(value: ValueType) {
    if (this.isLocked) throw new WritingLockedWireError();
    this._values.push(value);
  }

  get length() {
    return this._values.length;
  }

  pop() {
    this._value = this._values[0];
    this._values = this._values.slice(1);
    if (this._value !== undefined) this.emit();
  }
}

export class WireMultiplexer<ValueType> extends Wire<ValueType[]> {
  private _wires: Wire<ValueType>[];
  private _chidrenListener: WireListener<ValueType>;
  private _pauseChildrenListener = false;
  private _attached: boolean = false;

  constructor(wires: (Wire<ValueType> | ValueType)[]) {
    super();

    this._wires = wires.map((wire) => {
      if (!(wire instanceof Wire)) wire = new Wire(wire);
      return wire;
    });
    this._chidrenListener = () => {
      if (this._pauseChildrenListener) return;
      this.emit();
    };
  }

  get value() {
    this._value = this._wires.map((wire) => wire.value);
    return this._value;
  }

  set value(values: ValueType[]) {
    if (this.isLocked) throw new WritingLockedWireError();
    this._pauseChildrenListener = true;
    values.forEach((value, i) => {
      this._wires[i].value = value;
    });
    this._pauseChildrenListener = false;
    this.emit();
  }

  attach(
    listener: WireListener<ValueType[]>,
    { skipEmit = false }: { skipEmit?: boolean } = {}
  ): boolean {
    if (super.attach(listener, { skipEmit: true })) {
      if (!this._attached) {
        this._wires.forEach((wire) => {
          wire.attach(this._chidrenListener, { skipEmit: true });
        });
        this._attached = true;
        if (!skipEmit && this.value != undefined) this.emit();
      }
      return true;
    }
    return false;
  }

  detach(listener: WireListener<ValueType[]>): boolean {
    if (super.detach(listener)) {
      if (this._attached && this._listeners.length == 0) {
        this._wires.forEach((wire) => {
          wire.detach(this._chidrenListener);
        });
        this._attached = false;
      }
      return true;
    }
    return false;
  }
}

export class NamedWireMultiplexer<
  NamedTypes extends Record<string, any>
> extends Wire<Partial<NamedTypes>> {
  private _wires: Partial<{
    [key in keyof NamedTypes]?: Wire<NamedTypes[key]>;
  }>;
  private _chidrenListener: WireListener<any>;
  private _attached: boolean = false;

  constructor(wires: {
    [key in keyof NamedTypes]?: Wire<NamedTypes[key] | NamedTypes[key]>;
  }) {
    super();
    this._wires = {};
    for (let key in wires) {
      let wire = wires[key];
      if (!(wire instanceof Wire)) wire = new Wire(wire);
      this._wires[key] = wire;
    }
    this._chidrenListener = () => {
      this.emit();
    };
  }

  get value() {
    this._value = {} as NamedTypes;
    for (let key in this._wires) {
      const wire = this._wires[key];
      this._value[key] = wire.value;
    }
    return this._value;
  }

  set value(values: Partial<NamedTypes>) {
    if (this.isLocked) throw new WritingLockedWireError();
    for (let key in values) {
      let wire = this._wires[key];
      if (wire) wire.value = values[key];
    }
    this.emit();
  }

  attach(
    listener: WireListener<Partial<NamedTypes>>,
    { skipEmit = false }: { skipEmit?: boolean } = {}
  ): boolean {
    if (super.attach(listener, { skipEmit: true })) {
      if (!this._attached) {
        Object.values(this._wires).forEach((wire) => {
          wire.attach(this._chidrenListener, { skipEmit: true });
        });
        this._attached = true;
        if (!skipEmit && this.value != undefined) this.emit();
      }
      return true;
    }
    return false;
  }

  detach(listener: WireListener<Partial<NamedTypes>>): boolean {
    if (super.detach(listener)) {
      if (this._attached && this._listeners.length == 0) {
        Object.values(this._wires).forEach((wire) => {
          wire.detach(this._chidrenListener);
        });
        this._attached = false;
      }
      return true;
    }
    return false;
  }
}

export class WireTransformer<
  ValueType,
  TransformedType
> extends Wire<TransformedType> {
  private _wire: Wire<ValueType>;
  private _childListener: WireListener<ValueType>;
  private _attached: boolean = false;
  private _transformer: (value: ValueType) => TransformedType;
  private _overwritedValue: TransformedType;

  constructor(
    wire: Wire<ValueType>,
    transformer: (value: ValueType) => TransformedType
  ) {
    super();
    this._wire = wire;
    this._transformer = transformer;
    this._childListener = () => {
      this.emit();
    };
  }

  get value() {
    this._value =
      this._overwritedValue !== undefined
        ? this._overwritedValue
        : this._wire.value == undefined
        ? undefined
        : this._transformer(this._wire.value);
    return this._value;
  }

  set value(value: TransformedType) {
    if (this.isLocked) throw new WritingLockedWireError();
    this._overwritedValue = value;
    this.emit();
  }

  attach(
    listener: WireListener<TransformedType>,
    { skipEmit = false }: { skipEmit?: boolean } = {}
  ): boolean {
    if (super.attach(listener, { skipEmit: true })) {
      if (!this._attached) {
        this._wire.attach(this._childListener, { skipEmit: true });
        this._attached = true;
        if (!skipEmit && this.value != undefined) this.emit();
      }
      return true;
    }
    return false;
  }

  detach(listener: WireListener<TransformedType>): boolean {
    if (super.detach(listener)) {
      if (this._attached && this._listeners.length == 0) {
        this._wire.detach(this._childListener);
        this._attached = false;
      }
      return true;
    }
    return false;
  }
}

export class Wiring<InputType = any, OutputType = any> {
  private _input: InputWiring<InputType> = {};
  private _output: OutputWiring<OutputType> = {};
  private _wireListeners: { wire: Wire<any>; listener: WireListener<any> }[] =
    [];

  lock<Key extends keyof InputType>(key: Key) {
    const wire = this._input[key];
    if (wire) wire.lock();
  }

  unlock<Key extends keyof InputType>(key: Key) {
    const wire = this._input[key];
    if (wire) wire.unlock();
  }

  read<Key extends keyof InputType>(key: Key): InputType[Key] {
    return ((this._input[key] ?? {}).value ?? null) as InputType[Key];
  }

  inputWire<Key extends keyof InputType>(key: Key): Wire<InputType[Key]> {
    return this._input[key] ?? $wire<InputType[Key]>();
  }

  outputWire<Key extends keyof OutputType>(key: Key): Wire<OutputType[Key]>[] {
    return this._output[key] ?? [];
  }

  write<Key extends keyof OutputType>(key: Key, value: OutputType[Key]) {
    const wires = this._output[key] ?? [];
    wires.forEach((wire) => {
      wire.writeLock().then(() => (wire.value = value));
    });
  }

  watch<Key extends keyof InputType>(
    key: Key,
    listener: WireListener<InputType[Key]>
  ) {
    const wire = this._input[key];
    if (wire && wire.attach(listener)) {
      this._wireListeners.push({ wire, listener });
      return true;
    }
    return false;
  }

  wait<Key extends keyof InputType>(
    key: Key,
    timeout?: number
  ): Promise<InputType[Key]> {
    const wire = this._input[key];
    if (wire) return wire.wait(timeout);
    return null;
  }

  input(wiring: InputWiring<InputType>) {
    this._input = { ...this._input, ...wiring };
    return this;
  }

  output(wiring: OutputWiring<OutputType>) {
    for (let key in wiring) {
      for (let wire of wiring[key]) {
        if (!wire) continue;
        this._output[key] = this._output[key] ?? [];
        if (!this._output[key].includes(wire)) this._output[key].push(wire);
      }
    }
    return this;
  }

  protected _attachWireListeners() {
    for (let { wire, listener } of this._wireListeners) {
      wire.attach(listener);
    }
  }

  protected _detachWireListeners() {
    for (let { wire, listener } of this._wireListeners) {
      wire.detach(listener);
    }
  }
}
