"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string = void 0;
var shortcuts_1 = require("./shortcuts");
var string = function () {
    var wires = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        wires[_i] = arguments[_i];
    }
    return (0, shortcuts_1.transform)((0, shortcuts_1.plex)(wires), function (values) {
        return (values !== null && values !== void 0 ? values : [])
            .map(function (value) {
            return value !== undefined && value !== null ? value.toString() : "";
        })
            .join("");
    });
};
exports.string = string;
//# sourceMappingURL=utils.js.map