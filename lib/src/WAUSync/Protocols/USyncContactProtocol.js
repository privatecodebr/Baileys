"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncContactProtocol = void 0;
var WABinary_1 = require("../../WABinary/index.js");
var USyncContactProtocol = /** @class */ (function () {
    function USyncContactProtocol() {
        this.name = 'contact';
    }
    USyncContactProtocol.prototype.getQueryElement = function () {
        return {
            tag: 'contact',
            attrs: {}
        };
    };
    USyncContactProtocol.prototype.getUserElement = function (user) {
        //TODO: Implement type / username fields (not yet supported)
        return {
            tag: 'contact',
            attrs: {},
            content: user.phone
        };
    };
    USyncContactProtocol.prototype.parser = function (node) {
        var _a;
        if (node.tag === 'contact') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            return ((_a = node === null || node === void 0 ? void 0 : node.attrs) === null || _a === void 0 ? void 0 : _a.type) === 'in';
        }
        return false;
    };
    return USyncContactProtocol;
}());
exports.USyncContactProtocol = USyncContactProtocol;
//# sourceMappingURL=USyncContactProtocol.js.map