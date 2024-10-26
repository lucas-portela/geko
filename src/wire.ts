import { WireListener } from "./types";

export class Wire<ValueType> {
  protected _listeners: WireListener<ValueType>[] = [];

  get value() {
    return this._value;
  }

  set value(value: ValueType) {
    this._value = value;
    this.emit();
  }

  constructor(protected _value?: ValueType) {}

  emit() {
    this._listeners.forEach((listener) => listener(this.value));
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

  attach(listener: WireListener<ValueType>) {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
      return true;
    }
    return false;
  }

  detach(listener: WireListener<ValueType>) {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
      return true;
    }
    return false;
  }
}

export class WireMultiplexer<ValueType> extends Wire<ValueType[]> {
  constructor(private _wires: Wire<ValueType>[]) {
    super();
    this._wires.forEach((wire) => wire.attach(() => this.emit()));
  }

  get value() {
    return this._wires.map((wire) => wire.value);
  }

  set value(values: ValueType[]) {
    values.forEach((value, i) => {
      this._wires[i].value = value;
    });
    this.emit();
  }
}

export class WireTransformer<
  ValueType,
  TransformedType
> extends Wire<TransformedType> {
  constructor(
    wire: Wire<ValueType>,
    transformer: (value: ValueType) => TransformedType
  ) {
    super();
    wire.attach((value) => {
      this._value = transformer(value);
      this.emit();
    });
  }

  get value() {
    return this._value;
  }

  set value(_: TransformedType) {}
}
