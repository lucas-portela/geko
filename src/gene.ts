import { Kodo } from "./kodo";
import { InputWiring, OutputWiring, WireListener } from "./types";
import { Wire } from "./wire";

export class Gene<
  InputType = Record<string, any>,
  OutputType = Record<string, any>
> {
  private _kodo: Kodo | null = null;
  private _isFrozen: boolean = false;
  private _input: InputWiring<InputType> = {};
  private _output: OutputWiring<OutputType> = {};
  private _listeners: { wire: Wire<any>; listener: WireListener<any> }[] = [];

  get kodo() {
    return this._kodo as Kodo;
  }

  get isActive() {
    return !!this._kodo && this._kodo.isAlive;
  }

  get isFrozen() {
    return this._isFrozen;
  }

  protected read(key: keyof InputType) {
    return (this._input[key] ?? {}).value ?? null;
  }

  protected write<Key extends keyof OutputType>(
    key: Key,
    value: OutputType[Key]
  ) {
    const wires = this._output[key] ?? [];
    wires.forEach((wire) => {
      wire.value = value;
    });
  }

  watch<Key extends keyof InputType>(
    key: Key,
    listener: WireListener<InputType[Key]>
  ) {
    const wire = this._input[key];
    if (wire && wire.attach(listener)) {
      this._listeners.push({ wire, listener });
      return true;
    }
    return false;
  }

  wait<Key extends keyof InputType>(key: Key, timeout?: number) {
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
        this._output[key] = this._output[key] ?? [];
        if (!this._output[key].includes(wire)) this._output[key].push(wire);
      }
    }
    return this;
  }

  private _attachListeners() {
    for (let { wire, listener } of this._listeners) {
      wire.attach(listener);
    }
  }

  private _detachListeners() {
    for (let { wire, listener } of this._listeners) {
      wire.detach(listener);
    }
  }

  init(kodo: Kodo) {
    this._kodo = kodo;
    this._isFrozen = false;
    this.onInit();
  }

  freeze() {
    this._detachListeners();
    this._isFrozen = true;
    this.onFreeze();
  }

  continue() {
    this._attachListeners();
    this._isFrozen = false;
    this.onResume();
  }

  kill() {
    this._detachListeners();
    this.onKill();
    this._kodo = null;
  }

  onInit() {}
  onFreeze() {}
  onResume() {}
  onKill() {}
}
