"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wire = void 0;
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
            var _this = this;
            this._value = value;
            this._listeners.forEach(function (listener) { return listener(_this._value); });
        },
        enumerable: false,
        configurable: true
    });
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
//# sourceMappingURL=wire.js.map