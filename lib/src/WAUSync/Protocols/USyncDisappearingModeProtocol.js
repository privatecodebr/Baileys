"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncDisappearingModeProtocol = void 0;
var WABinary_1 = require("../../WABinary/index.js");
var USyncDisappearingModeProtocol = /** @class */ (function () {
    function USyncDisappearingModeProtocol() {
        this.name = 'disappearing_mode';
    }
    USyncDisappearingModeProtocol.prototype.getQueryElement = function () {
        return {
            tag: 'disappearing_mode',
            attrs: {}
        };
    };
    USyncDisappearingModeProtocol.prototype.getUserElement = function () {
        return null;
    };
    USyncDisappearingModeProtocol.prototype.parser = function (node) {
        if (node.tag === 'disappearing_mode') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            var duration = +(node === null || node === void 0 ? void 0 : node.attrs.duration);
            var setAt = new Date(+((node === null || node === void 0 ? void 0 : node.attrs.t) || 0) * 1000);
            return {
                duration: duration,
                setAt: setAt
            };
        }
    };
    return USyncDisappearingModeProtocol;
}());
exports.USyncDisappearingModeProtocol = USyncDisappearingModeProtocol;
//# sourceMappingURL=USyncDisappearingModeProtocol.js.map