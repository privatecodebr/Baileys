"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderKeyState = void 0;
var sender_chain_key_1 = require("./sender-chain-key.js");
var sender_message_key_1 = require("./sender-message-key.js");
var SenderKeyState = /** @class */ (function () {
    function SenderKeyState(id, iteration, chainKey, signatureKeyPair, signatureKeyPublic, signatureKeyPrivate, senderKeyStateStructure) {
        this.MAX_MESSAGE_KEYS = 2000;
        if (senderKeyStateStructure) {
            this.senderKeyStateStructure = senderKeyStateStructure;
        }
        else {
            if (signatureKeyPair) {
                signatureKeyPublic = signatureKeyPair.public;
                signatureKeyPrivate = signatureKeyPair.private;
            }
            chainKey = typeof chainKey === 'string' ? Buffer.from(chainKey, 'base64') : chainKey;
            var senderChainKeyStructure = {
                iteration: iteration || 0,
                seed: chainKey || Buffer.alloc(0)
            };
            var signingKeyStructure = {
                public: typeof signatureKeyPublic === 'string'
                    ? Buffer.from(signatureKeyPublic, 'base64')
                    : signatureKeyPublic || Buffer.alloc(0)
            };
            if (signatureKeyPrivate) {
                signingKeyStructure.private =
                    typeof signatureKeyPrivate === 'string' ? Buffer.from(signatureKeyPrivate, 'base64') : signatureKeyPrivate;
            }
            this.senderKeyStateStructure = {
                senderKeyId: id || 0,
                senderChainKey: senderChainKeyStructure,
                senderSigningKey: signingKeyStructure,
                senderMessageKeys: []
            };
        }
    }
    SenderKeyState.prototype.getKeyId = function () {
        return this.senderKeyStateStructure.senderKeyId;
    };
    SenderKeyState.prototype.getSenderChainKey = function () {
        return new sender_chain_key_1.SenderChainKey(this.senderKeyStateStructure.senderChainKey.iteration, this.senderKeyStateStructure.senderChainKey.seed);
    };
    SenderKeyState.prototype.setSenderChainKey = function (chainKey) {
        this.senderKeyStateStructure.senderChainKey = {
            iteration: chainKey.getIteration(),
            seed: chainKey.getSeed()
        };
    };
    SenderKeyState.prototype.getSigningKeyPublic = function () {
        var publicKey = this.senderKeyStateStructure.senderSigningKey.public;
        if (publicKey instanceof Buffer) {
            return publicKey;
        }
        else if (typeof publicKey === 'string') {
            return Buffer.from(publicKey, 'base64');
        }
        return Buffer.from(publicKey || []);
    };
    SenderKeyState.prototype.getSigningKeyPrivate = function () {
        var privateKey = this.senderKeyStateStructure.senderSigningKey.private;
        if (!privateKey) {
            return undefined;
        }
        if (privateKey instanceof Buffer) {
            return privateKey;
        }
        else if (typeof privateKey === 'string') {
            return Buffer.from(privateKey, 'base64');
        }
        return Buffer.from(privateKey || []);
    };
    SenderKeyState.prototype.hasSenderMessageKey = function (iteration) {
        return this.senderKeyStateStructure.senderMessageKeys.some(function (key) { return key.iteration === iteration; });
    };
    SenderKeyState.prototype.addSenderMessageKey = function (senderMessageKey) {
        this.senderKeyStateStructure.senderMessageKeys.push({
            iteration: senderMessageKey.getIteration(),
            seed: senderMessageKey.getSeed()
        });
        if (this.senderKeyStateStructure.senderMessageKeys.length > this.MAX_MESSAGE_KEYS) {
            this.senderKeyStateStructure.senderMessageKeys.shift();
        }
    };
    SenderKeyState.prototype.removeSenderMessageKey = function (iteration) {
        var index = this.senderKeyStateStructure.senderMessageKeys.findIndex(function (key) { return key.iteration === iteration; });
        if (index !== -1) {
            var messageKey = this.senderKeyStateStructure.senderMessageKeys[index];
            this.senderKeyStateStructure.senderMessageKeys.splice(index, 1);
            return new sender_message_key_1.SenderMessageKey(messageKey.iteration, messageKey.seed);
        }
        return null;
    };
    SenderKeyState.prototype.getStructure = function () {
        return this.senderKeyStateStructure;
    };
    return SenderKeyState;
}());
exports.SenderKeyState = SenderKeyState;
//# sourceMappingURL=sender-key-state.js.map