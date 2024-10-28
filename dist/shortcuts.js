"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gene = void 0;
var gene_1 = require("./gene");
var gene = function (lifeCycle) {
    var g = new gene_1.Gene();
    for (var key in lifeCycle) {
        g[key] = lifeCycle[key];
    }
    return g;
};
exports.gene = gene;
//# sourceMappingURL=shortcuts.js.map