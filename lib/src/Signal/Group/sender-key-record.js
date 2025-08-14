"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderKeyRecord = void 0;
var generics_1 = require("../../Utils/generics.js");
var sender_key_state_1 = require("./sender-key-state.js");
var SenderKeyRecord = /** @class */ (function () {
    function SenderKeyRecord(serialized) {
        this.MAX_STATES = 5;
        this.senderKeyStates = [];
        if (serialized) {
            for (var _i = 0, serialized_1 = serialized; _i < serialized_1.length; _i++) {
                var structure = serialized_1[_i];
                this.senderKeyStates.push(new sender_key_state_1.SenderKeyState(null, null, null, null, null, null, structure));
            }
        }
    }
    SenderKeyRecord.prototype.isEmpty = function () {
        return this.senderKeyStates.length === 0;
    };
    SenderKeyRecord.prototype.getSenderKeyState = function (keyId) {
        if (keyId === undefined && this.senderKeyStates.length) {
            return this.senderKeyStates[this.senderKeyStates.length - 1];
        }
        return this.senderKeyStates.find(function (state) { return state.getKeyId() === keyId; });
    };
    SenderKeyRecord.prototype.addSenderKeyState = function (id, iteration, chainKey, signatureKey) {
        this.senderKeyStates.push(new sender_key_state_1.SenderKeyState(id, iteration, chainKey, null, signatureKey));
        if (this.senderKeyStates.length > this.MAX_STATES) {
            this.senderKeyStates.shift();
        }
    };
    SenderKeyRecord.prototype.setSenderKeyState = function (id, iteration, chainKey, keyPair) {
        this.senderKeyStates.length = 0;
        this.senderKeyStates.push(new sender_key_state_1.SenderKeyState(id, iteration, chainKey, keyPair));
    };
    SenderKeyRecord.prototype.serialize = function () {
        return this.senderKeyStates.map(function (state) { return state.getStructure(); });
    };
    SenderKeyRecord.deserialize = function (data) {
        var parsed;
        if (typeof data === 'string') {
            parsed = JSON.parse(data, generics_1.BufferJSON.reviver);
        }
        else if (data instanceof Uint8Array) {
            var str = Buffer.from(data).toString('utf-8');
            parsed = JSON.parse(str, generics_1.BufferJSON.reviver);
        }
        else {
            parsed = data;
        }
        return new SenderKeyRecord(parsed);
    };
    return SenderKeyRecord;
}());
exports.SenderKeyRecord = SenderKeyRecord;
//# sourceMappingURL=sender-key-record.js.map