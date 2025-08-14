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
exports.makeMessagesRecvSocket = void 0;
var node_cache_1 = require("@cacheable/node-cache");
var boom_1 = require("@hapi/boom");
var crypto_1 = require("crypto");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var Types_1 = require("../Types/index.js");
var Utils_1 = require("../Utils/index.js");
var make_mutex_1 = require("../Utils/make-mutex.js");
var WABinary_1 = require("../WABinary/index.js");
var groups_1 = require("./groups.js");
var messages_send_1 = require("./messages-send.js");
var makeMessagesRecvSocket = function (config) {
    var logger = config.logger, retryRequestDelayMs = config.retryRequestDelayMs, maxMsgRetryCount = config.maxMsgRetryCount, getMessage = config.getMessage, shouldIgnoreJid = config.shouldIgnoreJid;
    var sock = (0, messages_send_1.makeMessagesSocket)(config);
    var ev = sock.ev, authState = sock.authState, ws = sock.ws, processingMutex = sock.processingMutex, signalRepository = sock.signalRepository, query = sock.query, upsertMessage = sock.upsertMessage, resyncAppState = sock.resyncAppState, onUnexpectedError = sock.onUnexpectedError, assertSessions = sock.assertSessions, sendNode = sock.sendNode, relayMessage = sock.relayMessage, sendReceipt = sock.sendReceipt, uploadPreKeys = sock.uploadPreKeys, sendPeerDataOperationMessage = sock.sendPeerDataOperationMessage;
    /** this mutex ensures that each retryRequest will wait for the previous one to finish */
    var retryMutex = (0, make_mutex_1.makeMutex)();
    var msgRetryCache = config.msgRetryCounterCache ||
        new node_cache_1.default({
            stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.MSG_RETRY, // 1 hour
            useClones: false
        });
    var callOfferCache = config.callOfferCache ||
        new node_cache_1.default({
            stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.CALL_OFFER, // 5 mins
            useClones: false
        });
    var placeholderResendCache = config.placeholderResendCache ||
        new node_cache_1.default({
            stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.MSG_RETRY, // 1 hour
            useClones: false
        });
    var sendActiveReceipts = false;
    var sendMessageAck = function (_a, errorCode_1) { return __awaiter(void 0, [_a, errorCode_1], void 0, function (_b, errorCode) {
        var stanza;
        var tag = _b.tag, attrs = _b.attrs, content = _b.content;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    stanza = {
                        tag: 'ack',
                        attrs: {
                            id: attrs.id,
                            to: attrs.from,
                            class: tag
                        }
                    };
                    if (!!errorCode) {
                        stanza.attrs.error = errorCode.toString();
                    }
                    if (!!attrs.participant) {
                        stanza.attrs.participant = attrs.participant;
                    }
                    if (!!attrs.recipient) {
                        stanza.attrs.recipient = attrs.recipient;
                    }
                    if (!!attrs.type &&
                        (tag !== 'message' || (0, WABinary_1.getBinaryNodeChild)({ tag: tag, attrs: attrs, content: content }, 'unavailable') || errorCode !== 0)) {
                        stanza.attrs.type = attrs.type;
                    }
                    if (tag === 'message' && (0, WABinary_1.getBinaryNodeChild)({ tag: tag, attrs: attrs, content: content }, 'unavailable')) {
                        stanza.attrs.from = authState.creds.me.id;
                    }
                    logger.debug({ recv: { tag: tag, attrs: attrs }, sent: stanza.attrs }, 'sent ack');
                    return [4 /*yield*/, sendNode(stanza)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var rejectCall = function (callId, callFrom) { return __awaiter(void 0, void 0, void 0, function () {
        var stanza;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stanza = {
                        tag: 'call',
                        attrs: {
                            from: authState.creds.me.id,
                            to: callFrom
                        },
                        content: [
                            {
                                tag: 'reject',
                                attrs: {
                                    'call-id': callId,
                                    'call-creator': callFrom,
                                    count: '0'
                                },
                                content: undefined
                            }
                        ]
                    };
                    return [4 /*yield*/, query(stanza)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var sendRetryRequest = function (node_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([node_1], args_1, true), void 0, function (node, forceIncludeKeys) {
            var fullMessage, msgKey, msgId, key, retryCount, _a, account, signedPreKey, identityKey, msgId_1, deviceIdentity;
            if (forceIncludeKeys === void 0) { forceIncludeKeys = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullMessage = (0, Utils_1.decodeMessageNode)(node, authState.creds.me.id, authState.creds.me.lid || '').fullMessage;
                        msgKey = fullMessage.key;
                        msgId = msgKey.id;
                        key = "".concat(msgId, ":").concat(msgKey === null || msgKey === void 0 ? void 0 : msgKey.participant);
                        retryCount = msgRetryCache.get(key) || 0;
                        if (retryCount >= maxMsgRetryCount) {
                            logger.debug({ retryCount: retryCount, msgId: msgId }, 'reached retry limit, clearing');
                            msgRetryCache.del(key);
                            return [2 /*return*/];
                        }
                        retryCount += 1;
                        msgRetryCache.set(key, retryCount);
                        _a = authState.creds, account = _a.account, signedPreKey = _a.signedPreKey, identityKey = _a.signedIdentityKey;
                        if (!(retryCount === 1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, requestPlaceholderResend(msgKey)];
                    case 1:
                        msgId_1 = _b.sent();
                        logger.debug("sendRetryRequest: requested placeholder resend for message ".concat(msgId_1));
                        _b.label = 2;
                    case 2:
                        deviceIdentity = (0, Utils_1.encodeSignedDeviceIdentity)(account, true);
                        return [4 /*yield*/, authState.keys.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var receipt, _a, update, preKeys, keyId, key_1, content;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            receipt = {
                                                tag: 'receipt',
                                                attrs: {
                                                    id: msgId,
                                                    type: 'retry',
                                                    to: node.attrs.from
                                                },
                                                content: [
                                                    {
                                                        tag: 'retry',
                                                        attrs: {
                                                            count: retryCount.toString(),
                                                            id: node.attrs.id,
                                                            t: node.attrs.t,
                                                            v: '1'
                                                        }
                                                    },
                                                    {
                                                        tag: 'registration',
                                                        attrs: {},
                                                        content: (0, Utils_1.encodeBigEndian)(authState.creds.registrationId)
                                                    }
                                                ]
                                            };
                                            if (node.attrs.recipient) {
                                                receipt.attrs.recipient = node.attrs.recipient;
                                            }
                                            if (node.attrs.participant) {
                                                receipt.attrs.participant = node.attrs.participant;
                                            }
                                            if (!(retryCount > 1 || forceIncludeKeys)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, (0, Utils_1.getNextPreKeys)(authState, 1)];
                                        case 1:
                                            _a = _b.sent(), update = _a.update, preKeys = _a.preKeys;
                                            keyId = Object.keys(preKeys)[0];
                                            key_1 = preKeys[+keyId];
                                            content = receipt.content;
                                            content.push({
                                                tag: 'keys',
                                                attrs: {},
                                                content: [
                                                    { tag: 'type', attrs: {}, content: Buffer.from(Defaults_1.KEY_BUNDLE_TYPE) },
                                                    { tag: 'identity', attrs: {}, content: identityKey.public },
                                                    (0, Utils_1.xmppPreKey)(key_1, +keyId),
                                                    (0, Utils_1.xmppSignedPreKey)(signedPreKey),
                                                    { tag: 'device-identity', attrs: {}, content: deviceIdentity }
                                                ]
                                            });
                                            ev.emit('creds.update', update);
                                            _b.label = 2;
                                        case 2: return [4 /*yield*/, sendNode(receipt)];
                                        case 3:
                                            _b.sent();
                                            logger.info({ msgAttrs: node.attrs, retryCount: retryCount }, 'sent retry receipt');
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var handleEncryptNotification = function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var from, countChild, count, shouldUploadMorePreKeys, identityNode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    from = node.attrs.from;
                    if (!(from === WABinary_1.S_WHATSAPP_NET)) return [3 /*break*/, 3];
                    countChild = (0, WABinary_1.getBinaryNodeChild)(node, 'count');
                    count = +countChild.attrs.value;
                    shouldUploadMorePreKeys = count < Defaults_1.MIN_PREKEY_COUNT;
                    logger.debug({ count: count, shouldUploadMorePreKeys: shouldUploadMorePreKeys }, 'recv pre-key count');
                    if (!shouldUploadMorePreKeys) return [3 /*break*/, 2];
                    return [4 /*yield*/, uploadPreKeys()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    identityNode = (0, WABinary_1.getBinaryNodeChild)(node, 'identity');
                    if (identityNode) {
                        logger.info({ jid: from }, 'identity changed');
                        // not handling right now
                        // signal will override new identity anyway
                    }
                    else {
                        logger.info({ node: node }, 'unknown encrypt notification');
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleGroupNotification = function (participant, child, msg) {
        var _a, _b, _c, _d;
        var participantJid = ((_b = (_a = (0, WABinary_1.getBinaryNodeChild)(child, 'participant')) === null || _a === void 0 ? void 0 : _a.attrs) === null || _b === void 0 ? void 0 : _b.jid) || participant;
        switch (child === null || child === void 0 ? void 0 : child.tag) {
            case 'create':
                var metadata = (0, groups_1.extractGroupMetadata)(child);
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_CREATE;
                msg.messageStubParameters = [metadata.subject];
                msg.key = { participant: metadata.owner };
                ev.emit('chats.upsert', [
                    {
                        id: metadata.id,
                        name: metadata.subject,
                        conversationTimestamp: metadata.creation
                    }
                ]);
                ev.emit('groups.upsert', [
                    __assign(__assign({}, metadata), { author: participant })
                ]);
                break;
            case 'ephemeral':
            case 'not_ephemeral':
                msg.message = {
                    protocolMessage: {
                        type: index_js_1.proto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING,
                        ephemeralExpiration: +(child.attrs.expiration || 0)
                    }
                };
                break;
            case 'modify':
                var oldNumber = (0, WABinary_1.getBinaryNodeChildren)(child, 'participant').map(function (p) { return p.attrs.jid; });
                msg.messageStubParameters = oldNumber || [];
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_PARTICIPANT_CHANGE_NUMBER;
                break;
            case 'promote':
            case 'demote':
            case 'remove':
            case 'add':
            case 'leave':
                var stubType = "GROUP_PARTICIPANT_".concat(child.tag.toUpperCase());
                msg.messageStubType = Types_1.WAMessageStubType[stubType];
                var participants = (0, WABinary_1.getBinaryNodeChildren)(child, 'participant').map(function (p) { return p.attrs.jid; });
                if (participants.length === 1 &&
                    // if recv. "remove" message and sender removed themselves
                    // mark as left
                    (0, WABinary_1.areJidsSameUser)(participants[0], participant) &&
                    child.tag === 'remove') {
                    msg.messageStubType = Types_1.WAMessageStubType.GROUP_PARTICIPANT_LEAVE;
                }
                msg.messageStubParameters = participants;
                break;
            case 'subject':
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_CHANGE_SUBJECT;
                msg.messageStubParameters = [child.attrs.subject];
                break;
            case 'description':
                var description = (_d = (_c = (0, WABinary_1.getBinaryNodeChild)(child, 'body')) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.toString();
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_CHANGE_DESCRIPTION;
                msg.messageStubParameters = description ? [description] : undefined;
                break;
            case 'announcement':
            case 'not_announcement':
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_CHANGE_ANNOUNCE;
                msg.messageStubParameters = [child.tag === 'announcement' ? 'on' : 'off'];
                break;
            case 'locked':
            case 'unlocked':
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_CHANGE_RESTRICT;
                msg.messageStubParameters = [child.tag === 'locked' ? 'on' : 'off'];
                break;
            case 'invite':
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_CHANGE_INVITE_LINK;
                msg.messageStubParameters = [child.attrs.code];
                break;
            case 'member_add_mode':
                var addMode = child.content;
                if (addMode) {
                    msg.messageStubType = Types_1.WAMessageStubType.GROUP_MEMBER_ADD_MODE;
                    msg.messageStubParameters = [addMode.toString()];
                }
                break;
            case 'membership_approval_mode':
                var approvalMode = (0, WABinary_1.getBinaryNodeChild)(child, 'group_join');
                if (approvalMode) {
                    msg.messageStubType = Types_1.WAMessageStubType.GROUP_MEMBERSHIP_JOIN_APPROVAL_MODE;
                    msg.messageStubParameters = [approvalMode.attrs.state];
                }
                break;
            case 'created_membership_requests':
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_MEMBERSHIP_JOIN_APPROVAL_REQUEST_NON_ADMIN_ADD;
                msg.messageStubParameters = [participantJid, 'created', child.attrs.request_method];
                break;
            case 'revoked_membership_requests':
                var isDenied = (0, WABinary_1.areJidsSameUser)(participantJid, participant);
                msg.messageStubType = Types_1.WAMessageStubType.GROUP_MEMBERSHIP_JOIN_APPROVAL_REQUEST_NON_ADMIN_ADD;
                msg.messageStubParameters = [participantJid, isDenied ? 'revoked' : 'rejected'];
                break;
        }
    };
    var processNotification = function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var result, child, nodeType, from, _a, tokenList, _i, tokenList_1, _b, attrs, content, jid, event_1, devices, deviceJids, update, name_1, setPicture, delPicture, node_1, newDuration, timestamp, blocklists, _c, blocklists_1, attrs, blocklist, type, linkCodeCompanionReg, ref, primaryIdentityPublicKey, primaryEphemeralPublicKeyWrapped, codePairingPublicKey, companionSharedKey, random, linkCodeSalt, linkCodePairingExpanded, encryptPayload, encryptIv, encrypted, encryptedPayload, identitySharedKey, identityPayload, _d;
        var _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    result = {};
                    child = (0, WABinary_1.getAllBinaryNodeChildren)(node)[0];
                    nodeType = node.attrs.type;
                    from = (0, WABinary_1.jidNormalizedUser)(node.attrs.from);
                    _a = nodeType;
                    switch (_a) {
                        case 'privacy_token': return [3 /*break*/, 1];
                        case 'newsletter': return [3 /*break*/, 2];
                        case 'mex': return [3 /*break*/, 4];
                        case 'w:gp2': return [3 /*break*/, 6];
                        case 'mediaretry': return [3 /*break*/, 7];
                        case 'encrypt': return [3 /*break*/, 8];
                        case 'devices': return [3 /*break*/, 10];
                        case 'server_sync': return [3 /*break*/, 11];
                        case 'picture': return [3 /*break*/, 14];
                        case 'account_sync': return [3 /*break*/, 15];
                        case 'link_code_companion_reg': return [3 /*break*/, 16];
                    }
                    return [3 /*break*/, 21];
                case 1:
                    tokenList = (0, WABinary_1.getBinaryNodeChildren)(child, 'token');
                    for (_i = 0, tokenList_1 = tokenList; _i < tokenList_1.length; _i++) {
                        _b = tokenList_1[_i], attrs = _b.attrs, content = _b.content;
                        jid = attrs.jid;
                        ev.emit('chats.update', [
                            {
                                id: jid,
                                tcToken: content
                            }
                        ]);
                        logger.debug({ jid: jid }, 'got privacy token update');
                    }
                    return [3 /*break*/, 21];
                case 2: return [4 /*yield*/, handleNewsletterNotification(node)];
                case 3:
                    _h.sent();
                    return [3 /*break*/, 21];
                case 4: return [4 /*yield*/, handleMexNewsletterNotification(node)];
                case 5:
                    _h.sent();
                    return [3 /*break*/, 21];
                case 6:
                    handleGroupNotification(node.attrs.participant, child, result);
                    return [3 /*break*/, 21];
                case 7:
                    event_1 = (0, Utils_1.decodeMediaRetryNode)(node);
                    ev.emit('messages.media-update', [event_1]);
                    return [3 /*break*/, 21];
                case 8: return [4 /*yield*/, handleEncryptNotification(node)];
                case 9:
                    _h.sent();
                    return [3 /*break*/, 21];
                case 10:
                    devices = (0, WABinary_1.getBinaryNodeChildren)(child, 'device');
                    if ((0, WABinary_1.areJidsSameUser)(child.attrs.jid, authState.creds.me.id)) {
                        deviceJids = devices.map(function (d) { return d.attrs.jid; });
                        logger.info({ deviceJids: deviceJids }, 'got my own devices');
                    }
                    return [3 /*break*/, 21];
                case 11:
                    update = (0, WABinary_1.getBinaryNodeChild)(node, 'collection');
                    if (!update) return [3 /*break*/, 13];
                    name_1 = update.attrs.name;
                    return [4 /*yield*/, resyncAppState([name_1], false)];
                case 12:
                    _h.sent();
                    _h.label = 13;
                case 13: return [3 /*break*/, 21];
                case 14:
                    setPicture = (0, WABinary_1.getBinaryNodeChild)(node, 'set');
                    delPicture = (0, WABinary_1.getBinaryNodeChild)(node, 'delete');
                    ev.emit('contacts.update', [
                        {
                            id: (0, WABinary_1.jidNormalizedUser)((_e = node === null || node === void 0 ? void 0 : node.attrs) === null || _e === void 0 ? void 0 : _e.from) || ((_g = (_f = (setPicture || delPicture)) === null || _f === void 0 ? void 0 : _f.attrs) === null || _g === void 0 ? void 0 : _g.hash) || '',
                            imgUrl: setPicture ? 'changed' : 'removed'
                        }
                    ]);
                    if ((0, WABinary_1.isJidGroup)(from)) {
                        node_1 = setPicture || delPicture;
                        result.messageStubType = Types_1.WAMessageStubType.GROUP_CHANGE_ICON;
                        if (setPicture) {
                            result.messageStubParameters = [setPicture.attrs.id];
                        }
                        result.participant = node_1 === null || node_1 === void 0 ? void 0 : node_1.attrs.author;
                        result.key = __assign(__assign({}, (result.key || {})), { participant: setPicture === null || setPicture === void 0 ? void 0 : setPicture.attrs.author });
                    }
                    return [3 /*break*/, 21];
                case 15:
                    if (child.tag === 'disappearing_mode') {
                        newDuration = +child.attrs.duration;
                        timestamp = +child.attrs.t;
                        logger.info({ newDuration: newDuration }, 'updated account disappearing mode');
                        ev.emit('creds.update', {
                            accountSettings: __assign(__assign({}, authState.creds.accountSettings), { defaultDisappearingMode: {
                                    ephemeralExpiration: newDuration,
                                    ephemeralSettingTimestamp: timestamp
                                } })
                        });
                    }
                    else if (child.tag === 'blocklist') {
                        blocklists = (0, WABinary_1.getBinaryNodeChildren)(child, 'item');
                        for (_c = 0, blocklists_1 = blocklists; _c < blocklists_1.length; _c++) {
                            attrs = blocklists_1[_c].attrs;
                            blocklist = [attrs.jid];
                            type = attrs.action === 'block' ? 'add' : 'remove';
                            ev.emit('blocklist.update', { blocklist: blocklist, type: type });
                        }
                    }
                    return [3 /*break*/, 21];
                case 16:
                    linkCodeCompanionReg = (0, WABinary_1.getBinaryNodeChild)(node, 'link_code_companion_reg');
                    ref = toRequiredBuffer((0, WABinary_1.getBinaryNodeChildBuffer)(linkCodeCompanionReg, 'link_code_pairing_ref'));
                    primaryIdentityPublicKey = toRequiredBuffer((0, WABinary_1.getBinaryNodeChildBuffer)(linkCodeCompanionReg, 'primary_identity_pub'));
                    primaryEphemeralPublicKeyWrapped = toRequiredBuffer((0, WABinary_1.getBinaryNodeChildBuffer)(linkCodeCompanionReg, 'link_code_pairing_wrapped_primary_ephemeral_pub'));
                    return [4 /*yield*/, decipherLinkPublicKey(primaryEphemeralPublicKeyWrapped)];
                case 17:
                    codePairingPublicKey = _h.sent();
                    companionSharedKey = Utils_1.Curve.sharedKey(authState.creds.pairingEphemeralKeyPair.private, codePairingPublicKey);
                    random = (0, crypto_1.randomBytes)(32);
                    linkCodeSalt = (0, crypto_1.randomBytes)(32);
                    return [4 /*yield*/, (0, Utils_1.hkdf)(companionSharedKey, 32, {
                            salt: linkCodeSalt,
                            info: 'link_code_pairing_key_bundle_encryption_key'
                        })];
                case 18:
                    linkCodePairingExpanded = _h.sent();
                    encryptPayload = Buffer.concat([
                        Buffer.from(authState.creds.signedIdentityKey.public),
                        primaryIdentityPublicKey,
                        random
                    ]);
                    encryptIv = (0, crypto_1.randomBytes)(12);
                    encrypted = (0, Utils_1.aesEncryptGCM)(encryptPayload, linkCodePairingExpanded, encryptIv, Buffer.alloc(0));
                    encryptedPayload = Buffer.concat([linkCodeSalt, encryptIv, encrypted]);
                    identitySharedKey = Utils_1.Curve.sharedKey(authState.creds.signedIdentityKey.private, primaryIdentityPublicKey);
                    identityPayload = Buffer.concat([companionSharedKey, identitySharedKey, random]);
                    _d = authState.creds;
                    return [4 /*yield*/, (0, Utils_1.hkdf)(identityPayload, 32, { info: 'adv_secret' })];
                case 19:
                    _d.advSecretKey = (_h.sent()).toString('base64');
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: {
                                to: WABinary_1.S_WHATSAPP_NET,
                                type: 'set',
                                id: sock.generateMessageTag(),
                                xmlns: 'md'
                            },
                            content: [
                                {
                                    tag: 'link_code_companion_reg',
                                    attrs: {
                                        jid: authState.creds.me.id,
                                        stage: 'companion_finish'
                                    },
                                    content: [
                                        {
                                            tag: 'link_code_pairing_wrapped_key_bundle',
                                            attrs: {},
                                            content: encryptedPayload
                                        },
                                        {
                                            tag: 'companion_identity_public',
                                            attrs: {},
                                            content: authState.creds.signedIdentityKey.public
                                        },
                                        {
                                            tag: 'link_code_pairing_ref',
                                            attrs: {},
                                            content: ref
                                        }
                                    ]
                                }
                            ]
                        })];
                case 20:
                    _h.sent();
                    authState.creds.registered = true;
                    ev.emit('creds.update', authState.creds);
                    _h.label = 21;
                case 21:
                    if (Object.keys(result).length) {
                        return [2 /*return*/, result];
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    function decipherLinkPublicKey(data) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, salt, secretKey, iv, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = toRequiredBuffer(data);
                        salt = buffer.slice(0, 32);
                        return [4 /*yield*/, (0, Utils_1.derivePairingCodeKey)(authState.creds.pairingCode, salt)];
                    case 1:
                        secretKey = _a.sent();
                        iv = buffer.slice(32, 48);
                        payload = buffer.slice(48, 80);
                        return [2 /*return*/, (0, Utils_1.aesDecryptCTR)(payload, secretKey, iv)];
                }
            });
        });
    }
    function toRequiredBuffer(data) {
        if (data === undefined) {
            throw new boom_1.Boom('Invalid buffer', { statusCode: 400 });
        }
        return data instanceof Buffer ? data : Buffer.from(data);
    }
    var willSendMessageAgain = function (id, participant) {
        var key = "".concat(id, ":").concat(participant);
        var retryCount = msgRetryCache.get(key) || 0;
        return retryCount < maxMsgRetryCount;
    };
    var updateSendMessageAgainCount = function (id, participant) {
        var key = "".concat(id, ":").concat(participant);
        var newValue = (msgRetryCache.get(key) || 0) + 1;
        msgRetryCache.set(key, newValue);
    };
    var sendMessagesAgain = function (key, ids, retryNode) { return __awaiter(void 0, void 0, void 0, function () {
        var msgs, remoteJid, participant, sendToAll, _i, _a, _b, i, msg, msgRelayOpts;
        var _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, Promise.all(ids.map(function (id) { return getMessage(__assign(__assign({}, key), { id: id })); }))];
                case 1:
                    msgs = _e.sent();
                    remoteJid = key.remoteJid;
                    participant = key.participant || remoteJid;
                    sendToAll = !((_d = (0, WABinary_1.jidDecode)(participant)) === null || _d === void 0 ? void 0 : _d.device);
                    return [4 /*yield*/, assertSessions([participant], true)];
                case 2:
                    _e.sent();
                    if (!(0, WABinary_1.isJidGroup)(remoteJid)) return [3 /*break*/, 4];
                    return [4 /*yield*/, authState.keys.set({ 'sender-key-memory': (_c = {}, _c[remoteJid] = null, _c) })];
                case 3:
                    _e.sent();
                    _e.label = 4;
                case 4:
                    logger.debug({ participant: participant, sendToAll: sendToAll }, 'forced new session for retry recp');
                    _i = 0, _a = msgs.entries();
                    _e.label = 5;
                case 5:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    _b = _a[_i], i = _b[0], msg = _b[1];
                    if (!msg) return [3 /*break*/, 7];
                    updateSendMessageAgainCount(ids[i], participant);
                    msgRelayOpts = { messageId: ids[i] };
                    if (sendToAll) {
                        msgRelayOpts.useUserDevicesCache = false;
                    }
                    else {
                        msgRelayOpts.participant = {
                            jid: participant,
                            count: +retryNode.attrs.count
                        };
                    }
                    return [4 /*yield*/, relayMessage(key.remoteJid, msg, msgRelayOpts)];
                case 6:
                    _e.sent();
                    return [3 /*break*/, 8];
                case 7:
                    logger.debug({ jid: key.remoteJid, id: ids[i] }, 'recv retry request, but message not available');
                    _e.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 5];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var handleReceipt = function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var attrs, content, isLid, isNodeFromMe, remoteJid, fromMe, key, ids, items;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    attrs = node.attrs, content = node.content;
                    isLid = attrs.from.includes('lid');
                    isNodeFromMe = (0, WABinary_1.areJidsSameUser)(attrs.participant || attrs.from, isLid ? (_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.lid : (_b = authState.creds.me) === null || _b === void 0 ? void 0 : _b.id);
                    remoteJid = !isNodeFromMe || (0, WABinary_1.isJidGroup)(attrs.from) ? attrs.from : attrs.recipient;
                    fromMe = !attrs.recipient || ((attrs.type === 'retry' || attrs.type === 'sender') && isNodeFromMe);
                    key = {
                        remoteJid: remoteJid,
                        id: '',
                        fromMe: fromMe,
                        participant: attrs.participant
                    };
                    if (!(shouldIgnoreJid(remoteJid) && remoteJid !== '@s.whatsapp.net')) return [3 /*break*/, 2];
                    logger.debug({ remoteJid: remoteJid }, 'ignoring receipt from jid');
                    return [4 /*yield*/, sendMessageAck(node)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
                case 2:
                    ids = [attrs.id];
                    if (Array.isArray(content)) {
                        items = (0, WABinary_1.getBinaryNodeChildren)(content[0], 'item');
                        ids.push.apply(ids, items.map(function (i) { return i.attrs.id; }));
                    }
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, , 5, 7]);
                    return [4 /*yield*/, Promise.all([
                            processingMutex.mutex(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var status, updateKey_1, retryNode, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            status = (0, Utils_1.getStatusFromReceiptType)(attrs.type);
                                            if (typeof status !== 'undefined' &&
                                                // basically, we only want to know when a message from us has been delivered to/read by the other person
                                                // or another device of ours has read some messages
                                                (status >= index_js_1.proto.WebMessageInfo.Status.SERVER_ACK || !isNodeFromMe)) {
                                                if ((0, WABinary_1.isJidGroup)(remoteJid) || (0, WABinary_1.isJidStatusBroadcast)(remoteJid)) {
                                                    if (attrs.participant) {
                                                        updateKey_1 = status === index_js_1.proto.WebMessageInfo.Status.DELIVERY_ACK ? 'receiptTimestamp' : 'readTimestamp';
                                                        ev.emit('message-receipt.update', ids.map(function (id) {
                                                            var _a;
                                                            return ({
                                                                key: __assign(__assign({}, key), { id: id }),
                                                                receipt: (_a = {
                                                                        userJid: (0, WABinary_1.jidNormalizedUser)(attrs.participant)
                                                                    },
                                                                    _a[updateKey_1] = +attrs.t,
                                                                    _a)
                                                            });
                                                        }));
                                                    }
                                                }
                                                else {
                                                    ev.emit('messages.update', ids.map(function (id) { return ({
                                                        key: __assign(__assign({}, key), { id: id }),
                                                        update: { status: status }
                                                    }); }));
                                                }
                                            }
                                            if (!(attrs.type === 'retry')) return [3 /*break*/, 8];
                                            // correctly set who is asking for the retry
                                            key.participant = key.participant || attrs.from;
                                            retryNode = (0, WABinary_1.getBinaryNodeChild)(node, 'retry');
                                            if (!willSendMessageAgain(ids[0], key.participant)) return [3 /*break*/, 7];
                                            if (!key.fromMe) return [3 /*break*/, 5];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            logger.debug({ attrs: attrs, key: key }, 'recv retry request');
                                            return [4 /*yield*/, sendMessagesAgain(key, ids, retryNode)];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_1 = _a.sent();
                                            logger.error({ key: key, ids: ids, trace: error_1.stack }, 'error in sending message again');
                                            return [3 /*break*/, 4];
                                        case 4: return [3 /*break*/, 6];
                                        case 5:
                                            logger.info({ attrs: attrs, key: key }, 'recv retry for not fromMe message');
                                            _a.label = 6;
                                        case 6: return [3 /*break*/, 8];
                                        case 7:
                                            logger.info({ attrs: attrs, key: key }, 'will not send message again, as sent too many times');
                                            _a.label = 8;
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            }); })
                        ])];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, sendMessageAck(node)];
                case 6:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleNotification = function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var remoteJid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    remoteJid = node.attrs.from;
                    if (!(shouldIgnoreJid(remoteJid) && remoteJid !== '@s.whatsapp.net')) return [3 /*break*/, 2];
                    logger.debug({ remoteJid: remoteJid, id: node.attrs.id }, 'ignored notification');
                    return [4 /*yield*/, sendMessageAck(node)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    _a.trys.push([2, , 4, 6]);
                    return [4 /*yield*/, Promise.all([
                            processingMutex.mutex(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var msg, fromMe, fullMsg;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, processNotification(node)];
                                        case 1:
                                            msg = _b.sent();
                                            if (!msg) return [3 /*break*/, 3];
                                            fromMe = (0, WABinary_1.areJidsSameUser)(node.attrs.participant || remoteJid, authState.creds.me.id);
                                            msg.key = __assign({ remoteJid: remoteJid, fromMe: fromMe, participant: node.attrs.participant, id: node.attrs.id }, (msg.key || {}));
                                            (_a = msg.participant) !== null && _a !== void 0 ? _a : (msg.participant = node.attrs.participant);
                                            msg.messageTimestamp = +node.attrs.t;
                                            fullMsg = index_js_1.proto.WebMessageInfo.fromObject(msg);
                                            return [4 /*yield*/, upsertMessage(fullMsg, 'append')];
                                        case 2:
                                            _b.sent();
                                            _b.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); })
                        ])];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, sendMessageAck(node)];
                case 5:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleMessage = function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var encNode, response, key, _a, msg, category, author, decrypt, error_2;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!(shouldIgnoreJid(node.attrs.from) && node.attrs.from !== '@s.whatsapp.net')) return [3 /*break*/, 2];
                    logger.debug({ key: node.attrs.key }, 'ignored message');
                    return [4 /*yield*/, sendMessageAck(node)];
                case 1:
                    _e.sent();
                    return [2 /*return*/];
                case 2:
                    encNode = (0, WABinary_1.getBinaryNodeChild)(node, 'enc');
                    if (!(encNode && encNode.attrs.type === 'msmsg')) return [3 /*break*/, 4];
                    logger.debug({ key: node.attrs.key }, 'ignored msmsg');
                    return [4 /*yield*/, sendMessageAck(node)];
                case 3:
                    _e.sent();
                    return [2 /*return*/];
                case 4:
                    if (!((0, WABinary_1.getBinaryNodeChild)(node, 'unavailable') && !encNode)) return [3 /*break*/, 7];
                    return [4 /*yield*/, sendMessageAck(node)];
                case 5:
                    _e.sent();
                    key = (0, Utils_1.decodeMessageNode)(node, authState.creds.me.id, authState.creds.me.lid || '').fullMessage.key;
                    return [4 /*yield*/, requestPlaceholderResend(key)];
                case 6:
                    response = _e.sent();
                    if (response === 'RESOLVED') {
                        return [2 /*return*/];
                    }
                    logger.debug('received unavailable message, acked and requested resend from phone');
                    return [3 /*break*/, 8];
                case 7:
                    if (placeholderResendCache.get(node.attrs.id)) {
                        placeholderResendCache.del(node.attrs.id);
                    }
                    _e.label = 8;
                case 8:
                    _a = (0, Utils_1.decryptMessageNode)(node, authState.creds.me.id, authState.creds.me.lid || '', signalRepository, logger), msg = _a.fullMessage, category = _a.category, author = _a.author, decrypt = _a.decrypt;
                    if (response && ((_b = msg === null || msg === void 0 ? void 0 : msg.messageStubParameters) === null || _b === void 0 ? void 0 : _b[0]) === Utils_1.NO_MESSAGE_FOUND_ERROR_TEXT) {
                        msg.messageStubParameters = [Utils_1.NO_MESSAGE_FOUND_ERROR_TEXT, response];
                    }
                    if (((_d = (_c = msg.message) === null || _c === void 0 ? void 0 : _c.protocolMessage) === null || _d === void 0 ? void 0 : _d.type) === index_js_1.proto.Message.ProtocolMessage.Type.SHARE_PHONE_NUMBER &&
                        node.attrs.sender_pn) {
                        ev.emit('chats.phoneNumberShare', { lid: node.attrs.from, jid: node.attrs.sender_pn });
                    }
                    _e.label = 9;
                case 9:
                    _e.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, Promise.all([
                            processingMutex.mutex(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var type, participant, isAnyHistoryMsg, jid;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, decrypt()
                                            // message failed to decrypt
                                        ];
                                        case 1:
                                            _b.sent();
                                            if (!(msg.messageStubType === index_js_1.proto.WebMessageInfo.StubType.CIPHERTEXT)) return [3 /*break*/, 2];
                                            if (((_a = msg === null || msg === void 0 ? void 0 : msg.messageStubParameters) === null || _a === void 0 ? void 0 : _a[0]) === Utils_1.MISSING_KEYS_ERROR_TEXT) {
                                                return [2 /*return*/, sendMessageAck(node, Utils_1.NACK_REASONS.ParsingError)];
                                            }
                                            retryMutex.mutex(function () { return __awaiter(void 0, void 0, void 0, function () {
                                                var encNode_1;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!ws.isOpen) return [3 /*break*/, 4];
                                                            if ((0, WABinary_1.getBinaryNodeChild)(node, 'unavailable')) {
                                                                return [2 /*return*/];
                                                            }
                                                            encNode_1 = (0, WABinary_1.getBinaryNodeChild)(node, 'enc');
                                                            return [4 /*yield*/, sendRetryRequest(node, !encNode_1)];
                                                        case 1:
                                                            _a.sent();
                                                            if (!retryRequestDelayMs) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, (0, Utils_1.delay)(retryRequestDelayMs)];
                                                        case 2:
                                                            _a.sent();
                                                            _a.label = 3;
                                                        case 3: return [3 /*break*/, 5];
                                                        case 4:
                                                            logger.debug({ node: node }, 'connection closed, ignoring retry req');
                                                            _a.label = 5;
                                                        case 5: return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                            return [3 /*break*/, 5];
                                        case 2:
                                            type = undefined;
                                            participant = msg.key.participant;
                                            if (category === 'peer') {
                                                // special peer message
                                                type = 'peer_msg';
                                            }
                                            else if (msg.key.fromMe) {
                                                // message was sent by us from a different device
                                                type = 'sender';
                                                // need to specially handle this case
                                                if ((0, WABinary_1.isJidUser)(msg.key.remoteJid)) {
                                                    participant = author;
                                                }
                                            }
                                            else if (!sendActiveReceipts) {
                                                type = 'inactive';
                                            }
                                            return [4 /*yield*/, sendReceipt(msg.key.remoteJid, participant, [msg.key.id], type)
                                                // send ack for history message
                                            ];
                                        case 3:
                                            _b.sent();
                                            isAnyHistoryMsg = (0, Utils_1.getHistoryMsg)(msg.message);
                                            if (!isAnyHistoryMsg) return [3 /*break*/, 5];
                                            jid = (0, WABinary_1.jidNormalizedUser)(msg.key.remoteJid);
                                            return [4 /*yield*/, sendReceipt(jid, undefined, [msg.key.id], 'hist_sync')];
                                        case 4:
                                            _b.sent();
                                            _b.label = 5;
                                        case 5:
                                            (0, Utils_1.cleanMessage)(msg, authState.creds.me.id);
                                            return [4 /*yield*/, sendMessageAck(node)];
                                        case 6:
                                            _b.sent();
                                            return [4 /*yield*/, upsertMessage(msg, node.attrs.offline ? 'append' : 'notify')];
                                        case 7:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                        ])];
                case 10:
                    _e.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _e.sent();
                    logger.error({ error: error_2, node: node }, 'error in handling message');
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    var fetchMessageHistory = function (count, oldestMsgKey, oldestMsgTimestamp) { return __awaiter(void 0, void 0, void 0, function () {
        var pdoMessage;
        var _a;
        return __generator(this, function (_b) {
            if (!((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new boom_1.Boom('Not authenticated');
            }
            pdoMessage = {
                historySyncOnDemandRequest: {
                    chatJid: oldestMsgKey.remoteJid,
                    oldestMsgFromMe: oldestMsgKey.fromMe,
                    oldestMsgId: oldestMsgKey.id,
                    oldestMsgTimestampMs: oldestMsgTimestamp,
                    onDemandMsgCount: count
                },
                peerDataOperationRequestType: index_js_1.proto.Message.PeerDataOperationRequestType.HISTORY_SYNC_ON_DEMAND
            };
            return [2 /*return*/, sendPeerDataOperationMessage(pdoMessage)];
        });
    }); };
    var requestPlaceholderResend = function (messageKey) { return __awaiter(void 0, void 0, void 0, function () {
        var pdoMessage;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id)) {
                        throw new boom_1.Boom('Not authenticated');
                    }
                    if (placeholderResendCache.get(messageKey === null || messageKey === void 0 ? void 0 : messageKey.id)) {
                        logger.debug({ messageKey: messageKey }, 'already requested resend');
                        return [2 /*return*/];
                    }
                    else {
                        placeholderResendCache.set(messageKey === null || messageKey === void 0 ? void 0 : messageKey.id, true);
                    }
                    return [4 /*yield*/, (0, Utils_1.delay)(5000)];
                case 1:
                    _b.sent();
                    if (!placeholderResendCache.get(messageKey === null || messageKey === void 0 ? void 0 : messageKey.id)) {
                        logger.debug({ messageKey: messageKey }, 'message received while resend requested');
                        return [2 /*return*/, 'RESOLVED'];
                    }
                    pdoMessage = {
                        placeholderMessageResendRequest: [
                            {
                                messageKey: messageKey
                            }
                        ],
                        peerDataOperationRequestType: index_js_1.proto.Message.PeerDataOperationRequestType.PLACEHOLDER_MESSAGE_RESEND
                    };
                    setTimeout(function () {
                        if (placeholderResendCache.get(messageKey === null || messageKey === void 0 ? void 0 : messageKey.id)) {
                            logger.debug({ messageKey: messageKey }, 'PDO message without response after 15 seconds. Phone possibly offline');
                            placeholderResendCache.del(messageKey === null || messageKey === void 0 ? void 0 : messageKey.id);
                        }
                    }, 15000);
                    return [2 /*return*/, sendPeerDataOperationMessage(pdoMessage)];
            }
        });
    }); };
    var handleCall = function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var status, attrs, infoChild, callId, from, verify, callLid, call, existingCall;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attrs = node.attrs;
                    infoChild = (0, WABinary_1.getAllBinaryNodeChildren)(node)[0];
                    if (!infoChild) {
                        throw new boom_1.Boom('Missing call info in call node');
                    }
                    callId = infoChild.attrs['call-id'];
                    from = infoChild.attrs.from || infoChild.attrs['call-creator'];
                    status = (0, Utils_1.getCallStatusFromNode)(infoChild);
                    if ((0, WABinary_1.isLidUser)(from) && infoChild.tag === 'relaylatency') {
                        verify = callOfferCache.get(callId);
                        if (!verify) {
                            status = 'offer';
                            callLid = {
                                chatId: attrs.from,
                                from: from,
                                id: callId,
                                date: new Date(+attrs.t * 1000),
                                offline: !!attrs.offline,
                                status: status
                            };
                            callOfferCache.set(callId, callLid);
                        }
                    }
                    call = {
                        chatId: attrs.from,
                        from: from,
                        id: callId,
                        date: new Date(+attrs.t * 1000),
                        offline: !!attrs.offline,
                        status: status
                    };
                    if (status === 'offer') {
                        call.isVideo = !!(0, WABinary_1.getBinaryNodeChild)(infoChild, 'video');
                        call.isGroup = infoChild.attrs.type === 'group' || !!infoChild.attrs['group-jid'];
                        call.groupJid = infoChild.attrs['group-jid'];
                        callOfferCache.set(call.id, call);
                    }
                    existingCall = callOfferCache.get(call.id);
                    // use existing call info to populate this event
                    if (existingCall) {
                        call.isVideo = existingCall.isVideo;
                        call.isGroup = existingCall.isGroup;
                    }
                    // delete data once call has ended
                    if (status === 'reject' || status === 'accept' || status === 'timeout' || status === 'terminate') {
                        callOfferCache.del(call.id);
                    }
                    ev.emit('call', [call]);
                    return [4 /*yield*/, sendMessageAck(node)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleBadAck = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var key;
        var attrs = _b.attrs;
        return __generator(this, function (_c) {
            key = { remoteJid: attrs.from, fromMe: true, id: attrs.id };
            // WARNING: REFRAIN FROM ENABLING THIS FOR NOW. IT WILL CAUSE A LOOP
            // // current hypothesis is that if pash is sent in the ack
            // // it means -- the message hasn't reached all devices yet
            // // we'll retry sending the message here
            // if(attrs.phash) {
            // 	logger.info({ attrs }, 'received phash in ack, resending message...')
            // 	const msg = await getMessage(key)
            // 	if(msg) {
            // 		await relayMessage(key.remoteJid!, msg, { messageId: key.id!, useUserDevicesCache: false })
            // 	} else {
            // 		logger.warn({ attrs }, 'could not send message again, as it was not found')
            // 	}
            // }
            // error in acknowledgement,
            // device could not display the message
            if (attrs.error) {
                logger.warn({ attrs: attrs }, 'received error in ack');
                ev.emit('messages.update', [
                    {
                        key: key,
                        update: {
                            status: Types_1.WAMessageStatus.ERROR,
                            messageStubParameters: [attrs.error]
                        }
                    }
                ]);
            }
            return [2 /*return*/];
        });
    }); };
    /// processes a node with the given function
    /// and adds the task to the existing buffer if we're buffering events
    var processNodeWithBuffer = function (node, identifier, exec) { return __awaiter(void 0, void 0, void 0, function () {
        function execTask() {
            return exec(node, false).catch(function (err) { return onUnexpectedError(err, identifier); });
        }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ev.buffer();
                    return [4 /*yield*/, execTask()];
                case 1:
                    _a.sent();
                    ev.flush();
                    return [2 /*return*/];
            }
        });
    }); };
    var makeOfflineNodeProcessor = function () {
        var nodeProcessorMap = new Map([
            ['message', handleMessage],
            ['call', handleCall],
            ['receipt', handleReceipt],
            ['notification', handleNotification]
        ]);
        var nodes = [];
        var isProcessing = false;
        var enqueue = function (type, node) {
            nodes.push({ type: type, node: node });
            if (isProcessing) {
                return;
            }
            isProcessing = true;
            var promise = function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a, type_1, node_2, nodeProcessor;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(nodes.length && ws.isOpen)) return [3 /*break*/, 2];
                            _a = nodes.shift(), type_1 = _a.type, node_2 = _a.node;
                            nodeProcessor = nodeProcessorMap.get(type_1);
                            if (!nodeProcessor) {
                                onUnexpectedError(new Error("unknown offline node type: ".concat(type_1)), 'processing offline node');
                                return [3 /*break*/, 0];
                            }
                            return [4 /*yield*/, nodeProcessor(node_2)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 0];
                        case 2:
                            isProcessing = false;
                            return [2 /*return*/];
                    }
                });
            }); };
            promise().catch(function (error) { return onUnexpectedError(error, 'processing offline nodes'); });
        };
        return { enqueue: enqueue };
    };
    var offlineNodeProcessor = makeOfflineNodeProcessor();
    var processNode = function (type, node, identifier, exec) {
        var isOffline = !!node.attrs.offline;
        if (isOffline) {
            offlineNodeProcessor.enqueue(type, node);
        }
        else {
            processNodeWithBuffer(node, identifier, exec);
        }
    };
    // Handles newsletter notifications
    function handleNewsletterNotification(node) {
        return __awaiter(this, void 0, void 0, function () {
            var from, child, author, _a, reactionUpdate, viewUpdate, participantUpdate, settingsNode, update, nameNode, descriptionNode, plaintextNode, contentBuf, messageProto, fullMessage, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        from = node.attrs.from;
                        child = (0, WABinary_1.getAllBinaryNodeChildren)(node)[0];
                        author = node.attrs.participant;
                        logger.info({ from: from, child: child }, 'got newsletter notification');
                        _a = child.tag;
                        switch (_a) {
                            case 'reaction': return [3 /*break*/, 1];
                            case 'view': return [3 /*break*/, 2];
                            case 'participant': return [3 /*break*/, 3];
                            case 'update': return [3 /*break*/, 4];
                            case 'message': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 10];
                    case 1:
                        reactionUpdate = {
                            id: from,
                            server_id: child.attrs.message_id,
                            reaction: {
                                code: (0, WABinary_1.getBinaryNodeChildString)(child, 'reaction'),
                                count: 1
                            }
                        };
                        ev.emit('newsletter.reaction', reactionUpdate);
                        return [3 /*break*/, 11];
                    case 2:
                        viewUpdate = {
                            id: from,
                            server_id: child.attrs.message_id,
                            count: parseInt(((_b = child.content) === null || _b === void 0 ? void 0 : _b.toString()) || '0', 10)
                        };
                        ev.emit('newsletter.view', viewUpdate);
                        return [3 /*break*/, 11];
                    case 3:
                        participantUpdate = {
                            id: from,
                            author: author,
                            user: child.attrs.jid,
                            action: child.attrs.action,
                            new_role: child.attrs.role
                        };
                        ev.emit('newsletter-participants.update', participantUpdate);
                        return [3 /*break*/, 11];
                    case 4:
                        settingsNode = (0, WABinary_1.getBinaryNodeChild)(child, 'settings');
                        if (settingsNode) {
                            update = {};
                            nameNode = (0, WABinary_1.getBinaryNodeChild)(settingsNode, 'name');
                            if (nameNode === null || nameNode === void 0 ? void 0 : nameNode.content)
                                update.name = nameNode.content.toString();
                            descriptionNode = (0, WABinary_1.getBinaryNodeChild)(settingsNode, 'description');
                            if (descriptionNode === null || descriptionNode === void 0 ? void 0 : descriptionNode.content)
                                update.description = descriptionNode.content.toString();
                            ev.emit('newsletter-settings.update', {
                                id: from,
                                update: update
                            });
                        }
                        return [3 /*break*/, 11];
                    case 5:
                        plaintextNode = (0, WABinary_1.getBinaryNodeChild)(child, 'plaintext');
                        if (!(plaintextNode === null || plaintextNode === void 0 ? void 0 : plaintextNode.content)) return [3 /*break*/, 9];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        contentBuf = typeof plaintextNode.content === 'string'
                            ? Buffer.from(plaintextNode.content, 'binary')
                            : Buffer.from(plaintextNode.content);
                        messageProto = index_js_1.proto.Message.decode(contentBuf);
                        fullMessage = index_js_1.proto.WebMessageInfo.fromObject({
                            key: {
                                remoteJid: from,
                                id: child.attrs.message_id || child.attrs.server_id,
                                fromMe: false
                            },
                            message: messageProto,
                            messageTimestamp: +child.attrs.t
                        });
                        return [4 /*yield*/, upsertMessage(fullMessage, 'append')];
                    case 7:
                        _c.sent();
                        logger.info('Processed plaintext newsletter message');
                        return [3 /*break*/, 9];
                    case 8:
                        error_3 = _c.sent();
                        logger.error({ error: error_3 }, 'Failed to decode plaintext newsletter message');
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        logger.warn({ node: node }, 'Unknown newsletter notification');
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    }
    // Handles mex newsletter notifications
    function handleMexNewsletterNotification(node) {
        return __awaiter(this, void 0, void 0, function () {
            var mexNode, data, operation, updates, _i, updates_1, update, _a, updates_2, update;
            return __generator(this, function (_b) {
                mexNode = (0, WABinary_1.getBinaryNodeChild)(node, 'mex');
                if (!(mexNode === null || mexNode === void 0 ? void 0 : mexNode.content)) {
                    logger.warn({ node: node }, 'Invalid mex newsletter notification');
                    return [2 /*return*/];
                }
                try {
                    data = JSON.parse(mexNode.content.toString());
                }
                catch (error) {
                    logger.error({ err: error, node: node }, 'Failed to parse mex newsletter notification');
                    return [2 /*return*/];
                }
                operation = data === null || data === void 0 ? void 0 : data.operation;
                updates = data === null || data === void 0 ? void 0 : data.updates;
                if (!updates || !operation) {
                    logger.warn({ data: data }, 'Invalid mex newsletter notification content');
                    return [2 /*return*/];
                }
                logger.info({ operation: operation, updates: updates }, 'got mex newsletter notification');
                switch (operation) {
                    case 'NotificationNewsletterUpdate':
                        for (_i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
                            update = updates_1[_i];
                            if (update.jid && update.settings && Object.keys(update.settings).length > 0) {
                                ev.emit('newsletter-settings.update', {
                                    id: update.jid,
                                    update: update.settings
                                });
                            }
                        }
                        break;
                    case 'NotificationNewsletterAdminPromote':
                        for (_a = 0, updates_2 = updates; _a < updates_2.length; _a++) {
                            update = updates_2[_a];
                            if (update.jid && update.user) {
                                ev.emit('newsletter-participants.update', {
                                    id: update.jid,
                                    author: node.attrs.from,
                                    user: update.user,
                                    new_role: 'ADMIN',
                                    action: 'promote'
                                });
                            }
                        }
                        break;
                    default:
                        logger.info({ operation: operation, data: data }, 'Unhandled mex newsletter notification');
                        break;
                }
                return [2 /*return*/];
            });
        });
    }
    // recv a message
    ws.on('CB:message', function (node) {
        processNode('message', node, 'processing message', handleMessage);
    });
    ws.on('CB:call', function (node) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            processNode('call', node, 'handling call', handleCall);
            return [2 /*return*/];
        });
    }); });
    ws.on('CB:receipt', function (node) {
        processNode('receipt', node, 'handling receipt', handleReceipt);
    });
    ws.on('CB:notification', function (node) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            processNode('notification', node, 'handling notification', handleNotification);
            return [2 /*return*/];
        });
    }); });
    ws.on('CB:ack,class:message', function (node) {
        handleBadAck(node).catch(function (error) { return onUnexpectedError(error, 'handling bad ack'); });
    });
    ev.on('call', function (_a) {
        var call = _a[0];
        if (!call) {
            return;
        }
        // missed call + group call notification message generation
        if (call.status === 'timeout' || (call.status === 'offer' && call.isGroup)) {
            var msg = {
                key: {
                    remoteJid: call.chatId,
                    id: call.id,
                    fromMe: false
                },
                messageTimestamp: (0, Utils_1.unixTimestampSeconds)(call.date)
            };
            if (call.status === 'timeout') {
                if (call.isGroup) {
                    msg.messageStubType = call.isVideo
                        ? Types_1.WAMessageStubType.CALL_MISSED_GROUP_VIDEO
                        : Types_1.WAMessageStubType.CALL_MISSED_GROUP_VOICE;
                }
                else {
                    msg.messageStubType = call.isVideo ? Types_1.WAMessageStubType.CALL_MISSED_VIDEO : Types_1.WAMessageStubType.CALL_MISSED_VOICE;
                }
            }
            else {
                msg.message = { call: { callKey: Buffer.from(call.id) } };
            }
            var protoMsg = index_js_1.proto.WebMessageInfo.fromObject(msg);
            upsertMessage(protoMsg, call.offline ? 'append' : 'notify');
        }
    });
    ev.on('connection.update', function (_a) {
        var isOnline = _a.isOnline;
        if (typeof isOnline !== 'undefined') {
            sendActiveReceipts = isOnline;
            logger.trace("sendActiveReceipts set to \"".concat(sendActiveReceipts, "\""));
        }
    });
    return __assign(__assign({}, sock), { sendMessageAck: sendMessageAck, sendRetryRequest: sendRetryRequest, rejectCall: rejectCall, fetchMessageHistory: fetchMessageHistory, requestPlaceholderResend: requestPlaceholderResend });
};
exports.makeMessagesRecvSocket = makeMessagesRecvSocket;
//# sourceMappingURL=messages-recv.js.map