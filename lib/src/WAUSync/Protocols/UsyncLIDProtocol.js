"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncLIDProtocol = void 0;
var USyncLIDProtocol = /** @class */ (function () {
    function USyncLIDProtocol() {
        this.name = 'lid';
    }
    USyncLIDProtocol.prototype.getQueryElement = function () {
        return {
            tag: 'lid',
            attrs: {}
        };
    };
    USyncLIDProtocol.prototype.getUserElement = function () {
        return null;
    };
    USyncLIDProtocol.prototype.parser = function (node) {
        if (node.tag === 'lid') {
            return node.attrs.val;
        }
        return null;
    };
    return USyncLIDProtocol;
}());
exports.USyncLIDProtocol = USyncLIDProtocol;
//# sourceMappingURL=UsyncLIDProtocol.js.map