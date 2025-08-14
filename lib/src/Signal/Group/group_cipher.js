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
exports.GroupCipher = void 0;
/* @ts-ignore */
var crypto_1 = require("libsignal/src/crypto.js");
var queue_job_1 = require("./queue-job.js");
var sender_key_message_1 = require("./sender-key-message.js");
var GroupCipher = /** @class */ (function () {
    function GroupCipher(senderKeyStore, senderKeyName) {
        this.senderKeyStore = senderKeyStore;
        this.senderKeyName = senderKeyName;
    }
    GroupCipher.prototype.queueJob = function (awaitable) {
        return (0, queue_job_1.default)(this.senderKeyName.toString(), awaitable);
    };
    GroupCipher.prototype.encrypt = function (paddedPlaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.queueJob(function () { return __awaiter(_this, void 0, void 0, function () {
                            var record, senderKeyState, iteration, senderKey, ciphertext, senderKeyMessage;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.senderKeyStore.loadSenderKey(this.senderKeyName)];
                                    case 1:
                                        record = _a.sent();
                                        if (!record) {
                                            throw new Error('No SenderKeyRecord found for encryption');
                                        }
                                        senderKeyState = record.getSenderKeyState();
                                        if (!senderKeyState) {
                                            throw new Error('No session to encrypt message');
                                        }
                                        iteration = senderKeyState.getSenderChainKey().getIteration();
                                        senderKey = this.getSenderKey(senderKeyState, iteration === 0 ? 0 : iteration + 1);
                                        return [4 /*yield*/, this.getCipherText(senderKey.getIv(), senderKey.getCipherKey(), paddedPlaintext)];
                                    case 2:
                                        ciphertext = _a.sent();
                                        senderKeyMessage = new sender_key_message_1.SenderKeyMessage(senderKeyState.getKeyId(), senderKey.getIteration(), ciphertext, senderKeyState.getSigningKeyPrivate());
                                        return [4 /*yield*/, this.senderKeyStore.storeSenderKey(this.senderKeyName, record)];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, senderKeyMessage.serialize()];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GroupCipher.prototype.decrypt = function (senderKeyMessageBytes) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.queueJob(function () { return __awaiter(_this, void 0, void 0, function () {
                            var record, senderKeyMessage, senderKeyState, senderKey, plaintext;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.senderKeyStore.loadSenderKey(this.senderKeyName)];
                                    case 1:
                                        record = _a.sent();
                                        if (!record) {
                                            throw new Error('No SenderKeyRecord found for decryption');
                                        }
                                        senderKeyMessage = new sender_key_message_1.SenderKeyMessage(null, null, null, null, senderKeyMessageBytes);
                                        senderKeyState = record.getSenderKeyState(senderKeyMessage.getKeyId());
                                        if (!senderKeyState) {
                                            throw new Error('No session found to decrypt message');
                                        }
                                        senderKeyMessage.verifySignature(senderKeyState.getSigningKeyPublic());
                                        senderKey = this.getSenderKey(senderKeyState, senderKeyMessage.getIteration());
                                        return [4 /*yield*/, this.getPlainText(senderKey.getIv(), senderKey.getCipherKey(), senderKeyMessage.getCipherText())];
                                    case 2:
                                        plaintext = _a.sent();
                                        return [4 /*yield*/, this.senderKeyStore.storeSenderKey(this.senderKeyName, record)];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, plaintext];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GroupCipher.prototype.getSenderKey = function (senderKeyState, iteration) {
        var senderChainKey = senderKeyState.getSenderChainKey();
        if (senderChainKey.getIteration() > iteration) {
            if (senderKeyState.hasSenderMessageKey(iteration)) {
                var messageKey = senderKeyState.removeSenderMessageKey(iteration);
                if (!messageKey) {
                    throw new Error('No sender message key found for iteration');
                }
                return messageKey;
            }
            throw new Error("Received message with old counter: ".concat(senderChainKey.getIteration(), ", ").concat(iteration));
        }
        if (iteration - senderChainKey.getIteration() > 2000) {
            throw new Error('Over 2000 messages into the future!');
        }
        while (senderChainKey.getIteration() < iteration) {
            senderKeyState.addSenderMessageKey(senderChainKey.getSenderMessageKey());
            senderChainKey = senderChainKey.getNext();
        }
        senderKeyState.setSenderChainKey(senderChainKey.getNext());
        return senderChainKey.getSenderMessageKey();
    };
    GroupCipher.prototype.getPlainText = function (iv, key, ciphertext) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, (0, crypto_1.decrypt)(key, ciphertext, iv)];
                }
                catch (e) {
                    throw new Error('InvalidMessageException');
                }
                return [2 /*return*/];
            });
        });
    };
    GroupCipher.prototype.getCipherText = function (iv, key, plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var ivBuffer, keyBuffer, plaintextBuffer;
            return __generator(this, function (_a) {
                try {
                    ivBuffer = typeof iv === 'string' ? Buffer.from(iv, 'base64') : iv;
                    keyBuffer = typeof key === 'string' ? Buffer.from(key, 'base64') : key;
                    plaintextBuffer = typeof plaintext === 'string' ? Buffer.from(plaintext) : plaintext;
                    return [2 /*return*/, (0, crypto_1.encrypt)(keyBuffer, plaintextBuffer, ivBuffer)];
                }
                catch (e) {
                    throw new Error('InvalidMessageException');
                }
                return [2 /*return*/];
            });
        });
    };
    return GroupCipher;
}());
exports.GroupCipher = GroupCipher;
//# sourceMappingURL=group_cipher.js.map