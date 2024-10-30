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
exports.$flat = exports.$thread = exports.$split = exports.$repeat = exports.$while = exports.$default = exports.$case = exports.$switch = exports.$else = exports.$if = exports.$last = exports.$first = exports.$priority = exports.$num = exports.$str = void 0;
var flow_1 = require("./flow");
var shortcuts_1 = require("./shortcuts");
var wire_1 = require("./wire");
var $str = function () {
    var wires = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        wires[_i] = arguments[_i];
    }
    return (0, shortcuts_1.$transform)((0, shortcuts_1.$plex)(wires), function (values) {
        return (values !== null && values !== void 0 ? values : [])
            .map(function (value) {
            return value !== undefined && value !== null ? value.toString() : "";
        })
            .join("");
    });
};
exports.$str = $str;
var $num = function (wireNumber) {
    if (!(shortcuts_1.$wire instanceof wire_1.Wire))
        wireNumber = (0, shortcuts_1.$wire)(wireNumber);
    return (0, shortcuts_1.$transform)(wireNumber, function (value) { return parseFloat(value); });
};
exports.$num = $num;
var $priority = function (priority, listener) {
    listener.priority = priority;
    return listener;
};
exports.$priority = $priority;
var $first = function (listener) {
    listener.priority = Number.MIN_SAFE_INTEGER;
    return listener;
};
exports.$first = $first;
var $last = function (listener) {
    listener.priority = Number.MAX_SAFE_INTEGER;
    return listener;
};
exports.$last = $last;
var $if = function (condition) {
    var doElseBlocks = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        doElseBlocks[_i - 1] = arguments[_i];
    }
    var doBlock = [];
    var elseBlock = [];
    doElseBlocks.forEach(function (item) {
        if (item.type == "$else")
            elseBlock.push.apply(elseBlock, item);
        else if (item instanceof Array) {
            doBlock.push.apply(doBlock, item);
        }
        else
            doBlock.push(item);
    });
    var hasElse = elseBlock.length > 0;
    var doSize = 1 + doBlock.length;
    var elseSize = hasElse ? elseBlock.length + 1 : 0;
    var size = doSize + elseSize;
    return __spreadArray(__spreadArray([
        new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (condition())
                    return [2 /*return*/, cursor.address + 1];
                else if (hasElse)
                    return [2 /*return*/, cursor.address + doSize + 1];
                else
                    return [2 /*return*/, cursor.address + size];
                return [2 /*return*/];
            });
        }); }, "$if:decide-path")
    ], doBlock, true), (hasElse
        ? __spreadArray([
            new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, cursor.address + elseSize];
            }); }); }, "$if:skip-else")
        ], elseBlock, true) : []), true);
};
exports.$if = $if;
var $else = function () {
    var doBlock = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        doBlock[_i] = arguments[_i];
    }
    var block = (0, exports.$flat)(doBlock);
    block.type = "$else";
    return block;
};
exports.$else = $else;
var $switch = function (defaultBlock) {
    var cases = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        cases[_i - 1] = arguments[_i];
    }
    var block = defaultBlock;
    for (var i = cases.length - 1; i >= 0; i--) {
        var _a = cases[i], condition = _a[0], doBlock = _a[1];
        if (block.length > 0)
            block = (0, exports.$if)(condition, doBlock, exports.$else.apply(void 0, block));
        else
            block = (0, exports.$if)(condition, doBlock);
    }
    return block;
};
exports.$switch = $switch;
var $case = function (condition) {
    var doBlock = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        doBlock[_i - 1] = arguments[_i];
    }
    return [condition, doBlock];
};
exports.$case = $case;
var $default = function () {
    var doBlock = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        doBlock[_i] = arguments[_i];
    }
    var block = __spreadArray([], doBlock, true);
    block.type = "$default";
    return block;
};
exports.$default = $default;
var $while = function (condition) {
    var doBlocks = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        doBlocks[_i - 1] = arguments[_i];
    }
    var doBlock = (0, exports.$flat)(doBlocks);
    var size = 2 + doBlock.length;
    return __spreadArray(__spreadArray([
        new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (condition())
                    return [2 /*return*/, cursor.address + 1];
                else
                    return [2 /*return*/, cursor.address + size - 1];
                return [2 /*return*/];
            });
        }); }, "$while:check-condition")
    ], doBlock, true), [
        new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, cursor.address - (size - 1)];
            });
        }); }, "$while:loop"),
    ], false);
};
exports.$while = $while;
var $repeat = function (times, logic) {
    var i = (0, shortcuts_1.$wire)(0);
    var doBlock = (0, exports.$flat)(logic(i));
    var size = 3 + doBlock.length;
    return __spreadArray(__spreadArray([
        new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                i.value = 0;
                return [2 /*return*/, cursor.address + 1];
            });
        }); }, "$repeat:setup-iterator"),
        new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (i.value < times.value)
                    return [2 /*return*/, cursor.address + 1];
                else
                    return [2 /*return*/, cursor.address + size - 1];
                return [2 /*return*/];
            });
        }); }, "$repeat:check-iterator")
    ], doBlock, true), [
        new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                i.value++;
                return [2 /*return*/, cursor.address - (size - 2)];
            });
        }); }, "$repeat:loop"),
    ], false);
};
exports.$repeat = $repeat;
var $split = function () {
    var deepBlocks = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        deepBlocks[_i] = arguments[_i];
    }
    var blocks = deepBlocks.map(function (block) { return (0, exports.$flat)(block); });
    var size = blocks.reduce(function (a, b) { return a + b.length; }, 0) + blocks.length;
    var addresses = [1];
    var address = 1;
    for (var _a = 0, _b = blocks.slice(0, -1); _a < _b.length; _a++) {
        var block = _b[_a];
        address += block.length + 1;
        addresses.push(address);
    }
    return __spreadArray(__spreadArray([
        new flow_1.FlowControl(function (cursor, spawn) { return __awaiter(void 0, void 0, void 0, function () {
            var _i, addresses_1, address_1;
            return __generator(this, function (_a) {
                for (_i = 0, addresses_1 = addresses; _i < addresses_1.length; _i++) {
                    address_1 = addresses_1[_i];
                    spawn(cursor.address + address_1);
                }
                return [2 /*return*/, cursor.address + size + 1];
            });
        }); }, "$split:spawn-threads")
    ], (0, exports.$flat)(blocks.map(function (block, i) {
        return __spreadArray(__spreadArray([], (i > 0
            ? [
                new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, cursor.address - addresses[i - 1] - 1 + size];
                    });
                }); }, "$split:goto-end"),
            ]
            : []), true), block, true);
    })), true), [
        new flow_1.FlowControl(function (cursor) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                cursor.success();
                return [2 /*return*/, cursor.address];
            });
        }); }, "$split:close-threads"),
    ], false);
};
exports.$split = $split;
var $thread = function () {
    var doBlock = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        doBlock[_i] = arguments[_i];
    }
    var block = (0, exports.$flat)(__spreadArray([], doBlock, true));
    block.type = "$thread";
    return block;
};
exports.$thread = $thread;
var $flat = function (list) {
    return list.flat();
};
exports.$flat = $flat;
//# sourceMappingURL=utils.js.map