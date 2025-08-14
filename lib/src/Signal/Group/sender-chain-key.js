"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderChainKey = void 0;
/* @ts-ignore */
var crypto_1 = require("libsignal/src/crypto.js");
var sender_message_key_1 = require("./sender-message-key.js");
var SenderChainKey = /** @class */ (function () {
    function SenderChainKey(iteration, chainKey) {
        this.MESSAGE_KEY_SEED = Buffer.from([0x01]);
        this.CHAIN_KEY_SEED = Buffer.from([0x02]);
        this.iteration = iteration;
        if (chainKey instanceof Buffer) {
            this.chainKey = chainKey;
        }
        else {
            this.chainKey = Buffer.from(chainKey || []);
        }
    }
    SenderChainKey.prototype.getIteration = function () {
        return this.iteration;
    };
    SenderChainKey.prototype.getSenderMessageKey = function () {
        return new sender_message_key_1.SenderMessageKey(this.iteration, this.getDerivative(this.MESSAGE_KEY_SEED, this.chainKey));
    };
    SenderChainKey.prototype.getNext = function () {
        return new SenderChainKey(this.iteration + 1, this.getDerivative(this.CHAIN_KEY_SEED, this.chainKey));
    };
    SenderChainKey.prototype.getSeed = function () {
        return this.chainKey;
    };
    SenderChainKey.prototype.getDerivative = function (seed, key) {
        return (0, crypto_1.calculateMAC)(key, seed);
    };
    return SenderChainKey;
}());
exports.SenderChainKey = SenderChainKey;
//# sourceMappingURL=sender-chain-key.js.map