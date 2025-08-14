"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signedKeyPair = exports.Curve = exports.generateSignalPubKey = void 0;
exports.aesEncryptGCM = aesEncryptGCM;
exports.aesDecryptGCM = aesDecryptGCM;
exports.aesEncryptCTR = aesEncryptCTR;
exports.aesDecryptCTR = aesDecryptCTR;
exports.aesDecrypt = aesDecrypt;
exports.aesDecryptWithIV = aesDecryptWithIV;
exports.aesEncrypt = aesEncrypt;
exports.aesEncrypWithIV = aesEncrypWithIV;
exports.hmacSign = hmacSign;
exports.sha256 = sha256;
exports.md5 = md5;
exports.hkdf = hkdf;
exports.derivePairingCodeKey = derivePairingCodeKey;
var crypto_1 = require("crypto");
/* @ts-ignore */
var libsignal = require("libsignal");
var Defaults_1 = require("../Defaults/index.js");
// insure browser & node compatibility
var subtle = globalThis.crypto.subtle;
/** prefix version byte to the pub keys, required for some curve crypto functions */
var generateSignalPubKey = function (pubKey) {
    return pubKey.length === 33 ? pubKey : Buffer.concat([Defaults_1.KEY_BUNDLE_TYPE, pubKey]);
};
exports.generateSignalPubKey = generateSignalPubKey;
exports.Curve = {
    generateKeyPair: function () {
        var _a = libsignal.curve.generateKeyPair(), pubKey = _a.pubKey, privKey = _a.privKey;
        return {
            private: Buffer.from(privKey),
            // remove version byte
            public: Buffer.from(pubKey.slice(1))
        };
    },
    sharedKey: function (privateKey, publicKey) {
        var shared = libsignal.curve.calculateAgreement((0, exports.generateSignalPubKey)(publicKey), privateKey);
        return Buffer.from(shared);
    },
    sign: function (privateKey, buf) { return libsignal.curve.calculateSignature(privateKey, buf); },
    verify: function (pubKey, message, signature) {
        try {
            libsignal.curve.verifySignature((0, exports.generateSignalPubKey)(pubKey), message, signature);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
var signedKeyPair = function (identityKeyPair, keyId) {
    var preKey = exports.Curve.generateKeyPair();
    var pubKey = (0, exports.generateSignalPubKey)(preKey.public);
    var signature = exports.Curve.sign(identityKeyPair.private, pubKey);
    return { keyPair: preKey, signature: signature, keyId: keyId };
};
exports.signedKeyPair = signedKeyPair;
var GCM_TAG_LENGTH = 128 >> 3;
/**
 * encrypt AES 256 GCM;
 * where the tag tag is suffixed to the ciphertext
 * */
function aesEncryptGCM(plaintext, key, iv, additionalData) {
    var cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
    cipher.setAAD(additionalData);
    return Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);
}
/**
 * decrypt AES 256 GCM;
 * where the auth tag is suffixed to the ciphertext
 * */
function aesDecryptGCM(ciphertext, key, iv, additionalData) {
    var decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, iv);
    // decrypt additional adata
    var enc = ciphertext.slice(0, ciphertext.length - GCM_TAG_LENGTH);
    var tag = ciphertext.slice(ciphertext.length - GCM_TAG_LENGTH);
    // set additional data
    decipher.setAAD(additionalData);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]);
}
function aesEncryptCTR(plaintext, key, iv) {
    var cipher = (0, crypto_1.createCipheriv)('aes-256-ctr', key, iv);
    return Buffer.concat([cipher.update(plaintext), cipher.final()]);
}
function aesDecryptCTR(ciphertext, key, iv) {
    var decipher = (0, crypto_1.createDecipheriv)('aes-256-ctr', key, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
/** decrypt AES 256 CBC; where the IV is prefixed to the buffer */
function aesDecrypt(buffer, key) {
    return aesDecryptWithIV(buffer.slice(16, buffer.length), key, buffer.slice(0, 16));
}
/** decrypt AES 256 CBC */
function aesDecryptWithIV(buffer, key, IV) {
    var aes = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]);
}
// encrypt AES 256 CBC; where a random IV is prefixed to the buffer
function aesEncrypt(buffer, key) {
    var IV = (0, crypto_1.randomBytes)(16);
    var aes = (0, crypto_1.createCipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([IV, aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
// encrypt AES 256 CBC with a given IV
function aesEncrypWithIV(buffer, key, IV) {
    var aes = (0, crypto_1.createCipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
// sign HMAC using SHA 256
function hmacSign(buffer, key, variant) {
    if (variant === void 0) { variant = 'sha256'; }
    return (0, crypto_1.createHmac)(variant, key).update(buffer).digest();
}
function sha256(buffer) {
    return (0, crypto_1.createHash)('sha256').update(buffer).digest();
}
function md5(buffer) {
    return (0, crypto_1.createHash)('md5').update(buffer).digest();
}
// HKDF key expansion
function hkdf(buffer, expandedLength, info) {
    return __awaiter(this, void 0, void 0, function () {
        var inputKeyMaterial, salt, infoBytes, importedKey, derivedBits;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputKeyMaterial = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
                    salt = info.salt ? new Uint8Array(info.salt) : new Uint8Array(0);
                    infoBytes = info.info ? new TextEncoder().encode(info.info) : new Uint8Array(0);
                    return [4 /*yield*/, subtle.importKey('raw', inputKeyMaterial, { name: 'HKDF' }, false, ['deriveBits'])
                        // Derive bits using HKDF
                    ];
                case 1:
                    importedKey = _a.sent();
                    return [4 /*yield*/, subtle.deriveBits({
                            name: 'HKDF',
                            hash: 'SHA-256',
                            salt: salt,
                            info: infoBytes
                        }, importedKey, expandedLength * 8 // Convert bytes to bits
                        )];
                case 2:
                    derivedBits = _a.sent();
                    return [2 /*return*/, Buffer.from(derivedBits)];
            }
        });
    });
}
function derivePairingCodeKey(pairingCode, salt) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, pairingCodeBuffer, saltBuffer, keyMaterial, derivedBits;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    pairingCodeBuffer = encoder.encode(pairingCode);
                    saltBuffer = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
                    return [4 /*yield*/, subtle.importKey('raw', pairingCodeBuffer, { name: 'PBKDF2' }, false, ['deriveBits'])
                        // Derive bits using PBKDF2 with the same parameters
                        // 2 << 16 = 131,072 iterations
                    ];
                case 1:
                    keyMaterial = _a.sent();
                    return [4 /*yield*/, subtle.deriveBits({
                            name: 'PBKDF2',
                            salt: saltBuffer,
                            iterations: 2 << 16,
                            hash: 'SHA-256'
                        }, keyMaterial, 32 * 8 // 32 bytes * 8 = 256 bits
                        )];
                case 2:
                    derivedBits = _a.sent();
                    return [2 /*return*/, Buffer.from(derivedBits)];
            }
        });
    });
}
//# sourceMappingURL=crypto.js.map