"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.named = exports.plex = exports.wire = exports.gene = exports.kodo = void 0;
var gene_1 = require("./gene");
var kodo_1 = require("./kodo");
var wire_1 = require("./wire");
var kodo = function (genes, suppress) {
    return new kodo_1.Kodo({ genes: genes, suppress: suppress });
};
exports.kodo = kodo;
var gene = function (lifeCycle) {
    var g = new gene_1.Gene();
    for (var key in lifeCycle) {
        g[key] = lifeCycle[key];
    }
    return g;
};
exports.gene = gene;
var wire = function (value) { return new wire_1.Wire(value); };
exports.wire = wire;
var plex = function (wires) {
    return new wire_1.WireMultiplexer(wires);
};
exports.plex = plex;
var named = function (wires) { return new wire_1.NamedWireMultiplexer(wires); };
exports.named = named;
var transform = function (wire, transformer) { return new wire_1.WireTransformer(wire, transformer); };
exports.transform = transform;
//# sourceMappingURL=shortcuts.js.map