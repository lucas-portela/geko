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
  private _readyResolver: () => void;
  private _readyPromise: Promise<void>;

  get kodo() {
    return this._kodo as Kodo;
  }

  get isActive() {
    return !!this._kodo && this._kodo.isActive;
  }

  get isFrozen() {
    return this._isFrozen;
  }

  get isReady() {
    return this._isReady;
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

  async write<Key extends keyof OutputType>(
    key: Key,
    value: OutputType[Key]
  ): Promise<void> {
    await this._readyPromise;
    return super.write(key, value);
  }

  init(kodo: Kodo) {
    this._readyPromise = new Promise<void>(
      (resolve) => (this._readyResolver = resolve)
    );
    this._isReady = false;
    this._kodo = kodo;
    this._isFrozen = false;
    this.onInit();
    this._isReady = true;
    this._readyResolver();
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
