import { Kode } from "./kode";

export class Gene {
  private _kode: Kode | null = null;
  private _isFrozen: boolean = false;

  get kode() {
    return this._kode as Kode;
  }

  get isActive() {
    return !!this._kode && this._kode.isAlive;
  }

  get isFrozen() {
    return this._isFrozen;
  }

  init(kode: Kode) {
    this._kode = kode;
    this._isFrozen = false;
    this.onInit();
  }

  freeze() {
    this._isFrozen = true;
    this.onFreeze();
  }

  continue() {
    this._isFrozen = false;
    this.onResume();
  }

  kill() {
    this.onKill();
    this._kode = null;
  }

  onInit() {}
  onFreeze() {}
  onResume() {}
  onKill() {}
}
