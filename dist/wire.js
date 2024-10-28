"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Wiring = exports.WireTransformer = exports.WireNamedMultiplexer = exports.WireMultiplexer = exports.Wire = void 0;
var Wire = /** @class */ (function () {
    function Wire(_value) {
        var _this = this;
        this._value = _value;
        this._listeners = [];
        this._pipedWires = [];
        this._syncListener = function () { return _this.emit({ triggeredBySync: true }); };
        this._syncListener.priority = 1;
    }
    Object.defineProperty(Wire.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            this.emit();
        },
        enumerable: false,
        configurable: true
    });
    Wire.prototype._applyPipe = function () {
        var _this = this;
        this._pipedWires.forEach(function (wire) {
            wire.value = _this.value;
        });
    };
    Wire.prototype.emit = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.triggeredBySync, triggeredBySync = _c === void 0 ? false : _c, uniqueListener = _b.uniqueListener;
        if (this._syncedWith && !triggeredBySync)
            return false;
        if (uniqueListener)
            uniqueListener(this.value);
        else
            this._listeners
                .sort(function (a, b) { return (a.priority || 0) - (b.priority || 0); })
                .forEach(function (listener) { return listener(_this.value); });
        this._applyPipe();
        return true;
    };
    Wire.prototype.wait = function (timeout) {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.value !== undefined)
                resolve(_this.value);
            else {
                var timeoutSchedule_1;
                var listener_1 = function (value) {
                    if (timeout)
                        clearTimeout(timeoutSchedule_1);
                    _this.detach(listener_1);
                    resolve(value);
                };
                _this.attach(listener_1);
                if (timeout)
                    timeoutSchedule_1 = setTimeout(function () {
                        _this.detach(listener_1);
                        resolve(null);
                    }, timeout);
            }
        });
    };
    Wire.prototype.attach = function (listener, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.skipEmit, skipEmit = _c === void 0 ? false : _c;
        if (!this._listeners.includes(listener)) {
            this._listeners.push(listener);
            if (!skipEmit && this._value != undefined)
                this.emit({ uniqueListener: listener });
            if (this._syncedWith)
                this._syncedWith.attach(this._syncListener, { skipEmit: skipEmit });
            return true;
        }
        return false;
    };
    Wire.prototype.detach = function (listener) {
        var index = this._listeners.indexOf(listener);
        if (index > -1) {
            this._listeners.splice(index, 1);
            if (this._syncedWith && this._listeners.length == 0)
                this._syncedWith.detach(this._syncListener);
            return true;
        }
        return false;
    };
    Wire.prototype.sync = function (wire) {
        if (this._syncedWith) {
            this._syncedWith.detach(this._syncListener);
        }
        this._syncedWith = wire;
        if (this._listeners.length > 0)
            this._syncedWith.attach(this._syncListener);
        return this;
    };
    Wire.prototype.unsync = function () {
        if (this._syncedWith)
            this._syncedWith.detach(this._syncListener);
        this._syncedWith = undefined;
        return this;
    };
    Wire.prototype.pipe = function (wires) {
        var _this = this;
        wires.forEach(function (wire) {
            if (!_this._pipedWires.includes(wire))
                _this._pipedWires.push(wire);
        });
        if (this.value != undefined)
            this._applyPipe();
        return this;
    };
    return Wire;
}());
exports.Wire = Wire;
var WireMultiplexer = /** @class */ (function (_super) {
    __extends(WireMultiplexer, _super);
    function WireMultiplexer(wires) {
        var _this = _super.call(this) || this;
        _this._pauseChildrenListener = false;
        _this._attached = false;
        _this._wires = wires.map(function (wire) {
            if (!(wire instanceof Wire))
                wire = new Wire(wire);
            return wire;
        });
        _this._chidrenListener = function () {
            if (_this._pauseChildrenListener)
                return;
            _this._updateValue();
            _this.emit();
        };
        _this._updateValue();
        return _this;
    }
    Object.defineProperty(WireMultiplexer.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (values) {
            var _this = this;
            this._pauseChildrenListener = true;
            values.forEach(function (value, i) {
                _this._wires[i].value = value;
            });
            this._updateValue();
            this._pauseChildrenListener = false;
            this.emit();
        },
        enumerable: false,
        configurable: true
    });
    WireMultiplexer.prototype._updateValue = function () {
        this._value = this._wires.map(function (wire) { return wire.value; });
    };
    WireMultiplexer.prototype.attach = function (listener, _a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.skipEmit, skipEmit = _c === void 0 ? false : _c;
        if (_super.prototype.attach.call(this, listener, { skipEmit: true })) {
            if (!this._attached) {
                this._wires.forEach(function (wire) {
                    wire.attach(_this._chidrenListener, { skipEmit: true });
                });
                this._attached = true;
                if (!skipEmit) {
                    this._updateValue();
                    this.emit();
                }
            }
            return true;
        }
        return false;
    };
    WireMultiplexer.prototype.detach = function (listener) {
        var _this = this;
        if (_super.prototype.detach.call(this, listener)) {
            if (this._attached && this._listeners.length == 0) {
                this._wires.forEach(function (wire) {
                    wire.detach(_this._chidrenListener);
                });
                this._attached = false;
            }
            return true;
        }
        return false;
    };
    return WireMultiplexer;
}(Wire));
exports.WireMultiplexer = WireMultiplexer;
var WireNamedMultiplexer = /** @class */ (function (_super) {
    __extends(WireNamedMultiplexer, _super);
    function WireNamedMultiplexer(wires) {
        var _this = _super.call(this) || this;
        _this._attached = false;
        _this._wires = {};
        for (var key in wires) {
            var wire = wires[key];
            if (!(wire instanceof Wire))
                wire = new Wire(wire);
            _this._wires[key] = wire;
        }
        _this._chidrenListener = function () {
            var _a;
            _this._value = ((_a = _this._value) !== null && _a !== void 0 ? _a : {});
            for (var key in wires) {
                var wire = wires[key];
                _this._value[key] = wire.value;
            }
            _this.emit();
        };
        return _this;
    }
    Object.defineProperty(WireNamedMultiplexer.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (values) {
            for (var key in values) {
                var wire = this._wires[key];
                if (wire)
                    wire.value = values[key];
            }
            this.emit();
        },
        enumerable: false,
        configurable: true
    });
    WireNamedMultiplexer.prototype.attach = function (listener) {
        var _this = this;
        if (_super.prototype.attach.call(this, listener)) {
            if (!this._attached) {
                Object.values(this._wires).forEach(function (wire) {
                    wire.attach(_this._chidrenListener);
                });
                this._attached = true;
            }
            return true;
        }
        return false;
    };
    WireNamedMultiplexer.prototype.detach = function (listener) {
        var _this = this;
        if (_super.prototype.detach.call(this, listener)) {
            if (this._attached && this._listeners.length == 0) {
                Object.values(this._wires).forEach(function (wire) {
                    wire.detach(_this._chidrenListener);
                });
                this._attached = false;
            }
            return true;
        }
        return false;
    };
    return WireNamedMultiplexer;
}(Wire));
exports.WireNamedMultiplexer = WireNamedMultiplexer;
var id = 0;
var WireTransformer = /** @class */ (function (_super) {
    __extends(WireTransformer, _super);
    function WireTransformer(wire, transformer) {
        var _this = _super.call(this) || this;
        _this._attached = false;
        _this._wire = wire;
        _this._updateValue = function () {
            _this._value = transformer(_this._wire.value);
        };
        _this._childListener = function () {
            _this._updateValue();
            _this.emit();
        };
        if (_this._wire.value !== undefined)
            _this._updateValue();
        return _this;
        // let myId = id++;
        // setInterval(() => {
        //   this._updateValue();
        //   console.log(`D (${myId}):`, this.value);
        // }, 500);
    }
    Object.defineProperty(WireTransformer.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) { },
        enumerable: false,
        configurable: true
    });
    WireTransformer.prototype.attach = function (listener, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.skipEmit, skipEmit = _c === void 0 ? false : _c;
        if (_super.prototype.attach.call(this, listener, { skipEmit: true })) {
            if (!this._attached) {
                this._wire.attach(this._childListener, { skipEmit: true });
                this._attached = true;
                if (!skipEmit) {
                    this._updateValue();
                    this.emit();
                }
            }
            return true;
        }
        return false;
    };
    WireTransformer.prototype.detach = function (listener) {
        if (_super.prototype.detach.call(this, listener)) {
            if (this._attached && this._listeners.length == 0) {
                this._wire.detach(this._childListener);
                this._attached = false;
            }
            return true;
        }
        return false;
    };
    return WireTransformer;
}(Wire));
exports.WireTransformer = WireTransformer;
var Wiring = /** @class */ (function () {
    function Wiring() {
        this._input = {};
        this._output = {};
        this._wireListeners = [];
    }
    Wiring.prototype.read = function (key) {
        var _a, _b;
        return (_b = ((_a = this._input[key]) !== null && _a !== void 0 ? _a : {}).value) !== null && _b !== void 0 ? _b : null;
    };
    Wiring.prototype.write = function (key, value) {
        var _a;
        var wires = (_a = this._output[key]) !== null && _a !== void 0 ? _a : [];
        wires.forEach(function (wire) {
            wire.value = value;
        });
    };
    Wiring.prototype.watch = function (key, listener) {
        var wire = this._input[key];
        if (wire && wire.attach(listener)) {
            this._wireListeners.push({ wire: wire, listener: listener });
            return true;
        }
        return false;
    };
    Wiring.prototype.wait = function (key, timeout) {
        var wire = this._input[key];
        if (wire)
            return wire.wait(timeout);
        return null;
    };
    Wiring.prototype.input = function (wiring) {
        this._input = __assign(__assign({}, this._input), wiring);
        return this;
    };
    Wiring.prototype.output = function (wiring) {
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
    Wiring.prototype._attachWireListeners = function () {
        for (var _i = 0, _a = this._wireListeners; _i < _a.length; _i++) {
            var _b = _a[_i], wire = _b.wire, listener = _b.listener;
            wire.attach(listener);
        }
    };
    Wiring.prototype._detachWireListeners = function () {
        for (var _i = 0, _a = this._wireListeners; _i < _a.length; _i++) {
            var _b = _a[_i], wire = _b.wire, listener = _b.listener;
            wire.detach(listener);
        }
    };
    return Wiring;
}());
exports.Wiring = Wiring;
//# sourceMappingURL=wire.js.map