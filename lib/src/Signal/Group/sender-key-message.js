"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderKeyMessage = void 0;
/* @ts-ignore */
var curve_1 = require("libsignal/src/curve.js");
var index_js_1 = require("../../../WAProto/index.js");
var ciphertext_message_1 = require("./ciphertext-message.js");
var SenderKeyMessage = /** @class */ (function (_super) {
    __extends(SenderKeyMessage, _super);
    function SenderKeyMessage(keyId, iteration, ciphertext, signatureKey, serialized) {
        var _this = _super.call(this) || this;
        _this.SIGNATURE_LENGTH = 64;
        if (serialized) {
            var version = serialized[0];
            var message = serialized.slice(1, serialized.length - _this.SIGNATURE_LENGTH);
            var signature = serialized.slice(-1 * _this.SIGNATURE_LENGTH);
            var senderKeyMessage = index_js_1.proto.SenderKeyMessage.decode(message).toJSON();
            _this.serialized = serialized;
            _this.messageVersion = (version & 0xff) >> 4;
            _this.keyId = senderKeyMessage.id;
            _this.iteration = senderKeyMessage.iteration;
            _this.ciphertext =
                typeof senderKeyMessage.ciphertext === 'string'
                    ? Buffer.from(senderKeyMessage.ciphertext, 'base64')
                    : senderKeyMessage.ciphertext;
            _this.signature = signature;
        }
        else {
            var version = (((_this.CURRENT_VERSION << 4) | _this.CURRENT_VERSION) & 0xff) % 256;
            var ciphertextBuffer = Buffer.from(ciphertext);
            var message = index_js_1.proto.SenderKeyMessage.encode(index_js_1.proto.SenderKeyMessage.create({
                id: keyId,
                iteration: iteration,
                ciphertext: ciphertextBuffer
            })).finish();
            var signature = _this.getSignature(signatureKey, Buffer.concat([Buffer.from([version]), message]));
            _this.serialized = Buffer.concat([Buffer.from([version]), message, Buffer.from(signature)]);
            _this.messageVersion = _this.CURRENT_VERSION;
            _this.keyId = keyId;
            _this.iteration = iteration;
            _this.ciphertext = ciphertextBuffer;
            _this.signature = signature;
        }
        return _this;
    }
    SenderKeyMessage.prototype.getKeyId = function () {
        return this.keyId;
    };
    SenderKeyMessage.prototype.getIteration = function () {
        return this.iteration;
    };
    SenderKeyMessage.prototype.getCipherText = function () {
        return this.ciphertext;
    };
    SenderKeyMessage.prototype.verifySignature = function (signatureKey) {
        var part1 = this.serialized.slice(0, this.serialized.length - this.SIGNATURE_LENGTH);
        var part2 = this.serialized.slice(-1 * this.SIGNATURE_LENGTH);
        var res = (0, curve_1.verifySignature)(signatureKey, part1, part2);
        if (!res)
            throw new Error('Invalid signature!');
    };
    SenderKeyMessage.prototype.getSignature = function (signatureKey, serialized) {
        return Buffer.from((0, curve_1.calculateSignature)(signatureKey, serialized));
    };
    SenderKeyMessage.prototype.serialize = function () {
        return this.serialized;
    };
    SenderKeyMessage.prototype.getType = function () {
        return 4;
    };
    return SenderKeyMessage;
}(ciphertext_message_1.CiphertextMessage));
exports.SenderKeyMessage = SenderKeyMessage;
//# sourceMappingURL=sender-key-message.js.map