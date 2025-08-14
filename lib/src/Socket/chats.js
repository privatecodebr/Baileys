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
exports.makeChatsSocket = void 0;
var node_cache_1 = require("@cacheable/node-cache");
var boom_1 = require("@hapi/boom");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var Types_1 = require("../Types/index.js");
var State_1 = require("../Types/State.js");
var Utils_1 = require("../Utils/index.js");
var make_mutex_1 = require("../Utils/make-mutex.js");
var process_message_1 = require("../Utils/process-message.js");
var WABinary_1 = require("../WABinary/index.js");
var WAUSync_1 = require("../WAUSync/index.js");
var usync_1 = require("./usync.js");
var MAX_SYNC_ATTEMPTS = 2;
var makeChatsSocket = function (config) {
    var logger = config.logger, markOnlineOnConnect = config.markOnlineOnConnect, fireInitQueries = config.fireInitQueries, appStateMacVerification = config.appStateMacVerification, shouldIgnoreJid = config.shouldIgnoreJid, shouldSyncHistoryMessage = config.shouldSyncHistoryMessage;
    var sock = (0, usync_1.makeUSyncSocket)(config);
    var ev = sock.ev, ws = sock.ws, authState = sock.authState, generateMessageTag = sock.generateMessageTag, sendNode = sock.sendNode, query = sock.query, onUnexpectedError = sock.onUnexpectedError;
    var privacySettings;
    var syncState = State_1.SyncState.Connecting;
    /** this mutex ensures that the notifications (receipts, messages etc.) are processed in order */
    var processingMutex = (0, make_mutex_1.makeMutex)();
    // Timeout for AwaitingInitialSync state
    var awaitingSyncTimeout;
    var placeholderResendCache = config.placeholderResendCache ||
        new node_cache_1.default({
            stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.MSG_RETRY, // 1 hour
            useClones: false
        });
    if (!config.placeholderResendCache) {
        config.placeholderResendCache = placeholderResendCache;
    }
    /** helper function to fetch the given app state sync key */
    var getAppStateSyncKey = function (keyId) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, key;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, authState.keys.get('app-state-sync-key', [keyId])];
                case 1:
                    _a = _c.sent(), _b = keyId, key = _a[_b];
                    return [2 /*return*/, key];
            }
        });
    }); };
    var fetchPrivacySettings = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (force) {
            var content;
            if (force === void 0) { force = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!privacySettings || force)) return [3 /*break*/, 2];
                        return [4 /*yield*/, query({
                                tag: 'iq',
                                attrs: {
                                    xmlns: 'privacy',
                                    to: WABinary_1.S_WHATSAPP_NET,
                                    type: 'get'
                                },
                                content: [{ tag: 'privacy', attrs: {} }]
                            })];
                    case 1:
                        content = (_a.sent()).content;
                        privacySettings = (0, WABinary_1.reduceBinaryNodeToDictionary)(content === null || content === void 0 ? void 0 : content[0], 'category');
                        _a.label = 2;
                    case 2: return [2 /*return*/, privacySettings];
                }
            });
        });
    };
    /** helper function to run a privacy IQ query */
    var privacyQuery = function (name, value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            xmlns: 'privacy',
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'set'
                        },
                        content: [
                            {
                                tag: 'privacy',
                                attrs: {},
                                content: [
                                    {
                                        tag: 'category',
                                        attrs: { name: name, value: value }
                                    }
                                ]
                            }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateMessagesPrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('messages', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateCallPrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('calladd', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateLastSeenPrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('last', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateOnlinePrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('online', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateProfilePicturePrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('profile', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateStatusPrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('status', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateReadReceiptsPrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('readreceipts', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateGroupsAddPrivacy = function (value) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, privacyQuery('groupadd', value)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateDefaultDisappearingMode = function (duration) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            xmlns: 'disappearing_mode',
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'set'
                        },
                        content: [
                            {
                                tag: 'disappearing_mode',
                                attrs: {
                                    duration: duration.toString()
                                }
                            }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var getBotListV2 = function () { return __awaiter(void 0, void 0, void 0, function () {
        var resp, botNode, botList, _i, _a, section, _b, _c, bot;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            xmlns: 'bot',
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'get'
                        },
                        content: [
                            {
                                tag: 'bot',
                                attrs: {
                                    v: '2'
                                }
                            }
                        ]
                    })];
                case 1:
                    resp = _d.sent();
                    botNode = (0, WABinary_1.getBinaryNodeChild)(resp, 'bot');
                    botList = [];
                    for (_i = 0, _a = (0, WABinary_1.getBinaryNodeChildren)(botNode, 'section'); _i < _a.length; _i++) {
                        section = _a[_i];
                        if (section.attrs.type === 'all') {
                            for (_b = 0, _c = (0, WABinary_1.getBinaryNodeChildren)(section, 'bot'); _b < _c.length; _b++) {
                                bot = _c[_b];
                                botList.push({
                                    jid: bot.attrs.jid,
                                    personaId: bot.attrs['persona_id']
                                });
                            }
                        }
                    }
                    return [2 /*return*/, botList];
            }
        });
    }); };
    var onWhatsApp = function () {
        var jids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            jids[_i] = arguments[_i];
        }
        return __awaiter(void 0, void 0, void 0, function () {
            var usyncQuery, _a, jids_1, jid, phone, results;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        usyncQuery = new WAUSync_1.USyncQuery().withContactProtocol().withLIDProtocol();
                        for (_a = 0, jids_1 = jids; _a < jids_1.length; _a++) {
                            jid = jids_1[_a];
                            phone = "+".concat((_b = jid.replace('+', '').split('@')[0]) === null || _b === void 0 ? void 0 : _b.split(':')[0]);
                            usyncQuery.withUser(new WAUSync_1.USyncUser().withPhone(phone));
                        }
                        return [4 /*yield*/, sock.executeUSyncQuery(usyncQuery)];
                    case 1:
                        results = _c.sent();
                        if (results) {
                            return [2 /*return*/, results.list.filter(function (a) { return !!a.contact; }).map(function (_a) {
                                    var contact = _a.contact, id = _a.id, lid = _a.lid;
                                    return ({ jid: id, exists: contact, lid: lid });
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    var fetchStatus = function () {
        var jids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            jids[_i] = arguments[_i];
        }
        return __awaiter(void 0, void 0, void 0, function () {
            var usyncQuery, _a, jids_2, jid, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        usyncQuery = new WAUSync_1.USyncQuery().withStatusProtocol();
                        for (_a = 0, jids_2 = jids; _a < jids_2.length; _a++) {
                            jid = jids_2[_a];
                            usyncQuery.withUser(new WAUSync_1.USyncUser().withId(jid));
                        }
                        return [4 /*yield*/, sock.executeUSyncQuery(usyncQuery)];
                    case 1:
                        result = _b.sent();
                        if (result) {
                            return [2 /*return*/, result.list];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    var fetchDisappearingDuration = function () {
        var jids = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            jids[_i] = arguments[_i];
        }
        return __awaiter(void 0, void 0, void 0, function () {
            var usyncQuery, _a, jids_3, jid, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        usyncQuery = new WAUSync_1.USyncQuery().withDisappearingModeProtocol();
                        for (_a = 0, jids_3 = jids; _a < jids_3.length; _a++) {
                            jid = jids_3[_a];
                            usyncQuery.withUser(new WAUSync_1.USyncUser().withId(jid));
                        }
                        return [4 /*yield*/, sock.executeUSyncQuery(usyncQuery)];
                    case 1:
                        result = _b.sent();
                        if (result) {
                            return [2 /*return*/, result.list];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /** update the profile picture for yourself or a group */
    var updateProfilePicture = function (jid, content, dimensions) { return __awaiter(void 0, void 0, void 0, function () {
        var targetJid, img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!jid) {
                        throw new boom_1.Boom('Illegal no-jid profile update. Please specify either your ID or the ID of the chat you wish to update');
                    }
                    if ((0, WABinary_1.jidNormalizedUser)(jid) !== (0, WABinary_1.jidNormalizedUser)(authState.creds.me.id)) {
                        targetJid = (0, WABinary_1.jidNormalizedUser)(jid); // in case it is someone other than us
                    }
                    else {
                        targetJid = undefined;
                    }
                    return [4 /*yield*/, (0, Utils_1.generateProfilePicture)(content, dimensions)];
                case 1:
                    img = (_a.sent()).img;
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: __assign({ to: WABinary_1.S_WHATSAPP_NET, type: 'set', xmlns: 'w:profile:picture' }, (targetJid ? { target: targetJid } : {})),
                            content: [
                                {
                                    tag: 'picture',
                                    attrs: { type: 'image' },
                                    content: img
                                }
                            ]
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /** remove the profile picture for yourself or a group */
    var removeProfilePicture = function (jid) { return __awaiter(void 0, void 0, void 0, function () {
        var targetJid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!jid) {
                        throw new boom_1.Boom('Illegal no-jid profile update. Please specify either your ID or the ID of the chat you wish to update');
                    }
                    if ((0, WABinary_1.jidNormalizedUser)(jid) !== (0, WABinary_1.jidNormalizedUser)(authState.creds.me.id)) {
                        targetJid = (0, WABinary_1.jidNormalizedUser)(jid); // in case it is someone other than us
                    }
                    else {
                        targetJid = undefined;
                    }
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: __assign({ to: WABinary_1.S_WHATSAPP_NET, type: 'set', xmlns: 'w:profile:picture' }, (targetJid ? { target: targetJid } : {}))
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /** update the profile status for yourself */
    var updateProfileStatus = function (status) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'set',
                            xmlns: 'status'
                        },
                        content: [
                            {
                                tag: 'status',
                                attrs: {},
                                content: Buffer.from(status, 'utf-8')
                            }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var updateProfileName = function (name) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, chatModify({ pushNameSetting: name }, '')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var fetchBlocklist = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, listNode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            xmlns: 'blocklist',
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'get'
                        }
                    })];
                case 1:
                    result = _a.sent();
                    listNode = (0, WABinary_1.getBinaryNodeChild)(result, 'list');
                    return [2 /*return*/, (0, WABinary_1.getBinaryNodeChildren)(listNode, 'item').map(function (n) { return n.attrs.jid; })];
            }
        });
    }); };
    var updateBlockStatus = function (jid, action) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            xmlns: 'blocklist',
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'set'
                        },
                        content: [
                            {
                                tag: 'item',
                                attrs: {
                                    action: action,
                                    jid: jid
                                }
                            }
                        ]
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var getBusinessProfile = function (jid) { return __awaiter(void 0, void 0, void 0, function () {
        var results, profileNode, profiles, address, description, website, email, category, businessHours, businessHoursConfig, websiteStr;
        var _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            to: 's.whatsapp.net',
                            xmlns: 'w:biz',
                            type: 'get'
                        },
                        content: [
                            {
                                tag: 'business_profile',
                                attrs: { v: '244' },
                                content: [
                                    {
                                        tag: 'profile',
                                        attrs: { jid: jid }
                                    }
                                ]
                            }
                        ]
                    })];
                case 1:
                    results = _h.sent();
                    profileNode = (0, WABinary_1.getBinaryNodeChild)(results, 'business_profile');
                    profiles = (0, WABinary_1.getBinaryNodeChild)(profileNode, 'profile');
                    if (profiles) {
                        address = (0, WABinary_1.getBinaryNodeChild)(profiles, 'address');
                        description = (0, WABinary_1.getBinaryNodeChild)(profiles, 'description');
                        website = (0, WABinary_1.getBinaryNodeChild)(profiles, 'website');
                        email = (0, WABinary_1.getBinaryNodeChild)(profiles, 'email');
                        category = (0, WABinary_1.getBinaryNodeChild)((0, WABinary_1.getBinaryNodeChild)(profiles, 'categories'), 'category');
                        businessHours = (0, WABinary_1.getBinaryNodeChild)(profiles, 'business_hours');
                        businessHoursConfig = businessHours
                            ? (0, WABinary_1.getBinaryNodeChildren)(businessHours, 'business_hours_config')
                            : undefined;
                        websiteStr = (_a = website === null || website === void 0 ? void 0 : website.content) === null || _a === void 0 ? void 0 : _a.toString();
                        return [2 /*return*/, {
                                wid: (_b = profiles.attrs) === null || _b === void 0 ? void 0 : _b.jid,
                                address: (_c = address === null || address === void 0 ? void 0 : address.content) === null || _c === void 0 ? void 0 : _c.toString(),
                                description: ((_d = description === null || description === void 0 ? void 0 : description.content) === null || _d === void 0 ? void 0 : _d.toString()) || '',
                                website: websiteStr ? [websiteStr] : [],
                                email: (_e = email === null || email === void 0 ? void 0 : email.content) === null || _e === void 0 ? void 0 : _e.toString(),
                                category: (_f = category === null || category === void 0 ? void 0 : category.content) === null || _f === void 0 ? void 0 : _f.toString(),
                                business_hours: {
                                    timezone: (_g = businessHours === null || businessHours === void 0 ? void 0 : businessHours.attrs) === null || _g === void 0 ? void 0 : _g.timezone,
                                    business_config: businessHoursConfig === null || businessHoursConfig === void 0 ? void 0 : businessHoursConfig.map(function (_a) {
                                        var attrs = _a.attrs;
                                        return attrs;
                                    })
                                }
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var cleanDirtyBits = function (type, fromTimestamp) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info({ fromTimestamp: fromTimestamp }, 'clean dirty bits ' + type);
                    return [4 /*yield*/, sendNode({
                            tag: 'iq',
                            attrs: {
                                to: WABinary_1.S_WHATSAPP_NET,
                                type: 'set',
                                xmlns: 'urn:xmpp:whatsapp:dirty',
                                id: generateMessageTag()
                            },
                            content: [
                                {
                                    tag: 'clean',
                                    attrs: __assign({ type: type }, (fromTimestamp ? { timestamp: fromTimestamp.toString() } : null))
                                }
                            ]
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var newAppStateChunkHandler = function (isInitialSync) {
        return {
            onMutation: function (mutation) {
                (0, Utils_1.processSyncAction)(mutation, ev, authState.creds.me, isInitialSync ? { accountSettings: authState.creds.accountSettings } : undefined, logger);
            }
        };
    };
    var resyncAppState = ev.createBufferedFunction(function (collections, isInitialSync) { return __awaiter(void 0, void 0, void 0, function () {
        var initialVersionMap, globalMutationMap, onMutation, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    initialVersionMap = {};
                    globalMutationMap = {};
                    return [4 /*yield*/, authState.keys.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var collectionsToHandle, attemptsMap, states, nodes, _i, _a, name_1, result_1, state, result, decoded, _b, _c, _d, _e, key, name_2, _f, patches, hasMorePatches, snapshot, _g, newState, mutationMap, _h, newState, mutationMap, error_1, isIrrecoverableError;
                            var _j, _k, _l;
                            var _m;
                            return __generator(this, function (_o) {
                                switch (_o.label) {
                                    case 0:
                                        collectionsToHandle = new Set(collections);
                                        attemptsMap = {};
                                        _o.label = 1;
                                    case 1:
                                        if (!collectionsToHandle.size) return [3 /*break*/, 20];
                                        states = {};
                                        nodes = [];
                                        _i = 0, _a = collectionsToHandle;
                                        _o.label = 2;
                                    case 2:
                                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                                        name_1 = _a[_i];
                                        return [4 /*yield*/, authState.keys.get('app-state-sync-version', [name_1])];
                                    case 3:
                                        result_1 = _o.sent();
                                        state = result_1[name_1];
                                        if (state) {
                                            if (typeof initialVersionMap[name_1] === 'undefined') {
                                                initialVersionMap[name_1] = state.version;
                                            }
                                        }
                                        else {
                                            state = (0, Utils_1.newLTHashState)();
                                        }
                                        states[name_1] = state;
                                        logger.info("resyncing ".concat(name_1, " from v").concat(state.version));
                                        nodes.push({
                                            tag: 'collection',
                                            attrs: {
                                                name: name_1,
                                                version: state.version.toString(),
                                                // return snapshot if being synced from scratch
                                                return_snapshot: (!state.version).toString()
                                            }
                                        });
                                        _o.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 5: return [4 /*yield*/, query({
                                            tag: 'iq',
                                            attrs: {
                                                to: WABinary_1.S_WHATSAPP_NET,
                                                xmlns: 'w:sync:app:state',
                                                type: 'set'
                                            },
                                            content: [
                                                {
                                                    tag: 'sync',
                                                    attrs: {},
                                                    content: nodes
                                                }
                                            ]
                                        })
                                        // extract from binary node
                                    ];
                                    case 6:
                                        result = _o.sent();
                                        return [4 /*yield*/, (0, Utils_1.extractSyncdPatches)(result, config === null || config === void 0 ? void 0 : config.options)];
                                    case 7:
                                        decoded = _o.sent();
                                        _b = decoded;
                                        _c = [];
                                        for (_d in _b)
                                            _c.push(_d);
                                        _e = 0;
                                        _o.label = 8;
                                    case 8:
                                        if (!(_e < _c.length)) return [3 /*break*/, 19];
                                        _d = _c[_e];
                                        if (!(_d in _b)) return [3 /*break*/, 18];
                                        key = _d;
                                        name_2 = key;
                                        _f = decoded[name_2], patches = _f.patches, hasMorePatches = _f.hasMorePatches, snapshot = _f.snapshot;
                                        _o.label = 9;
                                    case 9:
                                        _o.trys.push([9, 16, , 18]);
                                        if (!snapshot) return [3 /*break*/, 12];
                                        return [4 /*yield*/, (0, Utils_1.decodeSyncdSnapshot)(name_2, snapshot, getAppStateSyncKey, initialVersionMap[name_2], appStateMacVerification.snapshot)];
                                    case 10:
                                        _g = _o.sent(), newState = _g.state, mutationMap = _g.mutationMap;
                                        states[name_2] = newState;
                                        Object.assign(globalMutationMap, mutationMap);
                                        logger.info("restored state of ".concat(name_2, " from snapshot to v").concat(newState.version, " with mutations"));
                                        return [4 /*yield*/, authState.keys.set({ 'app-state-sync-version': (_j = {}, _j[name_2] = newState, _j) })];
                                    case 11:
                                        _o.sent();
                                        _o.label = 12;
                                    case 12:
                                        if (!patches.length) return [3 /*break*/, 15];
                                        return [4 /*yield*/, (0, Utils_1.decodePatches)(name_2, patches, states[name_2], getAppStateSyncKey, config.options, initialVersionMap[name_2], logger, appStateMacVerification.patch)];
                                    case 13:
                                        _h = _o.sent(), newState = _h.state, mutationMap = _h.mutationMap;
                                        return [4 /*yield*/, authState.keys.set({ 'app-state-sync-version': (_k = {}, _k[name_2] = newState, _k) })];
                                    case 14:
                                        _o.sent();
                                        logger.info("synced ".concat(name_2, " to v").concat(newState.version));
                                        initialVersionMap[name_2] = newState.version;
                                        Object.assign(globalMutationMap, mutationMap);
                                        _o.label = 15;
                                    case 15:
                                        if (hasMorePatches) {
                                            logger.info("".concat(name_2, " has more patches..."));
                                        }
                                        else {
                                            // collection is done with sync
                                            collectionsToHandle.delete(name_2);
                                        }
                                        return [3 /*break*/, 18];
                                    case 16:
                                        error_1 = _o.sent();
                                        isIrrecoverableError = attemptsMap[name_2] >= MAX_SYNC_ATTEMPTS ||
                                            ((_m = error_1.output) === null || _m === void 0 ? void 0 : _m.statusCode) === 404 ||
                                            error_1.name === 'TypeError';
                                        logger.info({ name: name_2, error: error_1.stack }, "failed to sync state from version".concat(isIrrecoverableError ? '' : ', removing and trying from scratch'));
                                        return [4 /*yield*/, authState.keys.set({ 'app-state-sync-version': (_l = {}, _l[name_2] = null, _l) })
                                            // increment number of retries
                                        ];
                                    case 17:
                                        _o.sent();
                                        // increment number of retries
                                        attemptsMap[name_2] = (attemptsMap[name_2] || 0) + 1;
                                        if (isIrrecoverableError) {
                                            // stop retrying
                                            collectionsToHandle.delete(name_2);
                                        }
                                        return [3 /*break*/, 18];
                                    case 18:
                                        _e++;
                                        return [3 /*break*/, 8];
                                    case 19: return [3 /*break*/, 1];
                                    case 20: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    onMutation = newAppStateChunkHandler(isInitialSync).onMutation;
                    for (key in globalMutationMap) {
                        onMutation(globalMutationMap[key]);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * fetch the profile picture of a user/group
     * type = "preview" for a low res picture
     * type = "image for the high res picture"
     */
    var profilePictureUrl = function (jid_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([jid_1], args_1, true), void 0, function (jid, type, timeoutMs) {
            var result, child;
            var _a;
            if (type === void 0) { type = 'preview'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        jid = (0, WABinary_1.jidNormalizedUser)(jid);
                        return [4 /*yield*/, query({
                                tag: 'iq',
                                attrs: {
                                    target: jid,
                                    to: WABinary_1.S_WHATSAPP_NET,
                                    type: 'get',
                                    xmlns: 'w:profile:picture'
                                },
                                content: [{ tag: 'picture', attrs: { type: type, query: 'url' } }]
                            }, timeoutMs)];
                    case 1:
                        result = _b.sent();
                        child = (0, WABinary_1.getBinaryNodeChild)(result, 'picture');
                        return [2 /*return*/, (_a = child === null || child === void 0 ? void 0 : child.attrs) === null || _a === void 0 ? void 0 : _a.url];
                }
            });
        });
    };
    var sendPresenceUpdate = function (type, toJid) { return __awaiter(void 0, void 0, void 0, function () {
        var me, server, isLid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    me = authState.creds.me;
                    if (!(type === 'available' || type === 'unavailable')) return [3 /*break*/, 2];
                    if (!me.name) {
                        logger.warn('no name present, ignoring presence update request...');
                        return [2 /*return*/];
                    }
                    ev.emit('connection.update', { isOnline: type === 'available' });
                    return [4 /*yield*/, sendNode({
                            tag: 'presence',
                            attrs: {
                                name: me.name.replace(/@/g, ''),
                                type: type
                            }
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    server = (0, WABinary_1.jidDecode)(toJid).server;
                    isLid = server === 'lid';
                    return [4 /*yield*/, sendNode({
                            tag: 'chatstate',
                            attrs: {
                                from: isLid ? me.lid : me.id,
                                to: toJid
                            },
                            content: [
                                {
                                    tag: type === 'recording' ? 'composing' : type,
                                    attrs: type === 'recording' ? { media: 'audio' } : {}
                                }
                            ]
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * @param toJid the jid to subscribe to
     * @param tcToken token for subscription, use if present
     */
    var presenceSubscribe = function (toJid, tcToken) {
        return sendNode({
            tag: 'presence',
            attrs: {
                to: toJid,
                id: generateMessageTag(),
                type: 'subscribe'
            },
            content: tcToken
                ? [
                    {
                        tag: 'tctoken',
                        attrs: {},
                        content: tcToken
                    }
                ]
                : undefined
        });
    };
    var handlePresenceUpdate = function (_a) {
        var _b;
        var _c;
        var tag = _a.tag, attrs = _a.attrs, content = _a.content;
        var presence;
        var jid = attrs.from;
        var participant = attrs.participant || attrs.from;
        if (shouldIgnoreJid(jid) && jid !== '@s.whatsapp.net') {
            return;
        }
        if (tag === 'presence') {
            presence = {
                lastKnownPresence: attrs.type === 'unavailable' ? 'unavailable' : 'available',
                lastSeen: attrs.last && attrs.last !== 'deny' ? +attrs.last : undefined
            };
        }
        else if (Array.isArray(content)) {
            var firstChild = content[0];
            var type = firstChild.tag;
            if (type === 'paused') {
                type = 'available';
            }
            if (((_c = firstChild.attrs) === null || _c === void 0 ? void 0 : _c.media) === 'audio') {
                type = 'recording';
            }
            presence = { lastKnownPresence: type };
        }
        else {
            logger.error({ tag: tag, attrs: attrs, content: content }, 'recv invalid presence node');
        }
        if (presence) {
            ev.emit('presence.update', { id: jid, presences: (_b = {}, _b[participant] = presence, _b) });
        }
    };
    var appPatch = function (patchCreate) { return __awaiter(void 0, void 0, void 0, function () {
        var name, myAppStateKeyId, initial, encodeResult, onMutation, mutationMap, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = patchCreate.type;
                    myAppStateKeyId = authState.creds.myAppStateKeyId;
                    if (!myAppStateKeyId) {
                        throw new boom_1.Boom('App state key not present!', { statusCode: 400 });
                    }
                    return [4 /*yield*/, processingMutex.mutex(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, authState.keys.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var _a, _b, currentSyncVersion, patch, state, node;
                                            var _c;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        logger.debug({ patch: patchCreate }, 'applying app patch');
                                                        return [4 /*yield*/, resyncAppState([name], false)];
                                                    case 1:
                                                        _d.sent();
                                                        return [4 /*yield*/, authState.keys.get('app-state-sync-version', [name])];
                                                    case 2:
                                                        _a = _d.sent(), _b = name, currentSyncVersion = _a[_b];
                                                        initial = currentSyncVersion || (0, Utils_1.newLTHashState)();
                                                        return [4 /*yield*/, (0, Utils_1.encodeSyncdPatch)(patchCreate, myAppStateKeyId, initial, getAppStateSyncKey)];
                                                    case 3:
                                                        encodeResult = _d.sent();
                                                        patch = encodeResult.patch, state = encodeResult.state;
                                                        node = {
                                                            tag: 'iq',
                                                            attrs: {
                                                                to: WABinary_1.S_WHATSAPP_NET,
                                                                type: 'set',
                                                                xmlns: 'w:sync:app:state'
                                                            },
                                                            content: [
                                                                {
                                                                    tag: 'sync',
                                                                    attrs: {},
                                                                    content: [
                                                                        {
                                                                            tag: 'collection',
                                                                            attrs: {
                                                                                name: name,
                                                                                version: (state.version - 1).toString(),
                                                                                return_snapshot: 'false'
                                                                            },
                                                                            content: [
                                                                                {
                                                                                    tag: 'patch',
                                                                                    attrs: {},
                                                                                    content: index_js_1.proto.SyncdPatch.encode(patch).finish()
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        };
                                                        return [4 /*yield*/, query(node)];
                                                    case 4:
                                                        _d.sent();
                                                        return [4 /*yield*/, authState.keys.set({ 'app-state-sync-version': (_c = {}, _c[name] = state, _c) })];
                                                    case 5:
                                                        _d.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    if (!config.emitOwnEvents) return [3 /*break*/, 3];
                    onMutation = newAppStateChunkHandler(false).onMutation;
                    return [4 /*yield*/, (0, Utils_1.decodePatches)(name, [__assign(__assign({}, encodeResult.patch), { version: { version: encodeResult.state.version } })], initial, getAppStateSyncKey, config.options, undefined, logger)];
                case 2:
                    mutationMap = (_a.sent()).mutationMap;
                    for (key in mutationMap) {
                        onMutation(mutationMap[key]);
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /** sending non-abt props may fix QR scan fail if server expects */
    var fetchProps = function () { return __awaiter(void 0, void 0, void 0, function () {
        var resultNode, propsNode, props;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            to: WABinary_1.S_WHATSAPP_NET,
                            xmlns: 'w',
                            type: 'get'
                        },
                        content: [
                            {
                                tag: 'props',
                                attrs: {
                                    protocol: '2',
                                    hash: ((_a = authState === null || authState === void 0 ? void 0 : authState.creds) === null || _a === void 0 ? void 0 : _a.lastPropHash) || ''
                                }
                            }
                        ]
                    })];
                case 1:
                    resultNode = _d.sent();
                    propsNode = (0, WABinary_1.getBinaryNodeChild)(resultNode, 'props');
                    props = {};
                    if (propsNode) {
                        if ((_b = propsNode.attrs) === null || _b === void 0 ? void 0 : _b.hash) {
                            // on some clients, the hash is returning as undefined
                            authState.creds.lastPropHash = (_c = propsNode === null || propsNode === void 0 ? void 0 : propsNode.attrs) === null || _c === void 0 ? void 0 : _c.hash;
                            ev.emit('creds.update', authState.creds);
                        }
                        props = (0, WABinary_1.reduceBinaryNodeToDictionary)(propsNode, 'prop');
                    }
                    logger.debug('fetched props');
                    return [2 /*return*/, props];
            }
        });
    }); };
    /**
     * modify a chat -- mark unread, read etc.
     * lastMessages must be sorted in reverse chronologically
     * requires the last messages till the last message received; required for archive & unread
     */
    var chatModify = function (mod, jid) {
        var patch = (0, Utils_1.chatModificationToAppPatch)(mod, jid);
        return appPatch(patch);
    };
    /**
     * Enable/Disable link preview privacy, not related to baileys link preview generation
     */
    var updateDisableLinkPreviewsPrivacy = function (isPreviewsDisabled) {
        return chatModify({
            disableLinkPreviews: { isPreviewsDisabled: isPreviewsDisabled }
        }, '');
    };
    /**
     * Star or Unstar a message
     */
    var star = function (jid, messages, star) {
        return chatModify({
            star: {
                messages: messages,
                star: star
            }
        }, jid);
    };
    /**
     * Add or Edit Contact
     */
    var addOrEditContact = function (jid, contact) {
        return chatModify({
            contact: contact
        }, jid);
    };
    /**
     * Remove Contact
     */
    var removeContact = function (jid) {
        return chatModify({
            contact: null
        }, jid);
    };
    /**
     * Adds label
     */
    var addLabel = function (jid, labels) {
        return chatModify({
            addLabel: __assign({}, labels)
        }, jid);
    };
    /**
     * Adds label for the chats
     */
    var addChatLabel = function (jid, labelId) {
        return chatModify({
            addChatLabel: {
                labelId: labelId
            }
        }, jid);
    };
    /**
     * Removes label for the chat
     */
    var removeChatLabel = function (jid, labelId) {
        return chatModify({
            removeChatLabel: {
                labelId: labelId
            }
        }, jid);
    };
    /**
     * Adds label for the message
     */
    var addMessageLabel = function (jid, messageId, labelId) {
        return chatModify({
            addMessageLabel: {
                messageId: messageId,
                labelId: labelId
            }
        }, jid);
    };
    /**
     * Removes label for the message
     */
    var removeMessageLabel = function (jid, messageId, labelId) {
        return chatModify({
            removeMessageLabel: {
                messageId: messageId,
                labelId: labelId
            }
        }, jid);
    };
    /**
     * queries need to be fired on connection open
     * help ensure parity with WA Web
     * */
    var executeInitQueries = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([fetchProps(), fetchBlocklist(), fetchPrivacySettings()])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var upsertMessage = ev.createBufferedFunction(function (msg, type) { return __awaiter(void 0, void 0, void 0, function () {
        var jid, historyMsg, shouldProcessHistoryMsg, doAppStateSync;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    ev.emit('messages.upsert', { messages: [msg], type: type });
                    if (!!msg.pushName) {
                        jid = msg.key.fromMe ? authState.creds.me.id : msg.key.participant || msg.key.remoteJid;
                        jid = (0, WABinary_1.jidNormalizedUser)(jid);
                        if (!msg.key.fromMe) {
                            ev.emit('contacts.update', [{ id: jid, notify: msg.pushName, verifiedName: msg.verifiedBizName }]);
                        }
                        // update our pushname too
                        if (msg.key.fromMe && msg.pushName && ((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.name) !== msg.pushName) {
                            ev.emit('creds.update', { me: __assign(__assign({}, authState.creds.me), { name: msg.pushName }) });
                        }
                    }
                    historyMsg = (0, Utils_1.getHistoryMsg)(msg.message);
                    shouldProcessHistoryMsg = historyMsg
                        ? shouldSyncHistoryMessage(historyMsg) && Defaults_1.PROCESSABLE_HISTORY_TYPES.includes(historyMsg.syncType)
                        : false;
                    // State machine: decide on sync and flush
                    if (historyMsg && syncState === State_1.SyncState.AwaitingInitialSync) {
                        if (awaitingSyncTimeout) {
                            clearTimeout(awaitingSyncTimeout);
                            awaitingSyncTimeout = undefined;
                        }
                        if (shouldProcessHistoryMsg) {
                            syncState = State_1.SyncState.Syncing;
                            logger.info('Transitioned to Syncing state');
                            // Let doAppStateSync handle the final flush after it's done
                        }
                        else {
                            syncState = State_1.SyncState.Online;
                            logger.info('History sync skipped, transitioning to Online state and flushing buffer');
                            ev.flush();
                        }
                    }
                    doAppStateSync = function () { return __awaiter(void 0, void 0, void 0, function () {
                        var accountSyncCounter;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(syncState === State_1.SyncState.Syncing)) return [3 /*break*/, 2];
                                    logger.info('Doing app state sync');
                                    return [4 /*yield*/, resyncAppState(Types_1.ALL_WA_PATCH_NAMES, true)
                                        // Sync is complete, go online and flush everything
                                    ];
                                case 1:
                                    _a.sent();
                                    // Sync is complete, go online and flush everything
                                    syncState = State_1.SyncState.Online;
                                    logger.info('App state sync complete, transitioning to Online state and flushing buffer');
                                    ev.flush();
                                    accountSyncCounter = (authState.creds.accountSyncCounter || 0) + 1;
                                    ev.emit('creds.update', { accountSyncCounter: accountSyncCounter });
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, Promise.all([
                            (function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!shouldProcessHistoryMsg) return [3 /*break*/, 2];
                                            return [4 /*yield*/, doAppStateSync()];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); })(),
                            (0, process_message_1.default)(msg, {
                                shouldProcessHistoryMsg: shouldProcessHistoryMsg,
                                placeholderResendCache: placeholderResendCache,
                                ev: ev,
                                creds: authState.creds,
                                keyStore: authState.keys,
                                logger: logger,
                                options: config.options
                            })
                        ])
                        // If the app state key arrives and we are waiting to sync, trigger the sync now.
                    ];
                case 1:
                    _d.sent();
                    if (!(((_c = (_b = msg.message) === null || _b === void 0 ? void 0 : _b.protocolMessage) === null || _c === void 0 ? void 0 : _c.appStateSyncKeyShare) && syncState === State_1.SyncState.Syncing)) return [3 /*break*/, 3];
                    logger.info('App state sync key arrived, triggering app state sync');
                    return [4 /*yield*/, doAppStateSync()];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    ws.on('CB:presence', handlePresenceUpdate);
    ws.on('CB:chatstate', handlePresenceUpdate);
    ws.on('CB:ib,,dirty', function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var attrs, type, _a, lastAccountSyncTimestamp;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    attrs = (0, WABinary_1.getBinaryNodeChild)(node, 'dirty').attrs;
                    type = attrs.type;
                    _a = type;
                    switch (_a) {
                        case 'account_sync': return [3 /*break*/, 1];
                        case 'groups': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 6];
                case 1:
                    if (!attrs.timestamp) return [3 /*break*/, 4];
                    lastAccountSyncTimestamp = authState.creds.lastAccountSyncTimestamp;
                    if (!lastAccountSyncTimestamp) return [3 /*break*/, 3];
                    return [4 /*yield*/, cleanDirtyBits('account_sync', lastAccountSyncTimestamp)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    lastAccountSyncTimestamp = +attrs.timestamp;
                    ev.emit('creds.update', { lastAccountSyncTimestamp: lastAccountSyncTimestamp });
                    _b.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5: 
                // handled in groups.ts
                return [3 /*break*/, 7];
                case 6:
                    logger.info({ node: node }, 'received unknown sync');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    ev.on('connection.update', function (_a) {
        var connection = _a.connection, receivedPendingNotifications = _a.receivedPendingNotifications;
        if (connection === 'open') {
            if (fireInitQueries) {
                executeInitQueries().catch(function (error) { return onUnexpectedError(error, 'init queries'); });
            }
            sendPresenceUpdate(markOnlineOnConnect ? 'available' : 'unavailable').catch(function (error) {
                return onUnexpectedError(error, 'presence update requests');
            });
        }
        if (!receivedPendingNotifications || syncState !== State_1.SyncState.Connecting) {
            return;
        }
        syncState = State_1.SyncState.AwaitingInitialSync;
        logger.info('Connection is now AwaitingInitialSync, buffering events');
        ev.buffer();
        var willSyncHistory = shouldSyncHistoryMessage(index_js_1.proto.Message.HistorySyncNotification.fromObject({
            syncType: index_js_1.proto.HistorySync.HistorySyncType.RECENT
        }));
        if (!willSyncHistory) {
            logger.info('History sync is disabled by config, not waiting for notification. Transitioning to Online.');
            syncState = State_1.SyncState.Online;
            setTimeout(function () { return ev.flush(); }, 0);
            return;
        }
        logger.info('History sync is enabled, awaiting notification with a 20s timeout.');
        if (awaitingSyncTimeout) {
            clearTimeout(awaitingSyncTimeout);
        }
        awaitingSyncTimeout = setTimeout(function () {
            if (syncState === State_1.SyncState.AwaitingInitialSync) {
                logger.warn('Timeout in AwaitingInitialSync, forcing state to Online and flushing buffer');
                syncState = State_1.SyncState.Online;
                ev.flush();
            }
        }, 20000);
    });
    return __assign(__assign({}, sock), { getBotListV2: getBotListV2, processingMutex: processingMutex, fetchPrivacySettings: fetchPrivacySettings, upsertMessage: upsertMessage, appPatch: appPatch, sendPresenceUpdate: sendPresenceUpdate, presenceSubscribe: presenceSubscribe, profilePictureUrl: profilePictureUrl, onWhatsApp: onWhatsApp, fetchBlocklist: fetchBlocklist, fetchStatus: fetchStatus, fetchDisappearingDuration: fetchDisappearingDuration, updateProfilePicture: updateProfilePicture, removeProfilePicture: removeProfilePicture, updateProfileStatus: updateProfileStatus, updateProfileName: updateProfileName, updateBlockStatus: updateBlockStatus, updateDisableLinkPreviewsPrivacy: updateDisableLinkPreviewsPrivacy, updateCallPrivacy: updateCallPrivacy, updateMessagesPrivacy: updateMessagesPrivacy, updateLastSeenPrivacy: updateLastSeenPrivacy, updateOnlinePrivacy: updateOnlinePrivacy, updateProfilePicturePrivacy: updateProfilePicturePrivacy, updateStatusPrivacy: updateStatusPrivacy, updateReadReceiptsPrivacy: updateReadReceiptsPrivacy, updateGroupsAddPrivacy: updateGroupsAddPrivacy, updateDefaultDisappearingMode: updateDefaultDisappearingMode, getBusinessProfile: getBusinessProfile, resyncAppState: resyncAppState, chatModify: chatModify, cleanDirtyBits: cleanDirtyBits, addOrEditContact: addOrEditContact, removeContact: removeContact, addLabel: addLabel, addChatLabel: addChatLabel, removeChatLabel: removeChatLabel, addMessageLabel: addMessageLabel, removeMessageLabel: removeMessageLabel, star: star });
};
exports.makeChatsSocket = makeChatsSocket;
//# sourceMappingURL=chats.js.map