"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderMessageKey = void 0;
/* @ts-ignore */
var crypto_1 = require("libsignal/src/crypto.js");
var SenderMessageKey = /** @class */ (function () {
    function SenderMessageKey(iteration, seed) {
        var derivative = (0, crypto_1.deriveSecrets)(seed, Buffer.alloc(32), Buffer.from('WhisperGroup'));
        var keys = new Uint8Array(32);
        keys.set(new Uint8Array(derivative[0].slice(16)));
        keys.set(new Uint8Array(derivative[1].slice(0, 16)), 16);
        this.iv = Buffer.from(derivative[0].slice(0, 16));
        this.cipherKey = Buffer.from(keys.buffer);
        this.iteration = iteration;
        this.seed = seed;
    }
    SenderMessageKey.prototype.getIteration = function () {
        return this.iteration;
    };
    SenderMessageKey.prototype.getIv = function () {
        return this.iv;
    };
    SenderMessageKey.prototype.getCipherKey = function () {
        return this.cipherKey;
    };
    SenderMessageKey.prototype.getSeed = function () {
        return this.seed;
    };
    return SenderMessageKey;
}());
exports.SenderMessageKey = SenderMessageKey;
//# sourceMappingURL=sender-message-key.js.map