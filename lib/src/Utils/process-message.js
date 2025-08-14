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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatId = exports.shouldIncrementChatUnread = exports.isRealMessage = exports.cleanMessage = void 0;
exports.decryptPollVote = decryptPollVote;
var index_js_1 = require("../../WAProto/index.js");
var Types_1 = require("../Types/index.js");
var messages_1 = require("../Utils/messages.js");
var WABinary_1 = require("../WABinary/index.js");
var crypto_1 = require("./crypto.js");
var generics_1 = require("./generics.js");
var history_1 = require("./history.js");
var REAL_MSG_STUB_TYPES = new Set([
    Types_1.WAMessageStubType.CALL_MISSED_GROUP_VIDEO,
    Types_1.WAMessageStubType.CALL_MISSED_GROUP_VOICE,
    Types_1.WAMessageStubType.CALL_MISSED_VIDEO,
    Types_1.WAMessageStubType.CALL_MISSED_VOICE
]);
var REAL_MSG_REQ_ME_STUB_TYPES = new Set([Types_1.WAMessageStubType.GROUP_PARTICIPANT_ADD]);
/** Cleans a received message to further processing */
var cleanMessage = function (message, meId) {
    // ensure remoteJid and participant doesn't have device or agent in it
    message.key.remoteJid = (0, WABinary_1.jidNormalizedUser)(message.key.remoteJid);
    message.key.participant = message.key.participant ? (0, WABinary_1.jidNormalizedUser)(message.key.participant) : undefined;
    var content = (0, messages_1.normalizeMessageContent)(message.message);
    // if the message has a reaction, ensure fromMe & remoteJid are from our perspective
    if (content === null || content === void 0 ? void 0 : content.reactionMessage) {
        normaliseKey(content.reactionMessage.key);
    }
    if (content === null || content === void 0 ? void 0 : content.pollUpdateMessage) {
        normaliseKey(content.pollUpdateMessage.pollCreationMessageKey);
    }
    function normaliseKey(msgKey) {
        // if the reaction is from another user
        // we've to correctly map the key to this user's perspective
        if (!message.key.fromMe) {
            // if the sender believed the message being reacted to is not from them
            // we've to correct the key to be from them, or some other participant
            msgKey.fromMe = !msgKey.fromMe
                ? (0, WABinary_1.areJidsSameUser)(msgKey.participant || msgKey.remoteJid, meId)
                : // if the message being reacted to, was from them
                    // fromMe automatically becomes false
                    false;
            // set the remoteJid to being the same as the chat the message came from
            msgKey.remoteJid = message.key.remoteJid;
            // set participant of the message
            msgKey.participant = msgKey.participant || message.key.participant;
        }
    }
};
exports.cleanMessage = cleanMessage;
var isRealMessage = function (message, meId) {
    var _a;
    var normalizedContent = (0, messages_1.normalizeMessageContent)(message.message);
    var hasSomeContent = !!(0, messages_1.getContentType)(normalizedContent);
    return ((!!normalizedContent ||
        REAL_MSG_STUB_TYPES.has(message.messageStubType) ||
        (REAL_MSG_REQ_ME_STUB_TYPES.has(message.messageStubType) &&
            ((_a = message.messageStubParameters) === null || _a === void 0 ? void 0 : _a.some(function (p) { return (0, WABinary_1.areJidsSameUser)(meId, p); })))) &&
        hasSomeContent &&
        !(normalizedContent === null || normalizedContent === void 0 ? void 0 : normalizedContent.protocolMessage) &&
        !(normalizedContent === null || normalizedContent === void 0 ? void 0 : normalizedContent.reactionMessage) &&
        !(normalizedContent === null || normalizedContent === void 0 ? void 0 : normalizedContent.pollUpdateMessage));
};
exports.isRealMessage = isRealMessage;
var shouldIncrementChatUnread = function (message) {
    return !message.key.fromMe && !message.messageStubType;
};
exports.shouldIncrementChatUnread = shouldIncrementChatUnread;
/**
 * Get the ID of the chat from the given key.
 * Typically -- that'll be the remoteJid, but for broadcasts, it'll be the participant
 */
var getChatId = function (_a) {
    var remoteJid = _a.remoteJid, participant = _a.participant, fromMe = _a.fromMe;
    if ((0, WABinary_1.isJidBroadcast)(remoteJid) && !(0, WABinary_1.isJidStatusBroadcast)(remoteJid) && !fromMe) {
        return participant;
    }
    return remoteJid;
};
exports.getChatId = getChatId;
/**
 * Decrypt a poll vote
 * @param vote encrypted vote
 * @param ctx additional info about the poll required for decryption
 * @returns list of SHA256 options
 */
function decryptPollVote(_a, _b) {
    var encPayload = _a.encPayload, encIv = _a.encIv;
    var pollCreatorJid = _b.pollCreatorJid, pollMsgId = _b.pollMsgId, pollEncKey = _b.pollEncKey, voterJid = _b.voterJid;
    var sign = Buffer.concat([
        toBinary(pollMsgId),
        toBinary(pollCreatorJid),
        toBinary(voterJid),
        toBinary('Poll Vote'),
        new Uint8Array([1])
    ]);
    var key0 = (0, crypto_1.hmacSign)(pollEncKey, new Uint8Array(32), 'sha256');
    var decKey = (0, crypto_1.hmacSign)(sign, key0, 'sha256');
    var aad = toBinary("".concat(pollMsgId, "\0").concat(voterJid));
    var decrypted = (0, crypto_1.aesDecryptGCM)(encPayload, decKey, encIv, aad);
    return index_js_1.proto.Message.PollVoteMessage.decode(decrypted);
    function toBinary(txt) {
        return Buffer.from(txt);
    }
}
var processMessage = function (message_1, _a) { return __awaiter(void 0, [message_1, _a], void 0, function (message, _b) {
    var meId, accountSettings, chat, isRealMsg, content, protocolMsg, _c, histNotification, process_1, isLatest, data, keys_1, newAppStateSyncKeyId_1, response_1, peerDataOperationResult, _loop_1, _i, _d, result, reaction, jid_1, participants_1, emitParticipantsUpdate, emitGroupUpdate, emitGroupRequestJoin, participantsIncludesMe, announceValue, restrictValue, name_1, description, code, memberAddValue, approvalMode, participant, action, method;
    var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    var shouldProcessHistoryMsg = _b.shouldProcessHistoryMsg, placeholderResendCache = _b.placeholderResendCache, ev = _b.ev, creds = _b.creds, keyStore = _b.keyStore, logger = _b.logger, options = _b.options;
    return __generator(this, function (_w) {
        switch (_w.label) {
            case 0:
                meId = creds.me.id;
                accountSettings = creds.accountSettings;
                chat = { id: (0, WABinary_1.jidNormalizedUser)((0, exports.getChatId)(message.key)) };
                isRealMsg = (0, exports.isRealMessage)(message, meId);
                if (isRealMsg) {
                    chat.messages = [{ message: message }];
                    chat.conversationTimestamp = (0, generics_1.toNumber)(message.messageTimestamp);
                    // only increment unread count if not CIPHERTEXT and from another person
                    if ((0, exports.shouldIncrementChatUnread)(message)) {
                        chat.unreadCount = (chat.unreadCount || 0) + 1;
                    }
                }
                content = (0, messages_1.normalizeMessageContent)(message.message);
                // unarchive chat if it's a real message, or someone reacted to our message
                // and we've the unarchive chats setting on
                if ((isRealMsg || ((_f = (_e = content === null || content === void 0 ? void 0 : content.reactionMessage) === null || _e === void 0 ? void 0 : _e.key) === null || _f === void 0 ? void 0 : _f.fromMe)) && (accountSettings === null || accountSettings === void 0 ? void 0 : accountSettings.unarchiveChats)) {
                    chat.archived = false;
                    chat.readOnly = false;
                }
                protocolMsg = content === null || content === void 0 ? void 0 : content.protocolMessage;
                if (!protocolMsg) return [3 /*break*/, 13];
                _c = protocolMsg.type;
                switch (_c) {
                    case index_js_1.proto.Message.ProtocolMessage.Type.HISTORY_SYNC_NOTIFICATION: return [3 /*break*/, 1];
                    case index_js_1.proto.Message.ProtocolMessage.Type.APP_STATE_SYNC_KEY_SHARE: return [3 /*break*/, 4];
                    case index_js_1.proto.Message.ProtocolMessage.Type.REVOKE: return [3 /*break*/, 8];
                    case index_js_1.proto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING: return [3 /*break*/, 9];
                    case index_js_1.proto.Message.ProtocolMessage.Type.PEER_DATA_OPERATION_REQUEST_RESPONSE_MESSAGE: return [3 /*break*/, 10];
                    case index_js_1.proto.Message.ProtocolMessage.Type.MESSAGE_EDIT: return [3 /*break*/, 11];
                }
                return [3 /*break*/, 12];
            case 1:
                histNotification = protocolMsg.historySyncNotification;
                process_1 = shouldProcessHistoryMsg;
                isLatest = !((_g = creds.processedHistoryMessages) === null || _g === void 0 ? void 0 : _g.length);
                logger === null || logger === void 0 ? void 0 : logger.info({
                    histNotification: histNotification,
                    process: process_1,
                    id: message.key.id,
                    isLatest: isLatest
                }, 'got history notification');
                if (!process_1) return [3 /*break*/, 3];
                if (histNotification.syncType !== index_js_1.proto.HistorySync.HistorySyncType.ON_DEMAND) {
                    ev.emit('creds.update', {
                        processedHistoryMessages: __spreadArray(__spreadArray([], (creds.processedHistoryMessages || []), true), [
                            { key: message.key, messageTimestamp: message.messageTimestamp }
                        ], false)
                    });
                }
                return [4 /*yield*/, (0, history_1.downloadAndProcessHistorySyncNotification)(histNotification, options)];
            case 2:
                data = _w.sent();
                ev.emit('messaging-history.set', __assign(__assign({}, data), { isLatest: histNotification.syncType !== index_js_1.proto.HistorySync.HistorySyncType.ON_DEMAND ? isLatest : undefined, peerDataRequestSessionId: histNotification.peerDataRequestSessionId }));
                _w.label = 3;
            case 3: return [3 /*break*/, 12];
            case 4:
                keys_1 = protocolMsg.appStateSyncKeyShare.keys;
                if (!(keys_1 === null || keys_1 === void 0 ? void 0 : keys_1.length)) return [3 /*break*/, 6];
                newAppStateSyncKeyId_1 = '';
                return [4 /*yield*/, keyStore.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var newKeys, _i, keys_2, _a, keyData, keyId, strKeyId;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    newKeys = [];
                                    _i = 0, keys_2 = keys_1;
                                    _c.label = 1;
                                case 1:
                                    if (!(_i < keys_2.length)) return [3 /*break*/, 4];
                                    _a = keys_2[_i], keyData = _a.keyData, keyId = _a.keyId;
                                    strKeyId = Buffer.from(keyId.keyId).toString('base64');
                                    newKeys.push(strKeyId);
                                    return [4 /*yield*/, keyStore.set({ 'app-state-sync-key': (_b = {}, _b[strKeyId] = keyData, _b) })];
                                case 2:
                                    _c.sent();
                                    newAppStateSyncKeyId_1 = strKeyId;
                                    _c.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    logger === null || logger === void 0 ? void 0 : logger.info({ newAppStateSyncKeyId: newAppStateSyncKeyId_1, newKeys: newKeys }, 'injecting new app state sync keys');
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 5:
                _w.sent();
                ev.emit('creds.update', { myAppStateKeyId: newAppStateSyncKeyId_1 });
                return [3 /*break*/, 7];
            case 6:
                logger === null || logger === void 0 ? void 0 : logger.info({ protocolMsg: protocolMsg }, 'recv app state sync with 0 keys');
                _w.label = 7;
            case 7: return [3 /*break*/, 12];
            case 8:
                ev.emit('messages.update', [
                    {
                        key: __assign(__assign({}, message.key), { id: protocolMsg.key.id }),
                        update: { message: null, messageStubType: Types_1.WAMessageStubType.REVOKE, key: message.key }
                    }
                ]);
                return [3 /*break*/, 12];
            case 9:
                Object.assign(chat, {
                    ephemeralSettingTimestamp: (0, generics_1.toNumber)(message.messageTimestamp),
                    ephemeralExpiration: protocolMsg.ephemeralExpiration || null
                });
                return [3 /*break*/, 12];
            case 10:
                response_1 = protocolMsg.peerDataOperationRequestResponseMessage;
                if (response_1) {
                    placeholderResendCache === null || placeholderResendCache === void 0 ? void 0 : placeholderResendCache.del(response_1.stanzaId);
                    peerDataOperationResult = response_1.peerDataOperationResult;
                    _loop_1 = function (result) {
                        var retryResponse = result.placeholderMessageResendResponse;
                        //eslint-disable-next-line max-depth
                        if (retryResponse) {
                            var webMessageInfo_1 = index_js_1.proto.WebMessageInfo.decode(retryResponse.webMessageInfoBytes);
                            // wait till another upsert event is available, don't want it to be part of the PDO response message
                            setTimeout(function () {
                                ev.emit('messages.upsert', {
                                    messages: [webMessageInfo_1],
                                    type: 'notify',
                                    requestId: response_1.stanzaId
                                });
                            }, 500);
                        }
                    };
                    for (_i = 0, _d = peerDataOperationResult; _i < _d.length; _i++) {
                        result = _d[_i];
                        _loop_1(result);
                    }
                }
                return [3 /*break*/, 12];
            case 11:
                ev.emit('messages.update', [
                    {
                        // flip the sender / fromMe properties because they're in the perspective of the sender
                        key: __assign(__assign({}, message.key), { id: (_h = protocolMsg.key) === null || _h === void 0 ? void 0 : _h.id }),
                        update: {
                            message: {
                                editedMessage: {
                                    message: protocolMsg.editedMessage
                                }
                            },
                            messageTimestamp: protocolMsg.timestampMs
                                ? Math.floor((0, generics_1.toNumber)(protocolMsg.timestampMs) / 1000)
                                : message.messageTimestamp
                        }
                    }
                ]);
                return [3 /*break*/, 12];
            case 12: return [3 /*break*/, 14];
            case 13:
                if (content === null || content === void 0 ? void 0 : content.reactionMessage) {
                    reaction = __assign(__assign({}, content.reactionMessage), { key: message.key });
                    ev.emit('messages.reaction', [
                        {
                            reaction: reaction,
                            key: (_j = content.reactionMessage) === null || _j === void 0 ? void 0 : _j.key
                        }
                    ]);
                }
                else if (message.messageStubType) {
                    jid_1 = (_k = message.key) === null || _k === void 0 ? void 0 : _k.remoteJid;
                    emitParticipantsUpdate = function (action) {
                        return ev.emit('group-participants.update', { id: jid_1, author: message.participant, participants: participants_1, action: action });
                    };
                    emitGroupUpdate = function (update) {
                        var _a;
                        ev.emit('groups.update', [__assign(__assign({ id: jid_1 }, update), { author: (_a = message.participant) !== null && _a !== void 0 ? _a : undefined })]);
                    };
                    emitGroupRequestJoin = function (participant, action, method) {
                        ev.emit('group.join-request', { id: jid_1, author: message.participant, participant: participant, action: action, method: method });
                    };
                    participantsIncludesMe = function () { return participants_1.find(function (jid) { return (0, WABinary_1.areJidsSameUser)(meId, jid); }); };
                    switch (message.messageStubType) {
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_CHANGE_NUMBER:
                            participants_1 = message.messageStubParameters || [];
                            emitParticipantsUpdate('modify');
                            break;
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
                            participants_1 = message.messageStubParameters || [];
                            emitParticipantsUpdate('remove');
                            // mark the chat read only if you left the group
                            if (participantsIncludesMe()) {
                                chat.readOnly = true;
                            }
                            break;
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_ADD:
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_INVITE:
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_ADD_REQUEST_JOIN:
                            participants_1 = message.messageStubParameters || [];
                            if (participantsIncludesMe()) {
                                chat.readOnly = false;
                            }
                            emitParticipantsUpdate('add');
                            break;
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_DEMOTE:
                            participants_1 = message.messageStubParameters || [];
                            emitParticipantsUpdate('demote');
                            break;
                        case Types_1.WAMessageStubType.GROUP_PARTICIPANT_PROMOTE:
                            participants_1 = message.messageStubParameters || [];
                            emitParticipantsUpdate('promote');
                            break;
                        case Types_1.WAMessageStubType.GROUP_CHANGE_ANNOUNCE:
                            announceValue = (_l = message.messageStubParameters) === null || _l === void 0 ? void 0 : _l[0];
                            emitGroupUpdate({ announce: announceValue === 'true' || announceValue === 'on' });
                            break;
                        case Types_1.WAMessageStubType.GROUP_CHANGE_RESTRICT:
                            restrictValue = (_m = message.messageStubParameters) === null || _m === void 0 ? void 0 : _m[0];
                            emitGroupUpdate({ restrict: restrictValue === 'true' || restrictValue === 'on' });
                            break;
                        case Types_1.WAMessageStubType.GROUP_CHANGE_SUBJECT:
                            name_1 = (_o = message.messageStubParameters) === null || _o === void 0 ? void 0 : _o[0];
                            chat.name = name_1;
                            emitGroupUpdate({ subject: name_1 });
                            break;
                        case Types_1.WAMessageStubType.GROUP_CHANGE_DESCRIPTION:
                            description = (_p = message.messageStubParameters) === null || _p === void 0 ? void 0 : _p[0];
                            chat.description = description;
                            emitGroupUpdate({ desc: description });
                            break;
                        case Types_1.WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
                            code = (_q = message.messageStubParameters) === null || _q === void 0 ? void 0 : _q[0];
                            emitGroupUpdate({ inviteCode: code });
                            break;
                        case Types_1.WAMessageStubType.GROUP_MEMBER_ADD_MODE:
                            memberAddValue = (_r = message.messageStubParameters) === null || _r === void 0 ? void 0 : _r[0];
                            emitGroupUpdate({ memberAddMode: memberAddValue === 'all_member_add' });
                            break;
                        case Types_1.WAMessageStubType.GROUP_MEMBERSHIP_JOIN_APPROVAL_MODE:
                            approvalMode = (_s = message.messageStubParameters) === null || _s === void 0 ? void 0 : _s[0];
                            emitGroupUpdate({ joinApprovalMode: approvalMode === 'on' });
                            break;
                        case Types_1.WAMessageStubType.GROUP_MEMBERSHIP_JOIN_APPROVAL_REQUEST_NON_ADMIN_ADD:
                            participant = (_t = message.messageStubParameters) === null || _t === void 0 ? void 0 : _t[0];
                            action = (_u = message.messageStubParameters) === null || _u === void 0 ? void 0 : _u[1];
                            method = (_v = message.messageStubParameters) === null || _v === void 0 ? void 0 : _v[2];
                            emitGroupRequestJoin(participant, action, method);
                            break;
                    }
                } /*  else if(content?.pollUpdateMessage) {
                    const creationMsgKey = content.pollUpdateMessage.pollCreationMessageKey!
                    // we need to fetch the poll creation message to get the poll enc key
                    // TODO: make standalone, remove getMessage reference
                    // TODO: Remove entirely
                    const pollMsg = await getMessage(creationMsgKey)
                    if(pollMsg) {
                        const meIdNormalised = jidNormalizedUser(meId)
                        const pollCreatorJid = getKeyAuthor(creationMsgKey, meIdNormalised)
                        const voterJid = getKeyAuthor(message.key, meIdNormalised)
                        const pollEncKey = pollMsg.messageContextInfo?.messageSecret!
            
                        try {
                            const voteMsg = decryptPollVote(
                                content.pollUpdateMessage.vote!,
                                {
                                    pollEncKey,
                                    pollCreatorJid,
                                    pollMsgId: creationMsgKey.id!,
                                    voterJid,
                                }
                            )
                            ev.emit('messages.update', [
                                {
                                    key: creationMsgKey,
                                    update: {
                                        pollUpdates: [
                                            {
                                                pollUpdateMessageKey: message.key,
                                                vote: voteMsg,
                                                senderTimestampMs: (content.pollUpdateMessage.senderTimestampMs! as Long).toNumber(),
                                            }
                                        ]
                                    }
                                }
                            ])
                        } catch(err) {
                            logger?.warn(
                                { err, creationMsgKey },
                                'failed to decrypt poll vote'
                            )
                        }
                    } else {
                        logger?.warn(
                            { creationMsgKey },
                            'poll creation message not found, cannot decrypt update'
                        )
                    }
                    } */
                _w.label = 14;
            case 14:
                if (Object.keys(chat).length > 1) {
                    ev.emit('chats.update', [chat]);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.default = processMessage;
//# sourceMappingURL=process-message.js.map