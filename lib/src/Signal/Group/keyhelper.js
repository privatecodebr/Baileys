"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSenderKey = generateSenderKey;
exports.generateSenderKeyId = generateSenderKeyId;
exports.generateSenderSigningKey = generateSenderSigningKey;
var nodeCrypto = require("crypto");
/* @ts-ignore */
var curve_1 = require("libsignal/src/curve.js");
function generateSenderKey() {
    return nodeCrypto.randomBytes(32);
}
function generateSenderKeyId() {
    return nodeCrypto.randomInt(2147483647);
}
function generateSenderSigningKey(key) {
    if (!key) {
        key = (0, curve_1.generateKeyPair)();
    }
    return {
        public: Buffer.from(key.pubKey),
        private: Buffer.from(key.privKey)
    };
}
//# sourceMappingURL=keyhelper.js.map