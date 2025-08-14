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
exports.makeNoiseHandler = void 0;
var boom_1 = require("@hapi/boom");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var WABinary_1 = require("../WABinary/index.js");
var crypto_1 = require("./crypto.js");
var generateIV = function (counter) {
    var iv = new ArrayBuffer(12);
    new DataView(iv).setUint32(8, counter);
    return new Uint8Array(iv);
};
var makeNoiseHandler = function (_a) {
    var _b = _a.keyPair, privateKey = _b.private, publicKey = _b.public, NOISE_HEADER = _a.NOISE_HEADER, logger = _a.logger, routingInfo = _a.routingInfo;
    logger = logger.child({ class: 'ns' });
    var authenticate = function (data) {
        if (!isFinished) {
            hash = (0, crypto_1.sha256)(Buffer.concat([hash, data]));
        }
    };
    var encrypt = function (plaintext) {
        var result = (0, crypto_1.aesEncryptGCM)(plaintext, encKey, generateIV(writeCounter), hash);
        writeCounter += 1;
        authenticate(result);
        return result;
    };
    var decrypt = function (ciphertext) {
        // before the handshake is finished, we use the same counter
        // after handshake, the counters are different
        var iv = generateIV(isFinished ? readCounter : writeCounter);
        var result = (0, crypto_1.aesDecryptGCM)(ciphertext, decKey, iv, hash);
        if (isFinished) {
            readCounter += 1;
        }
        else {
            writeCounter += 1;
        }
        authenticate(ciphertext);
        return result;
    };
    var localHKDF = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, crypto_1.hkdf)(Buffer.from(data), 64, { salt: salt, info: '' })];
                case 1:
                    key = _a.sent();
                    return [2 /*return*/, [key.slice(0, 32), key.slice(32)]];
            }
        });
    }); };
    var mixIntoKey = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, write, read;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, localHKDF(data)];
                case 1:
                    _a = _b.sent(), write = _a[0], read = _a[1];
                    salt = write;
                    encKey = read;
                    decKey = read;
                    readCounter = 0;
                    writeCounter = 0;
                    return [2 /*return*/];
            }
        });
    }); };
    var finishInit = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, write, read;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, localHKDF(new Uint8Array(0))];
                case 1:
                    _a = _b.sent(), write = _a[0], read = _a[1];
                    encKey = write;
                    decKey = read;
                    hash = Buffer.from([]);
                    readCounter = 0;
                    writeCounter = 0;
                    isFinished = true;
                    return [2 /*return*/];
            }
        });
    }); };
    var data = Buffer.from(Defaults_1.NOISE_MODE);
    var hash = data.byteLength === 32 ? data : (0, crypto_1.sha256)(data);
    var salt = hash;
    var encKey = hash;
    var decKey = hash;
    var readCounter = 0;
    var writeCounter = 0;
    var isFinished = false;
    var sentIntro = false;
    var inBytes = Buffer.alloc(0);
    authenticate(NOISE_HEADER);
    authenticate(publicKey);
    return {
        encrypt: encrypt,
        decrypt: decrypt,
        authenticate: authenticate,
        mixIntoKey: mixIntoKey,
        finishInit: finishInit,
        processHandshake: function (_a, noiseKey_1) { return __awaiter(void 0, [_a, noiseKey_1], void 0, function (_b, noiseKey) {
            var decStaticContent, certDecoded, certIntermediate, issuerSerial, keyEnc;
            var serverHello = _b.serverHello;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        authenticate(serverHello.ephemeral);
                        return [4 /*yield*/, mixIntoKey(crypto_1.Curve.sharedKey(privateKey, serverHello.ephemeral))];
                    case 1:
                        _c.sent();
                        decStaticContent = decrypt(serverHello.static);
                        return [4 /*yield*/, mixIntoKey(crypto_1.Curve.sharedKey(privateKey, decStaticContent))];
                    case 2:
                        _c.sent();
                        certDecoded = decrypt(serverHello.payload);
                        certIntermediate = index_js_1.proto.CertChain.decode(certDecoded).intermediate;
                        issuerSerial = index_js_1.proto.CertChain.NoiseCertificate.Details.decode(certIntermediate.details).issuerSerial;
                        if (issuerSerial !== Defaults_1.WA_CERT_DETAILS.SERIAL) {
                            throw new boom_1.Boom('certification match failed', { statusCode: 400 });
                        }
                        keyEnc = encrypt(noiseKey.public);
                        return [4 /*yield*/, mixIntoKey(crypto_1.Curve.sharedKey(noiseKey.private, serverHello.ephemeral))];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, keyEnc];
                }
            });
        }); },
        encodeFrame: function (data) {
            if (isFinished) {
                data = encrypt(data);
            }
            var header;
            if (routingInfo) {
                header = Buffer.alloc(7);
                header.write('ED', 0, 'utf8');
                header.writeUint8(0, 2);
                header.writeUint8(1, 3);
                header.writeUint8(routingInfo.byteLength >> 16, 4);
                header.writeUint16BE(routingInfo.byteLength & 65535, 5);
                header = Buffer.concat([header, routingInfo, NOISE_HEADER]);
            }
            else {
                header = Buffer.from(NOISE_HEADER);
            }
            var introSize = sentIntro ? 0 : header.length;
            var frame = Buffer.alloc(introSize + 3 + data.byteLength);
            if (!sentIntro) {
                frame.set(header);
                sentIntro = true;
            }
            frame.writeUInt8(data.byteLength >> 16, introSize);
            frame.writeUInt16BE(65535 & data.byteLength, introSize + 1);
            frame.set(data, introSize + 3);
            return frame;
        },
        decodeFrame: function (newData, onFrame) { return __awaiter(void 0, void 0, void 0, function () {
            var getBytesSize, size, frame, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        getBytesSize = function () {
                            if (inBytes.length >= 3) {
                                return (inBytes.readUInt8() << 16) | inBytes.readUInt16BE(1);
                            }
                        };
                        inBytes = Buffer.concat([inBytes, newData]);
                        logger.trace("recv ".concat(newData.length, " bytes, total recv ").concat(inBytes.length, " bytes"));
                        size = getBytesSize();
                        _b.label = 1;
                    case 1:
                        if (!(size && inBytes.length >= size + 3)) return [3 /*break*/, 4];
                        frame = inBytes.slice(3, size + 3);
                        inBytes = inBytes.slice(size + 3);
                        if (!isFinished) return [3 /*break*/, 3];
                        result = decrypt(frame);
                        return [4 /*yield*/, (0, WABinary_1.decodeBinaryNode)(result)];
                    case 2:
                        frame = _b.sent();
                        _b.label = 3;
                    case 3:
                        logger.trace({ msg: (_a = frame === null || frame === void 0 ? void 0 : frame.attrs) === null || _a === void 0 ? void 0 : _a.id }, 'recv frame');
                        onFrame(frame);
                        size = getBytesSize();
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); }
    };
};
exports.makeNoiseHandler = makeNoiseHandler;
//# sourceMappingURL=noise-handler.js.map