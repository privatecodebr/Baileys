"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncStatusProtocol = void 0;
var WABinary_1 = require("../../WABinary/index.js");
var USyncStatusProtocol = /** @class */ (function () {
    function USyncStatusProtocol() {
        this.name = 'status';
    }
    USyncStatusProtocol.prototype.getQueryElement = function () {
        return {
            tag: 'status',
            attrs: {}
        };
    };
    USyncStatusProtocol.prototype.getUserElement = function () {
        return null;
    };
    USyncStatusProtocol.prototype.parser = function (node) {
        var _a, _b, _c;
        if (node.tag === 'status') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            var status_1 = (_b = (_a = node === null || node === void 0 ? void 0 : node.content) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : null;
            var setAt = new Date(+((node === null || node === void 0 ? void 0 : node.attrs.t) || 0) * 1000);
            if (!status_1) {
                if (((_c = node.attrs) === null || _c === void 0 ? void 0 : _c.code) && +node.attrs.code === 401) {
                    status_1 = '';
                }
                else {
                    status_1 = null;
                }
            }
            else if (typeof status_1 === 'string' && status_1.length === 0) {
                status_1 = null;
            }
            return {
                status: status_1,
                setAt: setAt
            };
        }
    };
    return USyncStatusProtocol;
}());
exports.USyncStatusProtocol = USyncStatusProtocol;
//# sourceMappingURL=USyncStatusProtocol.js.map