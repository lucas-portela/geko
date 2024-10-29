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
exports.Kodo = void 0;
var Kodo = /** @class */ (function () {
    function Kodo(_a) {
        var _b = _a.genes, genes = _b === void 0 ? function () { return []; } : _b, _c = _a.suppress, suppress = _c === void 0 ? [] : _c;
        this._genes = [];
        this._genesFn = [];
        this._isFrozen = true;
        this._isActive = false;
        this._suppressions = [];
        this._suppressions = __spreadArray([], suppress, true);
        this._genesFn = [];
        this._genesFn.push(genes);
    }
    Object.defineProperty(Kodo.prototype, "genes", {
        get: function () {
            return __spreadArray([], this._genes, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Kodo.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Kodo.prototype, "isFrozen", {
        get: function () {
            return this._isFrozen;
        },
        enumerable: false,
        configurable: true
    });
    Kodo.prototype.clone = function () {
        var _this = this;
        return new Kodo({
            genes: function () { return _this._genesFn.map(function (fn) { return fn(); }).flat(); },
            suppress: this._suppressions,
        });
    };
    Kodo.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var genesToSuppress, executionPromise, processKeepAlive;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._isActive)
                            return [2 /*return*/, false];
                        this._isActive = true;
                        this._isFrozen = false;
                        this._genes = [];
                        this._genesFn.forEach(function (geneFn) {
                            var _a;
                            (_a = _this._genes).push.apply(_a, geneFn());
                        });
                        genesToSuppress = this._suppressions.flatMap(function (supression) {
                            return _this.find(supression.gene, supression.criteria);
                        });
                        this._genes = this._genes.filter(function (gene) { return !genesToSuppress.includes(gene); });
                        executionPromise = new Promise(function (resolve) {
                            _this._executionResolver = resolve;
                        });
                        this._genes.forEach(function (gene) {
                            gene.init(_this);
                        });
                        this._genes.forEach(function (gene) {
                            gene.onReady();
                        });
                        processKeepAlive = function () {
                            if (_this.isActive)
                                setTimeout(processKeepAlive, 500);
                        };
                        processKeepAlive();
                        return [4 /*yield*/, executionPromise];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Kodo.prototype.freeze = function () {
        if (this._isFrozen || !this._isActive)
            return false;
        this._isFrozen = true;
        this._genes.forEach(function (gene) { return gene.freeze(); });
        return true;
    };
    Kodo.prototype.resume = function () {
        if (!this._isFrozen || !this._isActive)
            return false;
        this._isFrozen = false;
        this._genes.forEach(function (gene) { return gene.continue(); });
        return true;
    };
    Kodo.prototype.finish = function () {
        if (!this._isActive)
            return false;
        if (!this._isFrozen) {
            this._genes.forEach(function (gene) { return gene.freeze(); });
            this._isFrozen = true;
        }
        this._isActive = false;
        this._genes.forEach(function (gene) { return gene.kill(); });
        if (this._executionResolver)
            this._executionResolver(true);
        return true;
    };
    Kodo.prototype.add = function (gene) {
        var _this = this;
        if (this._isActive) {
            gene().forEach(function (geneInstance) {
                _this._genes.push(geneInstance);
                geneInstance.init(_this);
                if (_this._isFrozen)
                    geneInstance.freeze();
            });
        }
        this._genesFn.push(gene);
        return this;
    };
    Kodo.prototype.remove = function (supression) {
        var _this = this;
        this._suppressions.push(supression);
        if (this._isActive) {
            var genes_1 = this.find(supression.gene, supression.criteria);
            genes_1.forEach(function (gene) {
                if (!_this._isFrozen)
                    gene.freeze();
                if (_this._isActive)
                    gene.kill();
            });
            this._genes = this._genes.filter(function (gene) { return !genes_1.includes(gene); });
        }
        return this;
    };
    Kodo.prototype.find = function (geneClass, criteria, limitOne) {
        if (criteria === void 0) { criteria = {}; }
        if (limitOne === void 0) { limitOne = false; }
        var filterFn = function (gene) {
            if (!(gene instanceof geneClass))
                return false;
            for (var field in criteria) {
                if (gene[field] != criteria[field])
                    return false;
            }
            return true;
        };
        var results = [];
        if (limitOne) {
            var foundGene = this._genes.find(filterFn);
            if (foundGene)
                results.push(foundGene);
        }
        else
            results.push.apply(results, this._genes.filter(filterFn));
        return results;
    };
    Kodo.prototype.findOne = function (geneClass, criteria) {
        if (criteria === void 0) { criteria = {}; }
        return this.find(geneClass, criteria, true)[0] || null;
    };
    return Kodo;
}());
exports.Kodo = Kodo;
//# sourceMappingURL=kodo.js.map