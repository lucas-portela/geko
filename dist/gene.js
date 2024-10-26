"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gene = void 0;
var Gene = /** @class */ (function () {
    function Gene() {
        this._kodo = null;
        this._isFrozen = false;
        this._input = {};
        this._output = {};
        this._listeners = [];
    }
    Object.defineProperty(Gene.prototype, "kodo", {
        get: function () {
            return this._kodo;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Gene.prototype, "isActive", {
        get: function () {
            return !!this._kodo && this._kodo.isAlive;
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
    Gene.prototype.read = function (key) {
        var _a, _b;
        return (_b = ((_a = this._input[key]) !== null && _a !== void 0 ? _a : {}).value) !== null && _b !== void 0 ? _b : null;
    };
    Gene.prototype.write = function (key, value) {
        var _a;
        var wires = (_a = this._output[key]) !== null && _a !== void 0 ? _a : [];
        wires.forEach(function (wire) {
            wire.value = value;
        });
    };
    Gene.prototype.watch = function (key, listener) {
        var wire = this._input[key];
        if (wire && wire.attach(listener)) {
            this._listeners.push({ wire: wire, listener: listener });
            return true;
        }
        return false;
    };
    Gene.prototype.wait = function (key, timeout) {
        var wire = this._input[key];
        if (wire)
            return wire.wait(timeout);
        return null;
    };
    Gene.prototype.input = function (wiring) {
        this._input = __assign(__assign({}, this._input), wiring);
        return this;
    };
    Gene.prototype.output = function (wiring) {
        var _a;
        for (var key in wiring) {
            for (var _i = 0, _b = wiring[key]; _i < _b.length; _i++) {
                var wire = _b[_i];
                this._output[key] = (_a = this._output[key]) !== null && _a !== void 0 ? _a : [];
                if (!this._output[key].includes(wire))
                    this._output[key].push(wire);
            }
        }
        return this;
    };
    Gene.prototype._attachListeners = function () {
        for (var _i = 0, _a = this._listeners; _i < _a.length; _i++) {
            var _b = _a[_i], wire = _b.wire, listener = _b.listener;
            wire.attach(listener);
        }
    };
    Gene.prototype._detachListeners = function () {
        for (var _i = 0, _a = this._listeners; _i < _a.length; _i++) {
            var _b = _a[_i], wire = _b.wire, listener = _b.listener;
            wire.detach(listener);
        }
    };
    Gene.prototype.init = function (kodo) {
        this._kodo = kodo;
        this._isFrozen = false;
        this.onInit();
    };
    Gene.prototype.freeze = function () {
        this._detachListeners();
        this._isFrozen = true;
        this.onFreeze();
    };
    Gene.prototype.continue = function () {
        this._attachListeners();
        this._isFrozen = false;
        this.onResume();
    };
    Gene.prototype.kill = function () {
        this._detachListeners();
        this.onKill();
        this._kodo = null;
    };
    Gene.prototype.onInit = function () { };
    Gene.prototype.onFreeze = function () { };
    Gene.prototype.onResume = function () { };
    Gene.prototype.onKill = function () { };
    return Gene;
}());
exports.Gene = Gene;
//# sourceMappingURL=gene.js.map