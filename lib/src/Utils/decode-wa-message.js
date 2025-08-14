"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.decryptMessageNode = exports.NACK_REASONS = exports.MISSING_KEYS_ERROR_TEXT = exports.NO_MESSAGE_FOUND_ERROR_TEXT = void 0;
exports.decodeMessageNode = decodeMessageNode;
var boom_1 = require("@hapi/boom");
var index_js_1 = require("../../WAProto/index.js");
var WABinary_1 = require("../WABinary/index.js");
var generics_1 = require("./generics.js");
exports.NO_MESSAGE_FOUND_ERROR_TEXT = 'Message absent from node';
exports.MISSING_KEYS_ERROR_TEXT = 'Key used already or never filled';
exports.NACK_REASONS = {
    ParsingError: 487,
    UnrecognizedStanza: 488,
    UnrecognizedStanzaClass: 489,
    UnrecognizedStanzaType: 490,
    InvalidProtobuf: 491,
    InvalidHostedCompanionStanza: 493,
    MissingMessageSecret: 495,
    SignalErrorOldCounter: 496,
    MessageDeletedOnPeer: 499,
    UnhandledError: 500,
    UnsupportedAdminRevoke: 550,
    UnsupportedLIDGroup: 551,
    DBOperationFailed: 552
};
/**
 * Decode the received node as a message.
 * @note this will only parse the message, not decrypt it
 */
function decodeMessageNode(stanza, meId, meLid) {
    var _a, _b, _c, _d, _e;
    var msgType;
    var chatId;
    var author;
    var msgId = stanza.attrs.id;
    var from = stanza.attrs.from;
    var participant = stanza.attrs.participant;
    var recipient = stanza.attrs.recipient;
    var isMe = function (jid) { return (0, WABinary_1.areJidsSameUser)(jid, meId); };
    var isMeLid = function (jid) { return (0, WABinary_1.areJidsSameUser)(jid, meLid); };
    if ((0, WABinary_1.isJidUser)(from) || (0, WABinary_1.isLidUser)(from)) {
        if (recipient && !(0, WABinary_1.isJidMetaIa)(recipient)) {
            if (!isMe(from) && !isMeLid(from)) {
                throw new boom_1.Boom('receipient present, but msg not from me', { data: stanza });
            }
            chatId = recipient;
        }
        else {
            chatId = from;
        }
        msgType = 'chat';
        author = from;
    }
    else if ((0, WABinary_1.isJidGroup)(from)) {
        if (!participant) {
            throw new boom_1.Boom('No participant in group message');
        }
        msgType = 'group';
        author = participant;
        chatId = from;
    }
    else if ((0, WABinary_1.isJidBroadcast)(from)) {
        if (!participant) {
            throw new boom_1.Boom('No participant in group message');
        }
        var isParticipantMe = isMe(participant);
        if ((0, WABinary_1.isJidStatusBroadcast)(from)) {
            msgType = isParticipantMe ? 'direct_peer_status' : 'other_status';
        }
        else {
            msgType = isParticipantMe ? 'peer_broadcast' : 'other_broadcast';
        }
        chatId = from;
        author = participant;
    }
    else if ((0, WABinary_1.isJidNewsletter)(from)) {
        msgType = 'newsletter';
        chatId = from;
        author = from;
    }
    else {
        throw new boom_1.Boom('Unknown message type', { data: stanza });
    }
    var fromMe = ((0, WABinary_1.isLidUser)(from) ? isMeLid : isMe)((stanza.attrs.participant || stanza.attrs.from));
    var pushname = (_a = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _a === void 0 ? void 0 : _a.notify;
    var key = __assign({ remoteJid: chatId, fromMe: fromMe, id: msgId, senderLid: (_b = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _b === void 0 ? void 0 : _b.sender_lid, senderPn: (_c = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _c === void 0 ? void 0 : _c.sender_pn, participant: participant, participantPn: (_d = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _d === void 0 ? void 0 : _d.participant_pn, participantLid: (_e = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _e === void 0 ? void 0 : _e.participant_lid }, (msgType === 'newsletter' && stanza.attrs.server_id ? { server_id: stanza.attrs.server_id } : {}));
    var fullMessage = {
        key: key,
        messageTimestamp: +stanza.attrs.t,
        pushName: pushname,
        broadcast: (0, WABinary_1.isJidBroadcast)(from)
    };
    if (key.fromMe) {
        fullMessage.status = index_js_1.proto.WebMessageInfo.Status.SERVER_ACK;
    }
    return {
        fullMessage: fullMessage,
        author: author,
        sender: msgType === 'chat' ? author : chatId
    };
}
var decryptMessageNode = function (stanza, meId, meLid, repository, logger) {
    var _a = decodeMessageNode(stanza, meId, meLid), fullMessage = _a.fullMessage, author = _a.author, sender = _a.sender;
    return {
        fullMessage: fullMessage,
        category: stanza.attrs.category,
        author: author,
        decrypt: function () {
            return __awaiter(this, void 0, void 0, function () {
                var decryptables, _i, _a, _b, tag, attrs, content, cert, details, msgBuffer, e2eType, _c, user, msg, err_1, err_2;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            decryptables = 0;
                            if (!Array.isArray(stanza.content)) return [3 /*break*/, 16];
                            _i = 0, _a = stanza.content;
                            _e.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 16];
                            _b = _a[_i], tag = _b.tag, attrs = _b.attrs, content = _b.content;
                            if (tag === 'verified_name' && content instanceof Uint8Array) {
                                cert = index_js_1.proto.VerifiedNameCertificate.decode(content);
                                details = index_js_1.proto.VerifiedNameCertificate.Details.decode(cert.details);
                                fullMessage.verifiedBizName = details.verifiedName;
                            }
                            if (tag === 'unavailable' && attrs.type === 'view_once') {
                                fullMessage.key.isViewOnce = true;
                            }
                            if (tag !== 'enc' && tag !== 'plaintext') {
                                return [3 /*break*/, 15];
                            }
                            if (!(content instanceof Uint8Array)) {
                                return [3 /*break*/, 15];
                            }
                            decryptables += 1;
                            msgBuffer = void 0;
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 14, , 15]);
                            e2eType = tag === 'plaintext' ? 'plaintext' : attrs.type;
                            _c = e2eType;
                            switch (_c) {
                                case 'skmsg': return [3 /*break*/, 3];
                                case 'pkmsg': return [3 /*break*/, 5];
                                case 'msg': return [3 /*break*/, 5];
                                case 'plaintext': return [3 /*break*/, 7];
                            }
                            return [3 /*break*/, 8];
                        case 3: return [4 /*yield*/, repository.decryptGroupMessage({
                                group: sender,
                                authorJid: author,
                                msg: content
                            })];
                        case 4:
                            msgBuffer = _e.sent();
                            return [3 /*break*/, 9];
                        case 5:
                            user = (0, WABinary_1.isJidUser)(sender) ? sender : author;
                            return [4 /*yield*/, repository.decryptMessage({
                                    jid: user,
                                    type: e2eType,
                                    ciphertext: content
                                })];
                        case 6:
                            msgBuffer = _e.sent();
                            return [3 /*break*/, 9];
                        case 7:
                            msgBuffer = content;
                            return [3 /*break*/, 9];
                        case 8: throw new Error("Unknown e2e type: ".concat(e2eType));
                        case 9:
                            msg = index_js_1.proto.Message.decode(e2eType !== 'plaintext' ? (0, generics_1.unpadRandomMax16)(msgBuffer) : msgBuffer);
                            msg = ((_d = msg.deviceSentMessage) === null || _d === void 0 ? void 0 : _d.message) || msg;
                            if (!msg.senderKeyDistributionMessage) return [3 /*break*/, 13];
                            _e.label = 10;
                        case 10:
                            _e.trys.push([10, 12, , 13]);
                            return [4 /*yield*/, repository.processSenderKeyDistributionMessage({
                                    authorJid: author,
                                    item: msg.senderKeyDistributionMessage
                                })];
                        case 11:
                            _e.sent();
                            return [3 /*break*/, 13];
                        case 12:
                            err_1 = _e.sent();
                            logger.error({ key: fullMessage.key, err: err_1 }, 'failed to decrypt message');
                            return [3 /*break*/, 13];
                        case 13:
                            if (fullMessage.message) {
                                Object.assign(fullMessage.message, msg);
                            }
                            else {
                                fullMessage.message = msg;
                            }
                            return [3 /*break*/, 15];
                        case 14:
                            err_2 = _e.sent();
                            logger.error({ key: fullMessage.key, err: err_2 }, 'failed to decrypt message');
                            fullMessage.messageStubType = index_js_1.proto.WebMessageInfo.StubType.CIPHERTEXT;
                            fullMessage.messageStubParameters = [err_2.message];
                            return [3 /*break*/, 15];
                        case 15:
                            _i++;
                            return [3 /*break*/, 1];
                        case 16:
                            // if nothing was found to decrypt
                            if (!decryptables) {
                                fullMessage.messageStubType = index_js_1.proto.WebMessageInfo.StubType.CIPHERTEXT;
                                fullMessage.messageStubParameters = [exports.NO_MESSAGE_FOUND_ERROR_TEXT];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
    };
};
exports.decryptMessageNode = decryptMessageNode;
//# sourceMappingURL=decode-wa-message.js.map