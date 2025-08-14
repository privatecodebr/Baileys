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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.makeMessagesSocket = void 0;
var node_cache_1 = require("@cacheable/node-cache");
var boom_1 = require("@hapi/boom");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var Utils_1 = require("../Utils/index.js");
var link_preview_1 = require("../Utils/link-preview.js");
var WABinary_1 = require("../WABinary/index.js");
var WAUSync_1 = require("../WAUSync/index.js");
var groups_1 = require("./groups.js");
var newsletter_1 = require("./newsletter.js");
var makeMessagesSocket = function (config) {
    var logger = config.logger, linkPreviewImageThumbnailWidth = config.linkPreviewImageThumbnailWidth, generateHighQualityLinkPreview = config.generateHighQualityLinkPreview, axiosOptions = config.options, patchMessageBeforeSending = config.patchMessageBeforeSending, cachedGroupMetadata = config.cachedGroupMetadata;
    var sock = (0, newsletter_1.makeNewsletterSocket)((0, groups_1.makeGroupsSocket)(config));
    var ev = sock.ev, authState = sock.authState, processingMutex = sock.processingMutex, signalRepository = sock.signalRepository, upsertMessage = sock.upsertMessage, query = sock.query, fetchPrivacySettings = sock.fetchPrivacySettings, sendNode = sock.sendNode, groupMetadata = sock.groupMetadata, groupToggleEphemeral = sock.groupToggleEphemeral;
    var userDevicesCache = config.userDevicesCache ||
        new node_cache_1.default({
            stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.USER_DEVICES, // 5 minutes
            useClones: false
        });
    var mediaConn;
    var refreshMediaConn = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (forceGet) {
            var media;
            if (forceGet === void 0) { forceGet = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mediaConn];
                    case 1:
                        media = _a.sent();
                        if (!media || forceGet || new Date().getTime() - media.fetchDate.getTime() > media.ttl * 1000) {
                            mediaConn = (function () { return __awaiter(void 0, void 0, void 0, function () {
                                var result, mediaConnNode, node;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, query({
                                                tag: 'iq',
                                                attrs: {
                                                    type: 'set',
                                                    xmlns: 'w:m',
                                                    to: WABinary_1.S_WHATSAPP_NET
                                                },
                                                content: [{ tag: 'media_conn', attrs: {} }]
                                            })];
                                        case 1:
                                            result = _a.sent();
                                            mediaConnNode = (0, WABinary_1.getBinaryNodeChild)(result, 'media_conn');
                                            node = {
                                                hosts: (0, WABinary_1.getBinaryNodeChildren)(mediaConnNode, 'host').map(function (_a) {
                                                    var attrs = _a.attrs;
                                                    return ({
                                                        hostname: attrs.hostname,
                                                        maxContentLengthBytes: +attrs.maxContentLengthBytes
                                                    });
                                                }),
                                                auth: mediaConnNode.attrs.auth,
                                                ttl: +mediaConnNode.attrs.ttl,
                                                fetchDate: new Date()
                                            };
                                            logger.debug('fetched media conn');
                                            return [2 /*return*/, node];
                                    }
                                });
                            }); })();
                        }
                        return [2 /*return*/, mediaConn];
                }
            });
        });
    };
    /**
     * generic send receipt function
     * used for receipts of phone call, read, delivery etc.
     * */
    var sendReceipt = function (jid, participant, messageIds, type) { return __awaiter(void 0, void 0, void 0, function () {
        var node, isReadReceipt, remainingMessageIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!messageIds || messageIds.length === 0) {
                        throw new boom_1.Boom('missing ids in receipt');
                    }
                    node = {
                        tag: 'receipt',
                        attrs: {
                            id: messageIds[0]
                        }
                    };
                    isReadReceipt = type === 'read' || type === 'read-self';
                    if (isReadReceipt) {
                        node.attrs.t = (0, Utils_1.unixTimestampSeconds)().toString();
                    }
                    if (type === 'sender' && (0, WABinary_1.isJidUser)(jid)) {
                        node.attrs.recipient = jid;
                        node.attrs.to = participant;
                    }
                    else {
                        node.attrs.to = jid;
                        if (participant) {
                            node.attrs.participant = participant;
                        }
                    }
                    if (type) {
                        node.attrs.type = type;
                    }
                    remainingMessageIds = messageIds.slice(1);
                    if (remainingMessageIds.length) {
                        node.content = [
                            {
                                tag: 'list',
                                attrs: {},
                                content: remainingMessageIds.map(function (id) { return ({
                                    tag: 'item',
                                    attrs: { id: id }
                                }); })
                            }
                        ];
                    }
                    logger.debug({ attrs: node.attrs, messageIds: messageIds }, 'sending receipt for messages');
                    return [4 /*yield*/, sendNode(node)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /** Correctly bulk send receipts to multiple chats, participants */
    var sendReceipts = function (keys, type) { return __awaiter(void 0, void 0, void 0, function () {
        var recps, _i, recps_1, _a, jid, participant, messageIds;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    recps = (0, Utils_1.aggregateMessageKeysNotFromMe)(keys);
                    _i = 0, recps_1 = recps;
                    _b.label = 1;
                case 1:
                    if (!(_i < recps_1.length)) return [3 /*break*/, 4];
                    _a = recps_1[_i], jid = _a.jid, participant = _a.participant, messageIds = _a.messageIds;
                    return [4 /*yield*/, sendReceipt(jid, participant, messageIds, type)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /** Bulk read messages. Keys can be from different chats & participants */
    var readMessages = function (keys) { return __awaiter(void 0, void 0, void 0, function () {
        var privacySettings, readType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchPrivacySettings()
                    // based on privacy settings, we have to change the read type
                ];
                case 1:
                    privacySettings = _a.sent();
                    readType = privacySettings.readreceipts === 'all' ? 'read' : 'read-self';
                    return [4 /*yield*/, sendReceipts(keys, readType)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /** Fetch all the devices we've to send a message to */
    var getUSyncDevices = function (jids, useCache, ignoreZeroDevices) { return __awaiter(void 0, void 0, void 0, function () {
        var deviceResults, toFetch, _i, jids_1, jid, user, devices, query, _a, toFetch_1, jid, result, extracted, deviceMap, _b, extracted_1, item, key;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    deviceResults = [];
                    if (!useCache) {
                        logger.debug('not using cache for devices');
                    }
                    toFetch = [];
                    jids = Array.from(new Set(jids));
                    for (_i = 0, jids_1 = jids; _i < jids_1.length; _i++) {
                        jid = jids_1[_i];
                        user = (_c = (0, WABinary_1.jidDecode)(jid)) === null || _c === void 0 ? void 0 : _c.user;
                        jid = (0, WABinary_1.jidNormalizedUser)(jid);
                        if (useCache) {
                            devices = userDevicesCache.get(user);
                            if (devices) {
                                deviceResults.push.apply(deviceResults, devices);
                                logger.trace({ user: user }, 'using cache for devices');
                            }
                            else {
                                toFetch.push(jid);
                            }
                        }
                        else {
                            toFetch.push(jid);
                        }
                    }
                    if (!toFetch.length) {
                        return [2 /*return*/, deviceResults];
                    }
                    query = new WAUSync_1.USyncQuery().withContext('message').withDeviceProtocol();
                    for (_a = 0, toFetch_1 = toFetch; _a < toFetch_1.length; _a++) {
                        jid = toFetch_1[_a];
                        query.withUser(new WAUSync_1.USyncUser().withId(jid));
                    }
                    return [4 /*yield*/, sock.executeUSyncQuery(query)];
                case 1:
                    result = _e.sent();
                    if (result) {
                        extracted = (0, Utils_1.extractDeviceJids)(result === null || result === void 0 ? void 0 : result.list, authState.creds.me.id, ignoreZeroDevices);
                        deviceMap = {};
                        for (_b = 0, extracted_1 = extracted; _b < extracted_1.length; _b++) {
                            item = extracted_1[_b];
                            deviceMap[item.user] = deviceMap[item.user] || [];
                            (_d = deviceMap[item.user]) === null || _d === void 0 ? void 0 : _d.push(item);
                            deviceResults.push(item);
                        }
                        for (key in deviceMap) {
                            userDevicesCache.set(key, deviceMap[key]);
                        }
                    }
                    return [2 /*return*/, deviceResults];
            }
        });
    }); };
    var assertSessions = function (jids, force) { return __awaiter(void 0, void 0, void 0, function () {
        var didFetchNewSession, jidsRequiringFetch, addrs, sessions, _i, jids_2, jid, signalId, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    didFetchNewSession = false;
                    jidsRequiringFetch = [];
                    if (!force) return [3 /*break*/, 1];
                    jidsRequiringFetch = jids;
                    return [3 /*break*/, 3];
                case 1:
                    addrs = jids.map(function (jid) { return signalRepository.jidToSignalProtocolAddress(jid); });
                    return [4 /*yield*/, authState.keys.get('session', addrs)];
                case 2:
                    sessions = _a.sent();
                    for (_i = 0, jids_2 = jids; _i < jids_2.length; _i++) {
                        jid = jids_2[_i];
                        signalId = signalRepository.jidToSignalProtocolAddress(jid);
                        if (!sessions[signalId]) {
                            jidsRequiringFetch.push(jid);
                        }
                    }
                    _a.label = 3;
                case 3:
                    if (!jidsRequiringFetch.length) return [3 /*break*/, 6];
                    logger.debug({ jidsRequiringFetch: jidsRequiringFetch }, 'fetching sessions');
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: {
                                xmlns: 'encrypt',
                                type: 'get',
                                to: WABinary_1.S_WHATSAPP_NET
                            },
                            content: [
                                {
                                    tag: 'key',
                                    attrs: {},
                                    content: jidsRequiringFetch.map(function (jid) { return ({
                                        tag: 'user',
                                        attrs: { jid: jid }
                                    }); })
                                }
                            ]
                        })];
                case 4:
                    result = _a.sent();
                    return [4 /*yield*/, (0, Utils_1.parseAndInjectE2ESessions)(result, signalRepository)];
                case 5:
                    _a.sent();
                    didFetchNewSession = true;
                    _a.label = 6;
                case 6: return [2 /*return*/, didFetchNewSession];
            }
        });
    }); };
    var sendPeerDataOperationMessage = function (pdoMessage) { return __awaiter(void 0, void 0, void 0, function () {
        var protocolMessage, meJid, msgId;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    //TODO: for later, abstract the logic to send a Peer Message instead of just PDO - useful for App State Key Resync with phone
                    if (!((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id)) {
                        throw new boom_1.Boom('Not authenticated');
                    }
                    protocolMessage = {
                        protocolMessage: {
                            peerDataOperationRequestMessage: pdoMessage,
                            type: index_js_1.proto.Message.ProtocolMessage.Type.PEER_DATA_OPERATION_REQUEST_MESSAGE
                        }
                    };
                    meJid = (0, WABinary_1.jidNormalizedUser)(authState.creds.me.id);
                    return [4 /*yield*/, relayMessage(meJid, protocolMessage, {
                            additionalAttributes: {
                                category: 'peer',
                                push_priority: 'high_force'
                            }
                        })];
                case 1:
                    msgId = _b.sent();
                    return [2 /*return*/, msgId];
            }
        });
    }); };
    var createParticipantNodes = function (jids, message, extraAttrs) { return __awaiter(void 0, void 0, void 0, function () {
        var patched, shouldIncludeDeviceIdentity, nodes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, patchMessageBeforeSending(message, jids)];
                case 1:
                    patched = _a.sent();
                    if (!Array.isArray(patched)) {
                        patched = jids ? jids.map(function (jid) { return (__assign({ recipientJid: jid }, patched)); }) : [patched];
                    }
                    shouldIncludeDeviceIdentity = false;
                    return [4 /*yield*/, Promise.all(patched.map(function (patchedMessageWithJid) { return __awaiter(void 0, void 0, void 0, function () {
                            var jid, patchedMessage, bytes, _a, type, ciphertext, node;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        jid = patchedMessageWithJid.recipientJid, patchedMessage = __rest(patchedMessageWithJid, ["recipientJid"]);
                                        if (!jid) {
                                            return [2 /*return*/, {}];
                                        }
                                        bytes = (0, Utils_1.encodeWAMessage)(patchedMessage);
                                        return [4 /*yield*/, signalRepository.encryptMessage({ jid: jid, data: bytes })];
                                    case 1:
                                        _a = _b.sent(), type = _a.type, ciphertext = _a.ciphertext;
                                        if (type === 'pkmsg') {
                                            shouldIncludeDeviceIdentity = true;
                                        }
                                        node = {
                                            tag: 'to',
                                            attrs: { jid: jid },
                                            content: [
                                                {
                                                    tag: 'enc',
                                                    attrs: __assign({ v: '2', type: type }, (extraAttrs || {})),
                                                    content: ciphertext
                                                }
                                            ]
                                        };
                                        return [2 /*return*/, node];
                                }
                            });
                        }); }))];
                case 2:
                    nodes = _a.sent();
                    return [2 /*return*/, { nodes: nodes, shouldIncludeDeviceIdentity: shouldIncludeDeviceIdentity }];
            }
        });
    }); };
    var relayMessage = function (jid_1, message_1, _a) { return __awaiter(void 0, [jid_1, message_1, _a], void 0, function (jid, message, _b) {
        var meId, shouldIncludeDeviceIdentity, _c, user, server, statusJid, isGroup, isStatus, isLid, isNewsletter, participants, destinationJid, binaryNodeContent, devices, meMsg, extraAttrs, _d, user_1, device;
        var _e;
        var msgId = _b.messageId, participant = _b.participant, additionalAttributes = _b.additionalAttributes, additionalNodes = _b.additionalNodes, useUserDevicesCache = _b.useUserDevicesCache, useCachedGroupMetadata = _b.useCachedGroupMetadata, statusJidList = _b.statusJidList;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    meId = authState.creds.me.id;
                    shouldIncludeDeviceIdentity = false;
                    _c = (0, WABinary_1.jidDecode)(jid), user = _c.user, server = _c.server;
                    statusJid = 'status@broadcast';
                    isGroup = server === 'g.us';
                    isStatus = jid === statusJid;
                    isLid = server === 'lid';
                    isNewsletter = server === 'newsletter';
                    msgId = msgId || (0, Utils_1.generateMessageIDV2)((_e = sock.user) === null || _e === void 0 ? void 0 : _e.id);
                    useUserDevicesCache = useUserDevicesCache !== false;
                    useCachedGroupMetadata = useCachedGroupMetadata !== false && !isStatus;
                    participants = [];
                    destinationJid = !isStatus ? (0, WABinary_1.jidEncode)(user, isLid ? 'lid' : isGroup ? 'g.us' : 's.whatsapp.net') : statusJid;
                    binaryNodeContent = [];
                    devices = [];
                    meMsg = {
                        deviceSentMessage: {
                            destinationJid: destinationJid,
                            message: message
                        },
                        messageContextInfo: message.messageContextInfo
                    };
                    extraAttrs = {};
                    if (participant) {
                        // when the retry request is not for a group
                        // only send to the specific device that asked for a retry
                        // otherwise the message is sent out to every device that should be a recipient
                        if (!isGroup && !isStatus) {
                            additionalAttributes = __assign(__assign({}, additionalAttributes), { device_fanout: 'false' });
                        }
                        _d = (0, WABinary_1.jidDecode)(participant.jid), user_1 = _d.user, device = _d.device;
                        devices.push({ user: user_1, device: device });
                    }
                    return [4 /*yield*/, authState.keys.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var mediaType, patched, _a, bytes, stanza_1, _b, groupData, senderKeyMap, participantsList, additionalDevices, patched, bytes, _c, ciphertext, senderKeyDistributionMessage, senderKeyJids, _i, devices_1, _d, user_2, device, jid_2, senderKeyMsg, result, meUser, additionalDevices, allJids, meJids, otherJids, _e, devices_2, _f, user_3, device, isMe, jid_3, _g, _h, meNodes, s1, _j, otherNodes, s2, peerNode, stanza;
                            var _k, _l;
                            var _m, _o, _p, _q, _r;
                            return __generator(this, function (_s) {
                                switch (_s.label) {
                                    case 0:
                                        mediaType = getMediaType(message);
                                        if (mediaType) {
                                            extraAttrs['mediatype'] = mediaType;
                                        }
                                        if (!isNewsletter) return [3 /*break*/, 5];
                                        if (!patchMessageBeforeSending) return [3 /*break*/, 2];
                                        return [4 /*yield*/, patchMessageBeforeSending(message, [])];
                                    case 1:
                                        _a = _s.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _a = message;
                                        _s.label = 3;
                                    case 3:
                                        patched = _a;
                                        bytes = (0, Utils_1.encodeNewsletterMessage)(patched);
                                        binaryNodeContent.push({
                                            tag: 'plaintext',
                                            attrs: {},
                                            content: bytes
                                        });
                                        stanza_1 = {
                                            tag: 'message',
                                            attrs: __assign({ to: jid, id: msgId, type: getMessageType(message) }, (additionalAttributes || {})),
                                            content: binaryNodeContent
                                        };
                                        logger.debug({ msgId: msgId }, "sending newsletter message to ".concat(jid));
                                        return [4 /*yield*/, sendNode(stanza_1)];
                                    case 4:
                                        _s.sent();
                                        return [2 /*return*/];
                                    case 5:
                                        if ((_m = (0, Utils_1.normalizeMessageContent)(message)) === null || _m === void 0 ? void 0 : _m.pinInChatMessage) {
                                            extraAttrs['decrypt-fail'] = 'hide';
                                        }
                                        if (!(isGroup || isStatus)) return [3 /*break*/, 15];
                                        return [4 /*yield*/, Promise.all([
                                                (function () { return __awaiter(void 0, void 0, void 0, function () {
                                                    var groupData, _a;
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0:
                                                                if (!(useCachedGroupMetadata && cachedGroupMetadata)) return [3 /*break*/, 2];
                                                                return [4 /*yield*/, cachedGroupMetadata(jid)];
                                                            case 1:
                                                                _a = _b.sent();
                                                                return [3 /*break*/, 3];
                                                            case 2:
                                                                _a = undefined;
                                                                _b.label = 3;
                                                            case 3:
                                                                groupData = _a;
                                                                if (!(groupData && Array.isArray(groupData === null || groupData === void 0 ? void 0 : groupData.participants))) return [3 /*break*/, 4];
                                                                logger.trace({ jid: jid, participants: groupData.participants.length }, 'using cached group metadata');
                                                                return [3 /*break*/, 6];
                                                            case 4:
                                                                if (!!isStatus) return [3 /*break*/, 6];
                                                                return [4 /*yield*/, groupMetadata(jid)];
                                                            case 5:
                                                                groupData = _b.sent();
                                                                _b.label = 6;
                                                            case 6: return [2 /*return*/, groupData];
                                                        }
                                                    });
                                                }); })(),
                                                (function () { return __awaiter(void 0, void 0, void 0, function () {
                                                    var result;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (!(!participant && !isStatus)) return [3 /*break*/, 2];
                                                                return [4 /*yield*/, authState.keys.get('sender-key-memory', [jid])];
                                                            case 1:
                                                                result = _a.sent();
                                                                return [2 /*return*/, result[jid] || {}];
                                                            case 2: return [2 /*return*/, {}];
                                                        }
                                                    });
                                                }); })()
                                            ])];
                                    case 6:
                                        _b = _s.sent(), groupData = _b[0], senderKeyMap = _b[1];
                                        if (!!participant) return [3 /*break*/, 8];
                                        participantsList = groupData && !isStatus ? groupData.participants.map(function (p) { return p.id; }) : [];
                                        if (isStatus && statusJidList) {
                                            participantsList.push.apply(participantsList, statusJidList);
                                        }
                                        if (!isStatus) {
                                            additionalAttributes = __assign(__assign({}, additionalAttributes), { addressing_mode: (groupData === null || groupData === void 0 ? void 0 : groupData.addressingMode) || 'pn' });
                                        }
                                        return [4 /*yield*/, getUSyncDevices(participantsList, !!useUserDevicesCache, false)];
                                    case 7:
                                        additionalDevices = _s.sent();
                                        devices.push.apply(devices, additionalDevices);
                                        _s.label = 8;
                                    case 8: return [4 /*yield*/, patchMessageBeforeSending(message)];
                                    case 9:
                                        patched = _s.sent();
                                        if (Array.isArray(patched)) {
                                            throw new boom_1.Boom('Per-jid patching is not supported in groups');
                                        }
                                        bytes = (0, Utils_1.encodeWAMessage)(patched);
                                        return [4 /*yield*/, signalRepository.encryptGroupMessage({
                                                group: destinationJid,
                                                data: bytes,
                                                meId: meId
                                            })];
                                    case 10:
                                        _c = _s.sent(), ciphertext = _c.ciphertext, senderKeyDistributionMessage = _c.senderKeyDistributionMessage;
                                        senderKeyJids = [];
                                        // ensure a connection is established with every device
                                        for (_i = 0, devices_1 = devices; _i < devices_1.length; _i++) {
                                            _d = devices_1[_i], user_2 = _d.user, device = _d.device;
                                            jid_2 = (0, WABinary_1.jidEncode)(user_2, (groupData === null || groupData === void 0 ? void 0 : groupData.addressingMode) === 'lid' ? 'lid' : 's.whatsapp.net', device);
                                            if (!senderKeyMap[jid_2] || !!participant) {
                                                senderKeyJids.push(jid_2);
                                                // store that this person has had the sender keys sent to them
                                                senderKeyMap[jid_2] = true;
                                            }
                                        }
                                        if (!senderKeyJids.length) return [3 /*break*/, 13];
                                        logger.debug({ senderKeyJids: senderKeyJids }, 'sending new sender key');
                                        senderKeyMsg = {
                                            senderKeyDistributionMessage: {
                                                axolotlSenderKeyDistributionMessage: senderKeyDistributionMessage,
                                                groupId: destinationJid
                                            }
                                        };
                                        return [4 /*yield*/, assertSessions(senderKeyJids, false)];
                                    case 11:
                                        _s.sent();
                                        return [4 /*yield*/, createParticipantNodes(senderKeyJids, senderKeyMsg, extraAttrs)];
                                    case 12:
                                        result = _s.sent();
                                        shouldIncludeDeviceIdentity = shouldIncludeDeviceIdentity || result.shouldIncludeDeviceIdentity;
                                        participants.push.apply(participants, result.nodes);
                                        _s.label = 13;
                                    case 13:
                                        binaryNodeContent.push({
                                            tag: 'enc',
                                            attrs: { v: '2', type: 'skmsg' },
                                            content: ciphertext
                                        });
                                        return [4 /*yield*/, authState.keys.set({ 'sender-key-memory': (_k = {}, _k[jid] = senderKeyMap, _k) })];
                                    case 14:
                                        _s.sent();
                                        return [3 /*break*/, 20];
                                    case 15:
                                        meUser = (0, WABinary_1.jidDecode)(meId).user;
                                        if (!!participant) return [3 /*break*/, 17];
                                        devices.push({ user: user });
                                        if (user !== meUser) {
                                            devices.push({ user: meUser });
                                        }
                                        if (!((additionalAttributes === null || additionalAttributes === void 0 ? void 0 : additionalAttributes['category']) !== 'peer')) return [3 /*break*/, 17];
                                        return [4 /*yield*/, getUSyncDevices([meId, jid], !!useUserDevicesCache, true)];
                                    case 16:
                                        additionalDevices = _s.sent();
                                        devices.push.apply(devices, additionalDevices);
                                        _s.label = 17;
                                    case 17:
                                        allJids = [];
                                        meJids = [];
                                        otherJids = [];
                                        for (_e = 0, devices_2 = devices; _e < devices_2.length; _e++) {
                                            _f = devices_2[_e], user_3 = _f.user, device = _f.device;
                                            isMe = user_3 === meUser;
                                            jid_3 = (0, WABinary_1.jidEncode)(isMe && isLid ? ((_p = (_o = authState.creds) === null || _o === void 0 ? void 0 : _o.me) === null || _p === void 0 ? void 0 : _p.lid.split(':')[0]) || user_3 : user_3, isLid ? 'lid' : 's.whatsapp.net', device);
                                            if (isMe) {
                                                meJids.push(jid_3);
                                            }
                                            else {
                                                otherJids.push(jid_3);
                                            }
                                            allJids.push(jid_3);
                                        }
                                        return [4 /*yield*/, assertSessions(allJids, false)];
                                    case 18:
                                        _s.sent();
                                        return [4 /*yield*/, Promise.all([
                                                createParticipantNodes(meJids, meMsg, extraAttrs),
                                                createParticipantNodes(otherJids, message, extraAttrs)
                                            ])];
                                    case 19:
                                        _g = _s.sent(), _h = _g[0], meNodes = _h.nodes, s1 = _h.shouldIncludeDeviceIdentity, _j = _g[1], otherNodes = _j.nodes, s2 = _j.shouldIncludeDeviceIdentity;
                                        participants.push.apply(participants, meNodes);
                                        participants.push.apply(participants, otherNodes);
                                        shouldIncludeDeviceIdentity = shouldIncludeDeviceIdentity || s1 || s2;
                                        _s.label = 20;
                                    case 20:
                                        if (participants.length) {
                                            if ((additionalAttributes === null || additionalAttributes === void 0 ? void 0 : additionalAttributes['category']) === 'peer') {
                                                peerNode = (_r = (_q = participants[0]) === null || _q === void 0 ? void 0 : _q.content) === null || _r === void 0 ? void 0 : _r[0];
                                                if (peerNode) {
                                                    binaryNodeContent.push(peerNode); // push only enc
                                                }
                                            }
                                            else {
                                                binaryNodeContent.push({
                                                    tag: 'participants',
                                                    attrs: {},
                                                    content: participants
                                                });
                                            }
                                        }
                                        stanza = {
                                            tag: 'message',
                                            attrs: __assign({ id: msgId, type: getMessageType(message) }, (additionalAttributes || {})),
                                            content: binaryNodeContent
                                        };
                                        // if the participant to send to is explicitly specified (generally retry recp)
                                        // ensure the message is only sent to that person
                                        // if a retry receipt is sent to everyone -- it'll fail decryption for everyone else who received the msg
                                        if (participant) {
                                            if ((0, WABinary_1.isJidGroup)(destinationJid)) {
                                                stanza.attrs.to = destinationJid;
                                                stanza.attrs.participant = participant.jid;
                                            }
                                            else if ((0, WABinary_1.areJidsSameUser)(participant.jid, meId)) {
                                                stanza.attrs.to = participant.jid;
                                                stanza.attrs.recipient = destinationJid;
                                            }
                                            else {
                                                stanza.attrs.to = participant.jid;
                                            }
                                        }
                                        else {
                                            stanza.attrs.to = destinationJid;
                                        }
                                        if (shouldIncludeDeviceIdentity) {
                                            ;
                                            stanza.content.push({
                                                tag: 'device-identity',
                                                attrs: {},
                                                content: (0, Utils_1.encodeSignedDeviceIdentity)(authState.creds.account, true)
                                            });
                                            logger.debug({ jid: jid }, 'adding device identity');
                                        }
                                        if (additionalNodes && additionalNodes.length > 0) {
                                            ;
                                            (_l = stanza.content).push.apply(_l, additionalNodes);
                                        }
                                        logger.debug({ msgId: msgId }, "sending message to ".concat(participants.length, " devices"));
                                        return [4 /*yield*/, sendNode(stanza)];
                                    case 21:
                                        _s.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _f.sent();
                    return [2 /*return*/, msgId];
            }
        });
    }); };
    var getMessageType = function (message) {
        if (message.pollCreationMessage || message.pollCreationMessageV2 || message.pollCreationMessageV3) {
            return 'poll';
        }
        return 'text';
    };
    var getMediaType = function (message) {
        if (message.imageMessage) {
            return 'image';
        }
        else if (message.videoMessage) {
            return message.videoMessage.gifPlayback ? 'gif' : 'video';
        }
        else if (message.audioMessage) {
            return message.audioMessage.ptt ? 'ptt' : 'audio';
        }
        else if (message.contactMessage) {
            return 'vcard';
        }
        else if (message.documentMessage) {
            return 'document';
        }
        else if (message.contactsArrayMessage) {
            return 'contact_array';
        }
        else if (message.liveLocationMessage) {
            return 'livelocation';
        }
        else if (message.stickerMessage) {
            return 'sticker';
        }
        else if (message.listMessage) {
            return 'list';
        }
        else if (message.listResponseMessage) {
            return 'list_response';
        }
        else if (message.buttonsResponseMessage) {
            return 'buttons_response';
        }
        else if (message.orderMessage) {
            return 'order';
        }
        else if (message.productMessage) {
            return 'product';
        }
        else if (message.interactiveResponseMessage) {
            return 'native_flow_response';
        }
        else if (message.groupInviteMessage) {
            return 'url';
        }
    };
    var getPrivacyTokens = function (jids) { return __awaiter(void 0, void 0, void 0, function () {
        var t, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    t = (0, Utils_1.unixTimestampSeconds)().toString();
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: {
                                to: WABinary_1.S_WHATSAPP_NET,
                                type: 'set',
                                xmlns: 'privacy'
                            },
                            content: [
                                {
                                    tag: 'tokens',
                                    attrs: {},
                                    content: jids.map(function (jid) { return ({
                                        tag: 'token',
                                        attrs: {
                                            jid: (0, WABinary_1.jidNormalizedUser)(jid),
                                            t: t,
                                            type: 'trusted_contact'
                                        }
                                    }); })
                                }
                            ]
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    }); };
    var waUploadToServer = (0, Utils_1.getWAUploadToServer)(config, refreshMediaConn);
    var waitForMsgMediaUpdate = (0, Utils_1.bindWaitForEvent)(ev, 'messages.media-update');
    return __assign(__assign({}, sock), { getPrivacyTokens: getPrivacyTokens, assertSessions: assertSessions, relayMessage: relayMessage, sendReceipt: sendReceipt, sendReceipts: sendReceipts, readMessages: readMessages, refreshMediaConn: refreshMediaConn, waUploadToServer: waUploadToServer, fetchPrivacySettings: fetchPrivacySettings, sendPeerDataOperationMessage: sendPeerDataOperationMessage, createParticipantNodes: createParticipantNodes, getUSyncDevices: getUSyncDevices, updateMediaMessage: function (message) { return __awaiter(void 0, void 0, void 0, function () {
            var content, mediaKey, meId, node, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        content = (0, Utils_1.assertMediaContent)(message.message);
                        mediaKey = content.mediaKey;
                        meId = authState.creds.me.id;
                        return [4 /*yield*/, (0, Utils_1.encryptMediaRetryRequest)(message.key, mediaKey, meId)];
                    case 1:
                        node = _a.sent();
                        error = undefined;
                        return [4 /*yield*/, Promise.all([
                                sendNode(node),
                                waitForMsgMediaUpdate(function (update) { return __awaiter(void 0, void 0, void 0, function () {
                                    var result, media, resultStr, err_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                result = update.find(function (c) { return c.key.id === message.key.id; });
                                                if (!result) return [3 /*break*/, 5];
                                                if (!result.error) return [3 /*break*/, 1];
                                                error = result.error;
                                                return [3 /*break*/, 4];
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, (0, Utils_1.decryptMediaRetryData)(result.media, mediaKey, result.key.id)];
                                            case 2:
                                                media = _a.sent();
                                                if (media.result !== index_js_1.proto.MediaRetryNotification.ResultType.SUCCESS) {
                                                    resultStr = index_js_1.proto.MediaRetryNotification.ResultType[media.result];
                                                    throw new boom_1.Boom("Media re-upload failed by device (".concat(resultStr, ")"), {
                                                        data: media,
                                                        statusCode: (0, Utils_1.getStatusCodeForMediaRetry)(media.result) || 404
                                                    });
                                                }
                                                content.directPath = media.directPath;
                                                content.url = (0, Utils_1.getUrlFromDirectPath)(content.directPath);
                                                logger.debug({ directPath: media.directPath, key: result.key }, 'media update successful');
                                                return [3 /*break*/, 4];
                                            case 3:
                                                err_1 = _a.sent();
                                                error = err_1;
                                                return [3 /*break*/, 4];
                                            case 4: return [2 /*return*/, true];
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                }); })
                            ])];
                    case 2:
                        _a.sent();
                        if (error) {
                            throw error;
                        }
                        ev.emit('messages.update', [{ key: message.key, update: { message: message.message } }]);
                        return [2 /*return*/, message];
                }
            });
        }); }, sendMessage: function (jid_1, content_1) {
            var args_1 = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args_1[_i - 2] = arguments[_i];
            }
            return __awaiter(void 0, __spreadArray([jid_1, content_1], args_1, true), void 0, function (jid, content, options) {
                var userJid, disappearingMessagesInChat, value, fullMsg_1, isDeleteMsg, isEditMsg, isPinMsg, isPollMessage, additionalAttributes, additionalNodes;
                var _a, _b, _c;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            userJid = authState.creds.me.id;
                            if (!(typeof content === 'object' &&
                                'disappearingMessagesInChat' in content &&
                                typeof content['disappearingMessagesInChat'] !== 'undefined' &&
                                (0, WABinary_1.isJidGroup)(jid))) return [3 /*break*/, 2];
                            disappearingMessagesInChat = content.disappearingMessagesInChat;
                            value = typeof disappearingMessagesInChat === 'boolean'
                                ? disappearingMessagesInChat
                                    ? Defaults_1.WA_DEFAULT_EPHEMERAL
                                    : 0
                                : disappearingMessagesInChat;
                            return [4 /*yield*/, groupToggleEphemeral(jid, value)];
                        case 1:
                            _d.sent();
                            return [3 /*break*/, 5];
                        case 2: return [4 /*yield*/, (0, Utils_1.generateWAMessage)(jid, content, __assign({ logger: logger, userJid: userJid, getUrlInfo: function (text) {
                                    return (0, link_preview_1.getUrlInfo)(text, {
                                        thumbnailWidth: linkPreviewImageThumbnailWidth,
                                        fetchOpts: __assign({ timeout: 3000 }, (axiosOptions || {})),
                                        logger: logger,
                                        uploadImage: generateHighQualityLinkPreview ? waUploadToServer : undefined
                                    });
                                }, 
                                //TODO: CACHE
                                getProfilePicUrl: sock.profilePictureUrl, upload: waUploadToServer, mediaCache: config.mediaCache, options: config.options, messageId: (0, Utils_1.generateMessageIDV2)((_a = sock.user) === null || _a === void 0 ? void 0 : _a.id) }, options))];
                        case 3:
                            fullMsg_1 = _d.sent();
                            isDeleteMsg = 'delete' in content && !!content.delete;
                            isEditMsg = 'edit' in content && !!content.edit;
                            isPinMsg = 'pin' in content && !!content.pin;
                            isPollMessage = 'poll' in content && !!content.poll;
                            additionalAttributes = {};
                            additionalNodes = [];
                            // required for delete
                            if (isDeleteMsg) {
                                // if the chat is a group, and I am not the author, then delete the message as an admin
                                if ((0, WABinary_1.isJidGroup)((_b = content.delete) === null || _b === void 0 ? void 0 : _b.remoteJid) && !((_c = content.delete) === null || _c === void 0 ? void 0 : _c.fromMe)) {
                                    additionalAttributes.edit = '8';
                                }
                                else {
                                    additionalAttributes.edit = '7';
                                }
                            }
                            else if (isEditMsg) {
                                additionalAttributes.edit = '1';
                            }
                            else if (isPinMsg) {
                                additionalAttributes.edit = '2';
                            }
                            else if (isPollMessage) {
                                additionalNodes.push({
                                    tag: 'meta',
                                    attrs: {
                                        polltype: 'creation'
                                    }
                                });
                            }
                            if ('cachedGroupMetadata' in options) {
                                console.warn('cachedGroupMetadata in sendMessage are deprecated, now cachedGroupMetadata is part of the socket config.');
                            }
                            return [4 /*yield*/, relayMessage(jid, fullMsg_1.message, {
                                    messageId: fullMsg_1.key.id,
                                    useCachedGroupMetadata: options.useCachedGroupMetadata,
                                    additionalAttributes: additionalAttributes,
                                    statusJidList: options.statusJidList,
                                    additionalNodes: additionalNodes
                                })];
                        case 4:
                            _d.sent();
                            if (config.emitOwnEvents) {
                                process.nextTick(function () {
                                    processingMutex.mutex(function () { return upsertMessage(fullMsg_1, 'append'); });
                                });
                            }
                            return [2 /*return*/, fullMsg_1];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        } });
};
exports.makeMessagesSocket = makeMessagesSocket;
//# sourceMappingURL=messages-send.js.map