"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowControl = exports.Flow = exports.FlowCursor = void 0;
var kodo_1 = require("./kodo");
var utils_1 = require("./utils");
var FlowCursor = /** @class */ (function () {
    function FlowCursor(address) {
        var _this = this;
        this.address = address;
        this._isActive = true;
        this._executionPromise = new Promise(function (resolve) {
            _this._executionResolver = function (value) {
                _this._isActive = false;
                resolve(value);
            };
        });
    }
    Object.defineProperty(FlowCursor.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FlowCursor.prototype, "result", {
        get: function () {
            return this._executionPromise;
        },
        enumerable: false,
        configurable: true
    });
    FlowCursor.prototype.success = function () {
        this._executionResolver(true);
    };
    FlowCursor.prototype.fail = function () {
        this._executionResolver(false);
    };
    return FlowCursor;
}());
exports.FlowCursor = FlowCursor;
var Flow = /** @class */ (function () {
    function Flow(deepFlow) {
        this._cursors = [];
        this._flow = [];
        this._isActive = false;
        this._flow = (0, utils_1.$flat)(deepFlow);
        this._flow.forEach(function (instruction, address) {
            instruction.address = address;
        });
    }
    Object.defineProperty(Flow.prototype, "flow", {
        get: function () {
            return __spreadArray([], this._flow, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Flow.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: false,
        configurable: true
    });
    Flow.prototype.run = function () {
        return __awaiter(this, arguments, void 0, function (cursor) {
            var _loop_1, this_1, state_1;
            var _this = this;
            if (cursor === void 0) { cursor = new FlowCursor(0); }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._isActive) {
                            this._cursors = [];
                            this._isActive = true;
                        }
                        this._cursors.push(cursor);
                        _loop_1 = function () {
                            var current, spawned_1, spawn, result;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!cursor.isActive)
                                            return [2 /*return*/, "break"];
                                        if (cursor.address >= this_1._flow.length) {
                                            cursor.success();
                                            return [2 /*return*/, "break"];
                                        }
                                        current = this_1._flow[cursor.address];
                                        if (!(current instanceof kodo_1.Kodo)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, current.run()];
                                    case 1:
                                        if (!(_b.sent())) {
                                            cursor.fail();
                                            return [2 /*return*/, "break"];
                                        }
                                        else
                                            cursor.address++;
                                        return [3 /*break*/, 6];
                                    case 2:
                                        if (!(current instanceof FlowControl)) return [3 /*break*/, 5];
                                        spawned_1 = [];
                                        spawn = function (address) {
                                            var newCursor = new FlowCursor(address);
                                            spawned_1.push(newCursor);
                                            _this.run(newCursor);
                                            return newCursor;
                                        };
                                        return [4 /*yield*/, current.eval(cursor, spawn)];
                                    case 3:
                                        _b.sent();
                                        return [4 /*yield*/, Promise.all(spawned_1.map(function (c) { return c.result; }))];
                                    case 4:
                                        result = _b.sent();
                                        if (result.find(function (result) { return result === false; })) {
                                            cursor.fail();
                                            return [2 /*return*/, "break"];
                                        }
                                        return [3 /*break*/, 6];
                                    case 5:
                                        cursor.fail();
                                        return [2 /*return*/, "break"];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        state_1 = _a.sent();
                        if (state_1 === "break")
                            return [3 /*break*/, 3];
                        return [3 /*break*/, 1];
                    case 3:
                        if (!this._cursors.find(function (c) { return c.isActive; }))
                            this._isActive = false;
                        return [2 /*return*/, cursor.result];
                }
            });
        });
    };
    return Flow;
}());
exports.Flow = Flow;
var FlowControl = /** @class */ (function () {
    function FlowControl(_evaluator, comment) {
        this._evaluator = _evaluator;
        this.comment = comment;
    }
    FlowControl.prototype.eval = function (cursor, spawn) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = cursor;
                        return [4 /*yield*/, this._evaluator(cursor, spawn)];
                    case 1:
                        _a.address = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FlowControl;
}());
exports.FlowControl = FlowControl;
//# sourceMappingURL=flow.js.map