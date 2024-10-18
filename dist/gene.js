"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gene = void 0;
var Gene = /** @class */ (function () {
    function Gene() {
        this._kode = null;
        this._isFrozen = false;
    }
    Object.defineProperty(Gene.prototype, "kode", {
        get: function () {
            return this._kode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Gene.prototype, "isActive", {
        get: function () {
            return !!this._kode && this._kode.isAlive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Gene.prototype, "isFrozen", {
        get: function () {
            return this._isFrozen;
        },
        enumerable: false,
        configurable: true
    });
    Gene.prototype.init = function (kode) {
        this._kode = kode;
        this._isFrozen = false;
        this.onInit();
    };
    Gene.prototype.freeze = function () {
        this._isFrozen = true;
        this.onFreeze();
    };
    Gene.prototype.continue = function () {
        this._isFrozen = false;
        this.onResume();
    };
    Gene.prototype.kill = function () {
        this.onKill();
        this._kode = null;
    };
    Gene.prototype.onInit = function () { };
    Gene.prototype.onFreeze = function () { };
    Gene.prototype.onResume = function () { };
    Gene.prototype.onKill = function () { };
    return Gene;
}());
exports.Gene = Gene;
//# sourceMappingURL=gene.js.map