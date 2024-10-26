"use strict";
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
        this._isAlive = false;
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
    Object.defineProperty(Kodo.prototype, "isAlive", {
        get: function () {
            return this._isAlive;
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
    Kodo.prototype.init = function () {
        var _this = this;
        if (this._isAlive)
            return false;
        this._isAlive = true;
        this._isFrozen = false;
        this._genes = [];
        this._genesFn.forEach(function (geneFn) {
            var _a;
            (_a = _this._genes).push.apply(_a, geneFn());
        });
        var genesToSuppress = this._suppressions.flatMap(function (supression) {
            return _this.find(supression.gene, supression.criteria);
        });
        this._genes = this._genes.filter(function (gene) { return !genesToSuppress.includes(gene); });
        this._genes.forEach(function (gene) {
            gene.init(_this);
        });
        return true;
    };
    Kodo.prototype.freeze = function () {
        if (this._isFrozen || !this._isAlive)
            return false;
        this._isFrozen = true;
        this._genes.forEach(function (gene) { return gene.freeze(); });
        return true;
    };
    Kodo.prototype.resume = function () {
        if (!this._isFrozen || !this._isAlive)
            return false;
        this._isFrozen = false;
        this._genes.forEach(function (gene) { return gene.continue(); });
        return true;
    };
    Kodo.prototype.kill = function () {
        if (!this._isAlive)
            return false;
        if (!this._isFrozen) {
            this._genes.forEach(function (gene) { return gene.freeze(); });
            this._isFrozen = true;
        }
        this._isAlive = false;
        this._genes.forEach(function (gene) { return gene.kill(); });
        return true;
    };
    Kodo.prototype.add = function (gene) {
        var _this = this;
        if (this._isAlive) {
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
        if (this._isAlive) {
            var genes_1 = this.find(supression.gene, supression.criteria);
            genes_1.forEach(function (gene) {
                if (!_this._isFrozen)
                    gene.freeze();
                if (_this._isAlive)
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