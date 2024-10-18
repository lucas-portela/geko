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
exports.Kode = void 0;
var Kode = /** @class */ (function () {
    function Kode(_a) {
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
    Object.defineProperty(Kode.prototype, "genes", {
        get: function () {
            return __spreadArray([], this._genes, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Kode.prototype, "isAlive", {
        get: function () {
            return this._isAlive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Kode.prototype, "isFrozen", {
        get: function () {
            return this._isFrozen;
        },
        enumerable: false,
        configurable: true
    });
    Kode.prototype.clone = function () {
        var _this = this;
        return new Kode({
            genes: function () { return _this._genesFn.map(function (fn) { return fn(); }).flat(); },
            suppress: this._suppressions,
        });
    };
    Kode.prototype.init = function () {
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
            return _this.findSupressionTargets(supression);
        });
        this._genes = this._genes.filter(function (gene) { return !genesToSuppress.includes(gene); });
        this._genes.forEach(function (gene) {
            gene.init(_this);
        });
        return true;
    };
    Kode.prototype.freeze = function () {
        if (this._isFrozen || !this._isAlive)
            return false;
        this._isFrozen = true;
        this._genes.forEach(function (gene) { return gene.freeze(); });
        return true;
    };
    Kode.prototype.resume = function () {
        if (!this._isFrozen || !this._isAlive)
            return false;
        this._isFrozen = false;
        this._genes.forEach(function (gene) { return gene.continue(); });
        return true;
    };
    Kode.prototype.kill = function () {
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
    Kode.prototype.add = function (gene) {
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
    Kode.prototype.remove = function (supression) {
        var _this = this;
        this._suppressions.push(supression);
        if (this._isAlive) {
            var genes_1 = this.findSupressionTargets(supression);
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
    Kode.prototype.findSupressionTargets = function (supression) {
        var genes = this.find(supression.gene);
        if (supression.criteria)
            genes = genes.filter(function (gene) {
                for (var field in supression.criteria) {
                    if (gene[field] != supression.criteria[field])
                        return false;
                }
                return true;
            });
        return genes;
    };
    Kode.prototype.find = function (geneClass) {
        return this._genes.filter(function (gene) { return gene instanceof geneClass; });
    };
    Kode.prototype.findOne = function (geneClass) {
        return this._genes.find(function (gene) { return gene instanceof geneClass; });
    };
    return Kode;
}());
exports.Kode = Kode;
//# sourceMappingURL=kode.js.map