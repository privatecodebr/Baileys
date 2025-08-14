"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncDeviceProtocol = void 0;
var WABinary_1 = require("../../WABinary/index.js");
var USyncDeviceProtocol = /** @class */ (function () {
    function USyncDeviceProtocol() {
        this.name = 'devices';
    }
    USyncDeviceProtocol.prototype.getQueryElement = function () {
        return {
            tag: 'devices',
            attrs: {
                version: '2'
            }
        };
    };
    USyncDeviceProtocol.prototype.getUserElement = function ( /* user: USyncUser */) {
        //TODO: Implement device phashing, ts and expectedTs
        //TODO: if all are not present, return null <- current behavior
        //TODO: otherwise return a node w tag 'devices' w those as attrs
        return null;
    };
    USyncDeviceProtocol.prototype.parser = function (node) {
        var deviceList = [];
        var keyIndex = undefined;
        if (node.tag === 'devices') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            var deviceListNode = (0, WABinary_1.getBinaryNodeChild)(node, 'device-list');
            var keyIndexNode = (0, WABinary_1.getBinaryNodeChild)(node, 'key-index-list');
            if (Array.isArray(deviceListNode === null || deviceListNode === void 0 ? void 0 : deviceListNode.content)) {
                for (var _i = 0, _a = deviceListNode.content; _i < _a.length; _i++) {
                    var _b = _a[_i], tag = _b.tag, attrs = _b.attrs;
                    var id = +attrs.id;
                    var keyIndex_1 = +attrs['key-index'];
                    if (tag === 'device') {
                        deviceList.push({
                            id: id,
                            keyIndex: keyIndex_1,
                            isHosted: !!(attrs['is_hosted'] && attrs['is_hosted'] === 'true')
                        });
                    }
                }
            }
            if ((keyIndexNode === null || keyIndexNode === void 0 ? void 0 : keyIndexNode.tag) === 'key-index-list') {
                keyIndex = {
                    timestamp: +keyIndexNode.attrs['ts'],
                    signedKeyIndex: keyIndexNode === null || keyIndexNode === void 0 ? void 0 : keyIndexNode.content,
                    expectedTimestamp: keyIndexNode.attrs['expected_ts'] ? +keyIndexNode.attrs['expected_ts'] : undefined
                };
            }
        }
        return {
            deviceList: deviceList,
            keyIndex: keyIndex
        };
    };
    return USyncDeviceProtocol;
}());
exports.USyncDeviceProtocol = USyncDeviceProtocol;
//# sourceMappingURL=USyncDeviceProtocol.js.map