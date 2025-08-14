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
exports.SenderKeyDistributionMessage = void 0;
var index_js_1 = require("../../../WAProto/index.js");
var ciphertext_message_1 = require("./ciphertext-message.js");
var SenderKeyDistributionMessage = /** @class */ (function (_super) {
    __extends(SenderKeyDistributionMessage, _super);
    function SenderKeyDistributionMessage(id, iteration, chainKey, signatureKey, serialized) {
        var _this = _super.call(this) || this;
        if (serialized) {
            try {
                var message = serialized.slice(1);
                var distributionMessage = index_js_1.proto.SenderKeyDistributionMessage.decode(message).toJSON();
                _this.serialized = serialized;
                _this.id = distributionMessage.id;
                _this.iteration = distributionMessage.iteration;
                _this.chainKey =
                    typeof distributionMessage.chainKey === 'string'
                        ? Buffer.from(distributionMessage.chainKey, 'base64')
                        : distributionMessage.chainKey;
                _this.signatureKey =
                    typeof distributionMessage.signingKey === 'string'
                        ? Buffer.from(distributionMessage.signingKey, 'base64')
                        : distributionMessage.signingKey;
            }
            catch (e) {
                throw new Error(String(e));
            }
        }
        else {
            var version = _this.intsToByteHighAndLow(_this.CURRENT_VERSION, _this.CURRENT_VERSION);
            _this.id = id;
            _this.iteration = iteration;
            _this.chainKey = chainKey;
            _this.signatureKey = signatureKey;
            var message = index_js_1.proto.SenderKeyDistributionMessage.encode(index_js_1.proto.SenderKeyDistributionMessage.create({
                id: id,
                iteration: iteration,
                chainKey: chainKey,
                signingKey: _this.signatureKey
            })).finish();
            _this.serialized = Buffer.concat([Buffer.from([version]), message]);
        }
        return _this;
    }
    SenderKeyDistributionMessage.prototype.intsToByteHighAndLow = function (highValue, lowValue) {
        return (((highValue << 4) | lowValue) & 0xff) % 256;
    };
    SenderKeyDistributionMessage.prototype.serialize = function () {
        return this.serialized;
    };
    SenderKeyDistributionMessage.prototype.getType = function () {
        return this.SENDERKEY_DISTRIBUTION_TYPE;
    };
    SenderKeyDistributionMessage.prototype.getIteration = function () {
        return this.iteration;
    };
    SenderKeyDistributionMessage.prototype.getChainKey = function () {
        return typeof this.chainKey === 'string' ? Buffer.from(this.chainKey, 'base64') : this.chainKey;
    };
    SenderKeyDistributionMessage.prototype.getSignatureKey = function () {
        return typeof this.signatureKey === 'string' ? Buffer.from(this.signatureKey, 'base64') : this.signatureKey;
    };
    SenderKeyDistributionMessage.prototype.getId = function () {
        return this.id;
    };
    return SenderKeyDistributionMessage;
}(ciphertext_message_1.CiphertextMessage));
exports.SenderKeyDistributionMessage = SenderKeyDistributionMessage;
//# sourceMappingURL=sender-key-distribution-message.js.map