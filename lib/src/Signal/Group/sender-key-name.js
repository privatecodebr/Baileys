"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderKeyName = void 0;
function isNull(str) {
    return str === null || str === '';
}
function intValue(num) {
    var MAX_VALUE = 0x7fffffff;
    var MIN_VALUE = -0x80000000;
    if (num > MAX_VALUE || num < MIN_VALUE) {
        return num & 0xffffffff;
    }
    return num;
}
function hashCode(strKey) {
    var hash = 0;
    if (!isNull(strKey)) {
        for (var i = 0; i < strKey.length; i++) {
            hash = hash * 31 + strKey.charCodeAt(i);
            hash = intValue(hash);
        }
    }
    return hash;
}
var SenderKeyName = /** @class */ (function () {
    function SenderKeyName(groupId, sender) {
        this.groupId = groupId;
        this.sender = sender;
    }
    SenderKeyName.prototype.getGroupId = function () {
        return this.groupId;
    };
    SenderKeyName.prototype.getSender = function () {
        return this.sender;
    };
    SenderKeyName.prototype.serialize = function () {
        return "".concat(this.groupId, "::").concat(this.sender.id, "::").concat(this.sender.deviceId);
    };
    SenderKeyName.prototype.toString = function () {
        return this.serialize();
    };
    SenderKeyName.prototype.equals = function (other) {
        if (other === null)
            return false;
        return this.groupId === other.groupId && this.sender.toString() === other.sender.toString();
    };
    SenderKeyName.prototype.hashCode = function () {
        return hashCode(this.groupId) ^ hashCode(this.sender.toString());
    };
    return SenderKeyName;
}());
exports.SenderKeyName = SenderKeyName;
//# sourceMappingURL=sender-key-name.js.map