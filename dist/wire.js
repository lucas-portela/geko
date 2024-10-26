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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WireTransformer = exports.WireMultiplexer = exports.Wire = void 0;
var Wire = /** @class */ (function () {
    function Wire(_value) {
        this._value = _value;
        this._listeners = [];
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
    Wire.prototype.emit = function () {
        var _this = this;
        this._listeners.forEach(function (listener) { return listener(_this.value); });
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
    Wire.prototype.attach = function (listener) {
        if (!this._listeners.includes(listener)) {
            this._listeners.push(listener);
            return true;
        }
        return false;
    };
    Wire.prototype.detach = function (listener) {
        var index = this._listeners.indexOf(listener);
        if (index > -1) {
            this._listeners.splice(index, 1);
            return true;
        }
        return false;
    };
    return Wire;
}());
exports.Wire = Wire;
var WireMultiplexer = /** @class */ (function (_super) {
    __extends(WireMultiplexer, _super);
    function WireMultiplexer(_wires) {
        var _this = _super.call(this) || this;
        _this._wires = _wires;
        _this._wires.forEach(function (wire) { return wire.attach(function () { return _this.emit(); }); });
        return _this;
    }
    Object.defineProperty(WireMultiplexer.prototype, "value", {
        get: function () {
            return this._wires.map(function (wire) { return wire.value; });
        },
        set: function (values) {
            var _this = this;
            values.forEach(function (value, i) {
                _this._wires[i].value = value;
            });
            this.emit();
        },
        enumerable: false,
        configurable: true
    });
    return WireMultiplexer;
}(Wire));
exports.WireMultiplexer = WireMultiplexer;
var WireTransformer = /** @class */ (function (_super) {
    __extends(WireTransformer, _super);
    function WireTransformer(wire, transformer) {
        var _this = _super.call(this) || this;
        wire.attach(function (value) {
            _this._value = transformer(value);
            _this.emit();
        });
        return _this;
    }
    Object.defineProperty(WireTransformer.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (_) { },
        enumerable: false,
        configurable: true
    });
    return WireTransformer;
}(Wire));
exports.WireTransformer = WireTransformer;
//# sourceMappingURL=wire.js.map