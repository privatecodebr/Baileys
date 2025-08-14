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
exports.makeNewsletterSocket = void 0;
var Types_1 = require("../Types/index.js");
var messages_media_1 = require("../Utils/messages-media.js");
var WABinary_1 = require("../WABinary/index.js");
var mex_1 = require("./mex.js");
var parseNewsletterCreateResponse = function (response) {
    var id = response.id, thread = response.thread_metadata, viewer = response.viewer_metadata;
    return {
        id: id,
        owner: undefined,
        name: thread.name.text,
        creation_time: parseInt(thread.creation_time, 10),
        description: thread.description.text,
        invite: thread.invite,
        subscribers: parseInt(thread.subscribers_count, 10),
        verification: thread.verification,
        picture: {
            id: thread.picture.id,
            directPath: thread.picture.direct_path
        },
        mute_state: viewer.mute
    };
};
var parseNewsletterMetadata = function (result) {
    if (typeof result !== 'object' || result === null) {
        return null;
    }
    if ('id' in result && typeof result.id === 'string') {
        return result;
    }
    if ('result' in result && typeof result.result === 'object' && result.result !== null && 'id' in result.result) {
        return result.result;
    }
    return null;
};
var makeNewsletterSocket = function (sock) {
    var query = sock.query, generateMessageTag = sock.generateMessageTag;
    var executeWMexQuery = function (variables, queryId, dataPath) {
        return (0, mex_1.executeWMexQuery)(variables, queryId, dataPath, query, generateMessageTag);
    };
    var newsletterUpdate = function (jid, updates) { return __awaiter(void 0, void 0, void 0, function () {
        var variables;
        return __generator(this, function (_a) {
            variables = {
                newsletter_id: jid,
                updates: __assign(__assign({}, updates), { settings: null })
            };
            return [2 /*return*/, executeWMexQuery(variables, Types_1.QueryIds.UPDATE_METADATA, 'xwa2_newsletter_update')];
        });
    }); };
    return __assign(__assign({}, sock), { newsletterCreate: function (name, description) { return __awaiter(void 0, void 0, void 0, function () {
            var variables, rawResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        variables = {
                            input: {
                                name: name,
                                description: description !== null && description !== void 0 ? description : null
                            }
                        };
                        return [4 /*yield*/, executeWMexQuery(variables, Types_1.QueryIds.CREATE, Types_1.XWAPaths.xwa2_newsletter_create)];
                    case 1:
                        rawResponse = _a.sent();
                        return [2 /*return*/, parseNewsletterCreateResponse(rawResponse)];
                }
            });
        }); }, newsletterUpdate: newsletterUpdate, newsletterSubscribers: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, executeWMexQuery({ newsletter_id: jid }, Types_1.QueryIds.SUBSCRIBERS, Types_1.XWAPaths.xwa2_newsletter_subscribers)];
            });
        }); }, newsletterMetadata: function (type, key) { return __awaiter(void 0, void 0, void 0, function () {
            var variables, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        variables = {
                            fetch_creation_time: true,
                            fetch_full_image: true,
                            fetch_viewer_metadata: true,
                            input: {
                                key: key,
                                type: type.toUpperCase()
                            }
                        };
                        return [4 /*yield*/, executeWMexQuery(variables, Types_1.QueryIds.METADATA, Types_1.XWAPaths.xwa2_newsletter_metadata)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, parseNewsletterMetadata(result)];
                }
            });
        }); }, newsletterFollow: function (jid) {
            return executeWMexQuery({ newsletter_id: jid }, Types_1.QueryIds.FOLLOW, Types_1.XWAPaths.xwa2_newsletter_follow);
        }, newsletterUnfollow: function (jid) {
            return executeWMexQuery({ newsletter_id: jid }, Types_1.QueryIds.UNFOLLOW, Types_1.XWAPaths.xwa2_newsletter_unfollow);
        }, newsletterMute: function (jid) {
            return executeWMexQuery({ newsletter_id: jid }, Types_1.QueryIds.MUTE, Types_1.XWAPaths.xwa2_newsletter_mute_v2);
        }, newsletterUnmute: function (jid) {
            return executeWMexQuery({ newsletter_id: jid }, Types_1.QueryIds.UNMUTE, Types_1.XWAPaths.xwa2_newsletter_unmute_v2);
        }, newsletterUpdateName: function (jid, name) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, newsletterUpdate(jid, { name: name })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }, newsletterUpdateDescription: function (jid, description) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, newsletterUpdate(jid, { description: description })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }, newsletterUpdatePicture: function (jid, content) { return __awaiter(void 0, void 0, void 0, function () {
            var img;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, messages_media_1.generateProfilePicture)(content)];
                    case 1:
                        img = (_a.sent()).img;
                        return [4 /*yield*/, newsletterUpdate(jid, { picture: img.toString('base64') })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); }, newsletterRemovePicture: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, newsletterUpdate(jid, { picture: '' })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }, newsletterReactMessage: function (jid, serverId, reaction) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, query({
                            tag: 'message',
                            attrs: __assign(__assign({ to: jid }, (reaction ? {} : { edit: '7' })), { type: 'reaction', server_id: serverId, id: generateMessageTag() }),
                            content: [
                                {
                                    tag: 'reaction',
                                    attrs: reaction ? { code: reaction } : {}
                                }
                            ]
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, newsletterFetchMessages: function (jid, count, since, after) { return __awaiter(void 0, void 0, void 0, function () {
            var messageUpdateAttrs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageUpdateAttrs = {
                            count: count.toString()
                        };
                        if (typeof since === 'number') {
                            messageUpdateAttrs.since = since.toString();
                        }
                        if (after) {
                            messageUpdateAttrs.after = after.toString();
                        }
                        return [4 /*yield*/, query({
                                tag: 'iq',
                                attrs: {
                                    id: generateMessageTag(),
                                    type: 'get',
                                    xmlns: 'newsletter',
                                    to: jid
                                },
                                content: [
                                    {
                                        tag: 'message_updates',
                                        attrs: messageUpdateAttrs
                                    }
                                ]
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }, subscribeNewsletterUpdates: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            var result, liveUpdatesNode, duration;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: {
                                id: generateMessageTag(),
                                type: 'set',
                                xmlns: 'newsletter',
                                to: jid
                            },
                            content: [{ tag: 'live_updates', attrs: {}, content: [] }]
                        })];
                    case 1:
                        result = _b.sent();
                        liveUpdatesNode = (0, WABinary_1.getBinaryNodeChild)(result, 'live_updates');
                        duration = (_a = liveUpdatesNode === null || liveUpdatesNode === void 0 ? void 0 : liveUpdatesNode.attrs) === null || _a === void 0 ? void 0 : _a.duration;
                        return [2 /*return*/, duration ? { duration: duration } : null];
                }
            });
        }); }, newsletterAdminCount: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, executeWMexQuery({ newsletter_id: jid }, Types_1.QueryIds.ADMIN_COUNT, Types_1.XWAPaths.xwa2_newsletter_admin_count)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.admin_count];
                }
            });
        }); }, newsletterChangeOwner: function (jid, newOwnerJid) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, executeWMexQuery({ newsletter_id: jid, user_id: newOwnerJid }, Types_1.QueryIds.CHANGE_OWNER, Types_1.XWAPaths.xwa2_newsletter_change_owner)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, newsletterDemote: function (jid, userJid) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, executeWMexQuery({ newsletter_id: jid, user_id: userJid }, Types_1.QueryIds.DEMOTE, Types_1.XWAPaths.xwa2_newsletter_demote)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, newsletterDelete: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, executeWMexQuery({ newsletter_id: jid }, Types_1.QueryIds.DELETE, Types_1.XWAPaths.xwa2_newsletter_delete_v2)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); } });
};
exports.makeNewsletterSocket = makeNewsletterSocket;
//# sourceMappingURL=newsletter.js.map