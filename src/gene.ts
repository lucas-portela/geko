import { Kodo } from "./kodo";
import { InputWiring, OutputWiring, WireListener } from "./types";
import { Wire, Wiring } from "./wire";

export class Gene<InputType = any, OutputType = any> extends Wiring<
  InputType,
  OutputType
> {
  private _kodo: Kodo | null = null;
  private _isFrozen: boolean = false;
  private _isReady: boolean = false;

  get kodo() {
    return this._kodo as Kodo;
  }

  get isActive() {
    return !!this._kodo && this._kodo.isAlive;
  }

  get isFrozen() {
    return this._isFrozen;
  }

  watch<Key extends keyof InputType>(
    key: Key,
    listener: WireListener<InputType[Key]>
  ): boolean {
    if (this._isReady)
      throw new Error(
        "[GeKo] Cannot Watch Input: watching input in only allowed in `Gene.onInit`!"
      );
    return super.watch(key, listener);
  }

  write<Key extends keyof OutputType>(key: Key, value: OutputType[Key]): void {
    if (!this._isReady)
      throw new Error(
        "[GeKo] Cannot Write On Output: writing output is not allowed in `Gene.onInit`! Please, try to use `Gene.onReady` instead."
      );
    return super.write(key, value);
  }

  init(kodo: Kodo) {
    this._kodo = kodo;
    this._isFrozen = false;
    this.onInit();
    this._isReady = true;
  }

  freeze() {
    this._detachWireListeners();
    this._isFrozen = true;
    this.onFreeze();
  }

  continue() {
    this._attachWireListeners();
    this._isFrozen = false;
    this.onResume();
  }

  kill() {
    this._detachWireListeners();
    this.onKill();
    this._kodo = null;
  }

  onInit() {}
  onReady() {}
  onFreeze() {}
  onResume() {}
  onKill() {}
}
