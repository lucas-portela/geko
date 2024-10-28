import { Kodo } from "./kodo";
import { InputWiring, OutputWiring, WireListener } from "./types";
import { Wire, Wiring } from "./wire";

export class Gene<InputType = any, OutputType = any> extends Wiring<
  InputType,
  OutputType
> {
  private _kodo: Kodo | null = null;
  private _isFrozen: boolean = false;

  get kodo() {
    return this._kodo as Kodo;
  }

  get isActive() {
    return !!this._kodo && this._kodo.isAlive;
  }

  get isFrozen() {
    return this._isFrozen;
  }

  init(kodo: Kodo) {
    this._kodo = kodo;
    this._isFrozen = false;
    this.onInit();
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
  onFreeze() {}
  onResume() {}
  onKill() {}
}
