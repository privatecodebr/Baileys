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
exports.makeLibSignalRepository = makeLibSignalRepository;
/* @ts-ignore */
var libsignal = require("libsignal");
var Utils_1 = require("../Utils/index.js");
var WABinary_1 = require("../WABinary/index.js");
var sender_key_name_1 = require("./Group/sender-key-name.js");
var sender_key_record_1 = require("./Group/sender-key-record.js");
var Group_1 = require("./Group/index.js");
function makeLibSignalRepository(auth) {
    var storage = signalStorage(auth);
    return {
        decryptGroupMessage: function (_a) {
            var group = _a.group, authorJid = _a.authorJid, msg = _a.msg;
            var senderName = jidToSignalSenderKeyName(group, authorJid);
            var cipher = new Group_1.GroupCipher(storage, senderName);
            return cipher.decrypt(msg);
        },
        processSenderKeyDistributionMessage: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var builder, senderName, senderMsg, senderNameStr, _c, _d, senderKey;
                var item = _b.item, authorJid = _b.authorJid;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            builder = new Group_1.GroupSessionBuilder(storage);
                            if (!item.groupId) {
                                throw new Error('Group ID is required for sender key distribution message');
                            }
                            senderName = jidToSignalSenderKeyName(item.groupId, authorJid);
                            senderMsg = new Group_1.SenderKeyDistributionMessage(null, null, null, null, item.axolotlSenderKeyDistributionMessage);
                            senderNameStr = senderName.toString();
                            return [4 /*yield*/, auth.keys.get('sender-key', [senderNameStr])];
                        case 1:
                            _c = _e.sent(), _d = senderNameStr, senderKey = _c[_d];
                            if (!!senderKey) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage.storeSenderKey(senderName, new sender_key_record_1.SenderKeyRecord())];
                        case 2:
                            _e.sent();
                            _e.label = 3;
                        case 3: return [4 /*yield*/, builder.process(senderName, senderMsg)];
                        case 4:
                            _e.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        decryptMessage: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var addr, session, result, _c;
                var jid = _b.jid, type = _b.type, ciphertext = _b.ciphertext;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            addr = jidToSignalProtocolAddress(jid);
                            session = new libsignal.SessionCipher(storage, addr);
                            _c = type;
                            switch (_c) {
                                case 'pkmsg': return [3 /*break*/, 1];
                                case 'msg': return [3 /*break*/, 3];
                            }
                            return [3 /*break*/, 5];
                        case 1: return [4 /*yield*/, session.decryptPreKeyWhisperMessage(ciphertext)];
                        case 2:
                            result = _d.sent();
                            return [3 /*break*/, 6];
                        case 3: return [4 /*yield*/, session.decryptWhisperMessage(ciphertext)];
                        case 4:
                            result = _d.sent();
                            return [3 /*break*/, 6];
                        case 5: throw new Error("Unknown message type: ".concat(type));
                        case 6: return [2 /*return*/, result];
                    }
                });
            });
        },
        encryptMessage: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var addr, cipher, _c, sigType, body, type;
                var jid = _b.jid, data = _b.data;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            addr = jidToSignalProtocolAddress(jid);
                            cipher = new libsignal.SessionCipher(storage, addr);
                            return [4 /*yield*/, cipher.encrypt(data)];
                        case 1:
                            _c = _d.sent(), sigType = _c.type, body = _c.body;
                            type = sigType === 3 ? 'pkmsg' : 'msg';
                            return [2 /*return*/, { type: type, ciphertext: Buffer.from(body, 'binary') }];
                    }
                });
            });
        },
        encryptGroupMessage: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var senderName, builder, senderNameStr, _c, _d, senderKey, senderKeyDistributionMessage, session, ciphertext;
                var group = _b.group, meId = _b.meId, data = _b.data;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            senderName = jidToSignalSenderKeyName(group, meId);
                            builder = new Group_1.GroupSessionBuilder(storage);
                            senderNameStr = senderName.toString();
                            return [4 /*yield*/, auth.keys.get('sender-key', [senderNameStr])];
                        case 1:
                            _c = _e.sent(), _d = senderNameStr, senderKey = _c[_d];
                            if (!!senderKey) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage.storeSenderKey(senderName, new sender_key_record_1.SenderKeyRecord())];
                        case 2:
                            _e.sent();
                            _e.label = 3;
                        case 3: return [4 /*yield*/, builder.create(senderName)];
                        case 4:
                            senderKeyDistributionMessage = _e.sent();
                            session = new Group_1.GroupCipher(storage, senderName);
                            return [4 /*yield*/, session.encrypt(data)];
                        case 5:
                            ciphertext = _e.sent();
                            return [2 /*return*/, {
                                    ciphertext: ciphertext,
                                    senderKeyDistributionMessage: senderKeyDistributionMessage.serialize()
                                }];
                    }
                });
            });
        },
        injectE2ESession: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var cipher;
                var jid = _b.jid, session = _b.session;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cipher = new libsignal.SessionBuilder(storage, jidToSignalProtocolAddress(jid));
                            return [4 /*yield*/, cipher.initOutgoing(session)];
                        case 1:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        jidToSignalProtocolAddress: function (jid) {
            return jidToSignalProtocolAddress(jid).toString();
        }
    };
}
var jidToSignalProtocolAddress = function (jid) {
    var _a = (0, WABinary_1.jidDecode)(jid), user = _a.user, device = _a.device;
    return new libsignal.ProtocolAddress(user, device || 0);
};
var jidToSignalSenderKeyName = function (group, user) {
    return new sender_key_name_1.SenderKeyName(group, jidToSignalProtocolAddress(user));
};
function signalStorage(_a) {
    var _this = this;
    var creds = _a.creds, keys = _a.keys;
    return {
        loadSession: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, sess;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, keys.get('session', [id])];
                    case 1:
                        _a = _c.sent(), _b = id, sess = _a[_b];
                        if (sess) {
                            return [2 /*return*/, libsignal.SessionRecord.deserialize(sess)];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        // TODO: Replace with libsignal.SessionRecord when type exports are added to libsignal
        storeSession: function (id, session) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, keys.set({ session: (_a = {}, _a[id] = session.serialize(), _a) })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        isTrustedIdentity: function () {
            return true;
        },
        loadPreKey: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var keyId, _a, _b, key;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        keyId = id.toString();
                        return [4 /*yield*/, keys.get('pre-key', [keyId])];
                    case 1:
                        _a = _c.sent(), _b = keyId, key = _a[_b];
                        if (key) {
                            return [2 /*return*/, {
                                    privKey: Buffer.from(key.private),
                                    pubKey: Buffer.from(key.public)
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        removePreKey: function (id) {
            var _a;
            return keys.set({ 'pre-key': (_a = {}, _a[id] = null, _a) });
        },
        loadSignedPreKey: function () {
            var key = creds.signedPreKey;
            return {
                privKey: Buffer.from(key.keyPair.private),
                pubKey: Buffer.from(key.keyPair.public)
            };
        },
        loadSenderKey: function (senderKeyName) { return __awaiter(_this, void 0, void 0, function () {
            var keyId, _a, _b, key;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        keyId = senderKeyName.toString();
                        return [4 /*yield*/, keys.get('sender-key', [keyId])];
                    case 1:
                        _a = _c.sent(), _b = keyId, key = _a[_b];
                        if (key) {
                            return [2 /*return*/, sender_key_record_1.SenderKeyRecord.deserialize(key)];
                        }
                        return [2 /*return*/, new sender_key_record_1.SenderKeyRecord()];
                }
            });
        }); },
        storeSenderKey: function (senderKeyName, key) { return __awaiter(_this, void 0, void 0, function () {
            var keyId, serialized;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        keyId = senderKeyName.toString();
                        serialized = JSON.stringify(key.serialize());
                        return [4 /*yield*/, keys.set({ 'sender-key': (_a = {}, _a[keyId] = Buffer.from(serialized, 'utf-8'), _a) })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        getOurRegistrationId: function () { return creds.registrationId; },
        getOurIdentity: function () {
            var signedIdentityKey = creds.signedIdentityKey;
            return {
                privKey: Buffer.from(signedIdentityKey.private),
                pubKey: (0, Utils_1.generateSignalPubKey)(signedIdentityKey.public)
            };
        }
    };
}
//# sourceMappingURL=libsignal.js.map