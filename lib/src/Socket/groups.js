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
exports.extractGroupMetadata = exports.makeGroupsSocket = void 0;
var index_js_1 = require("../../WAProto/index.js");
var Types_1 = require("../Types/index.js");
var Utils_1 = require("../Utils/index.js");
var WABinary_1 = require("../WABinary/index.js");
var chats_1 = require("./chats.js");
var makeGroupsSocket = function (config) {
    var sock = (0, chats_1.makeChatsSocket)(config);
    var authState = sock.authState, ev = sock.ev, query = sock.query, upsertMessage = sock.upsertMessage;
    var groupQuery = function (jid, type, content) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, query({
                    tag: 'iq',
                    attrs: {
                        type: type,
                        xmlns: 'w:g2',
                        to: jid
                    },
                    content: content
                })];
        });
    }); };
    var groupMetadata = function (jid) { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, groupQuery(jid, 'get', [{ tag: 'query', attrs: { request: 'interactive' } }])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, (0, exports.extractGroupMetadata)(result)];
            }
        });
    }); };
    var groupFetchAllParticipating = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, data, groupsChild, groups, _i, groups_1, groupNode, meta;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            to: '@g.us',
                            xmlns: 'w:g2',
                            type: 'get'
                        },
                        content: [
                            {
                                tag: 'participating',
                                attrs: {},
                                content: [
                                    { tag: 'participants', attrs: {} },
                                    { tag: 'description', attrs: {} }
                                ]
                            }
                        ]
                    })];
                case 1:
                    result = _a.sent();
                    data = {};
                    groupsChild = (0, WABinary_1.getBinaryNodeChild)(result, 'groups');
                    if (groupsChild) {
                        groups = (0, WABinary_1.getBinaryNodeChildren)(groupsChild, 'group');
                        for (_i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                            groupNode = groups_1[_i];
                            meta = (0, exports.extractGroupMetadata)({
                                tag: 'result',
                                attrs: {},
                                content: [groupNode]
                            });
                            data[meta.id] = meta;
                        }
                    }
                    sock.ev.emit('groups.update', Object.values(data));
                    return [2 /*return*/, data];
            }
        });
    }); };
    sock.ws.on('CB:ib,,dirty', function (node) { return __awaiter(void 0, void 0, void 0, function () {
        var attrs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attrs = (0, WABinary_1.getBinaryNodeChild)(node, 'dirty').attrs;
                    if (attrs.type !== 'groups') {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, groupFetchAllParticipating()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sock.cleanDirtyBits('groups')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    return __assign(__assign({}, sock), { groupMetadata: groupMetadata, groupCreate: function (subject, participants) { return __awaiter(void 0, void 0, void 0, function () {
            var key, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = (0, Utils_1.generateMessageIDV2)();
                        return [4 /*yield*/, groupQuery('@g.us', 'set', [
                                {
                                    tag: 'create',
                                    attrs: {
                                        subject: subject,
                                        key: key
                                    },
                                    content: participants.map(function (jid) { return ({
                                        tag: 'participant',
                                        attrs: { jid: jid }
                                    }); })
                                }
                            ])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, (0, exports.extractGroupMetadata)(result)];
                }
            });
        }); }, groupLeave: function (id) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery('@g.us', 'set', [
                            {
                                tag: 'leave',
                                attrs: {},
                                content: [{ tag: 'group', attrs: { id: id } }]
                            }
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, groupUpdateSubject: function (jid, subject) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'set', [
                            {
                                tag: 'subject',
                                attrs: {},
                                content: Buffer.from(subject, 'utf-8')
                            }
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, groupRequestParticipantsList: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            var result, node, participants;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'get', [
                            {
                                tag: 'membership_approval_requests',
                                attrs: {}
                            }
                        ])];
                    case 1:
                        result = _a.sent();
                        node = (0, WABinary_1.getBinaryNodeChild)(result, 'membership_approval_requests');
                        participants = (0, WABinary_1.getBinaryNodeChildren)(node, 'membership_approval_request');
                        return [2 /*return*/, participants.map(function (v) { return v.attrs; })];
                }
            });
        }); }, groupRequestParticipantsUpdate: function (jid, participants, action) { return __awaiter(void 0, void 0, void 0, function () {
            var result, node, nodeAction, participantsAffected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'set', [
                            {
                                tag: 'membership_requests_action',
                                attrs: {},
                                content: [
                                    {
                                        tag: action,
                                        attrs: {},
                                        content: participants.map(function (jid) { return ({
                                            tag: 'participant',
                                            attrs: { jid: jid }
                                        }); })
                                    }
                                ]
                            }
                        ])];
                    case 1:
                        result = _a.sent();
                        node = (0, WABinary_1.getBinaryNodeChild)(result, 'membership_requests_action');
                        nodeAction = (0, WABinary_1.getBinaryNodeChild)(node, action);
                        participantsAffected = (0, WABinary_1.getBinaryNodeChildren)(nodeAction, 'participant');
                        return [2 /*return*/, participantsAffected.map(function (p) {
                                return { status: p.attrs.error || '200', jid: p.attrs.jid };
                            })];
                }
            });
        }); }, groupParticipantsUpdate: function (jid, participants, action) { return __awaiter(void 0, void 0, void 0, function () {
            var result, node, participantsAffected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'set', [
                            {
                                tag: action,
                                attrs: {},
                                content: participants.map(function (jid) { return ({
                                    tag: 'participant',
                                    attrs: { jid: jid }
                                }); })
                            }
                        ])];
                    case 1:
                        result = _a.sent();
                        node = (0, WABinary_1.getBinaryNodeChild)(result, action);
                        participantsAffected = (0, WABinary_1.getBinaryNodeChildren)(node, 'participant');
                        return [2 /*return*/, participantsAffected.map(function (p) {
                                return { status: p.attrs.error || '200', jid: p.attrs.jid, content: p };
                            })];
                }
            });
        }); }, groupUpdateDescription: function (jid, description) { return __awaiter(void 0, void 0, void 0, function () {
            var metadata, prev;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, groupMetadata(jid)];
                    case 1:
                        metadata = _b.sent();
                        prev = (_a = metadata.descId) !== null && _a !== void 0 ? _a : null;
                        return [4 /*yield*/, groupQuery(jid, 'set', [
                                {
                                    tag: 'description',
                                    attrs: __assign(__assign({}, (description ? { id: (0, Utils_1.generateMessageIDV2)() } : { delete: 'true' })), (prev ? { prev: prev } : {})),
                                    content: description ? [{ tag: 'body', attrs: {}, content: Buffer.from(description, 'utf-8') }] : undefined
                                }
                            ])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); }, groupInviteCode: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            var result, inviteNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'get', [{ tag: 'invite', attrs: {} }])];
                    case 1:
                        result = _a.sent();
                        inviteNode = (0, WABinary_1.getBinaryNodeChild)(result, 'invite');
                        return [2 /*return*/, inviteNode === null || inviteNode === void 0 ? void 0 : inviteNode.attrs.code];
                }
            });
        }); }, groupRevokeInvite: function (jid) { return __awaiter(void 0, void 0, void 0, function () {
            var result, inviteNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'set', [{ tag: 'invite', attrs: {} }])];
                    case 1:
                        result = _a.sent();
                        inviteNode = (0, WABinary_1.getBinaryNodeChild)(result, 'invite');
                        return [2 /*return*/, inviteNode === null || inviteNode === void 0 ? void 0 : inviteNode.attrs.code];
                }
            });
        }); }, groupAcceptInvite: function (code) { return __awaiter(void 0, void 0, void 0, function () {
            var results, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery('@g.us', 'set', [{ tag: 'invite', attrs: { code: code } }])];
                    case 1:
                        results = _a.sent();
                        result = (0, WABinary_1.getBinaryNodeChild)(results, 'group');
                        return [2 /*return*/, result === null || result === void 0 ? void 0 : result.attrs.jid];
                }
            });
        }); }, 
        /**
         * revoke a v4 invite for someone
         * @param groupJid group jid
         * @param invitedJid jid of person you invited
         * @returns true if successful
         */
        groupRevokeInviteV4: function (groupJid, invitedJid) { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(groupJid, 'set', [
                            { tag: 'revoke', attrs: {}, content: [{ tag: 'participant', attrs: { jid: invitedJid } }] }
                        ])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, !!result];
                }
            });
        }); }, 
        /**
         * accept a GroupInviteMessage
         * @param key the key of the invite message, or optionally only provide the jid of the person who sent the invite
         * @param inviteMessage the message to accept
         */
        groupAcceptInviteV4: ev.createBufferedFunction(function (key, inviteMessage) { return __awaiter(void 0, void 0, void 0, function () {
            var results;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = typeof key === 'string' ? { remoteJid: key } : key;
                        return [4 /*yield*/, groupQuery(inviteMessage.groupJid, 'set', [
                                {
                                    tag: 'accept',
                                    attrs: {
                                        code: inviteMessage.inviteCode,
                                        expiration: inviteMessage.inviteExpiration.toString(),
                                        admin: key.remoteJid
                                    }
                                }
                            ])
                            // if we have the full message key
                            // update the invite message to be expired
                        ];
                    case 1:
                        results = _b.sent();
                        // if we have the full message key
                        // update the invite message to be expired
                        if (key.id) {
                            // create new invite message that is expired
                            inviteMessage = index_js_1.proto.Message.GroupInviteMessage.fromObject(inviteMessage);
                            inviteMessage.inviteExpiration = 0;
                            inviteMessage.inviteCode = '';
                            ev.emit('messages.update', [
                                {
                                    key: key,
                                    update: {
                                        message: {
                                            groupInviteMessage: inviteMessage
                                        }
                                    }
                                }
                            ]);
                        }
                        // generate the group add message
                        return [4 /*yield*/, upsertMessage({
                                key: {
                                    remoteJid: inviteMessage.groupJid,
                                    id: (0, Utils_1.generateMessageIDV2)((_a = sock.user) === null || _a === void 0 ? void 0 : _a.id),
                                    fromMe: false,
                                    participant: key.remoteJid
                                },
                                messageStubType: Types_1.WAMessageStubType.GROUP_PARTICIPANT_ADD,
                                messageStubParameters: [authState.creds.me.id],
                                participant: key.remoteJid,
                                messageTimestamp: (0, Utils_1.unixTimestampSeconds)()
                            }, 'notify')];
                    case 2:
                        // generate the group add message
                        _b.sent();
                        return [2 /*return*/, results.attrs.from];
                }
            });
        }); }), groupGetInviteInfo: function (code) { return __awaiter(void 0, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery('@g.us', 'get', [{ tag: 'invite', attrs: { code: code } }])];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, (0, exports.extractGroupMetadata)(results)];
                }
            });
        }); }, groupToggleEphemeral: function (jid, ephemeralExpiration) { return __awaiter(void 0, void 0, void 0, function () {
            var content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        content = ephemeralExpiration
                            ? { tag: 'ephemeral', attrs: { expiration: ephemeralExpiration.toString() } }
                            : { tag: 'not_ephemeral', attrs: {} };
                        return [4 /*yield*/, groupQuery(jid, 'set', [content])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, groupSettingUpdate: function (jid, setting) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'set', [{ tag: setting, attrs: {} }])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, groupMemberAddMode: function (jid, mode) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'set', [{ tag: 'member_add_mode', attrs: {}, content: mode }])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, groupJoinApprovalMode: function (jid, mode) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, groupQuery(jid, 'set', [
                            { tag: 'membership_approval_mode', attrs: {}, content: [{ tag: 'group_join', attrs: { state: mode } }] }
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, groupFetchAllParticipating: groupFetchAllParticipating });
};
exports.makeGroupsSocket = makeGroupsSocket;
var extractGroupMetadata = function (result) {
    var _a, _b;
    var group = (0, WABinary_1.getBinaryNodeChild)(result, 'group');
    var descChild = (0, WABinary_1.getBinaryNodeChild)(group, 'description');
    var desc;
    var descId;
    var descOwner;
    var descOwnerJid;
    var descTime;
    if (descChild) {
        desc = (0, WABinary_1.getBinaryNodeChildString)(descChild, 'body');
        descOwner = descChild.attrs.participant ? (0, WABinary_1.jidNormalizedUser)(descChild.attrs.participant) : undefined;
        descOwnerJid = descChild.attrs.participant_pn ? (0, WABinary_1.jidNormalizedUser)(descChild.attrs.participant_pn) : undefined;
        descTime = +descChild.attrs.t;
        descId = descChild.attrs.id;
    }
    var groupId = group.attrs.id.includes('@') ? group.attrs.id : (0, WABinary_1.jidEncode)(group.attrs.id, 'g.us');
    var eph = (_a = (0, WABinary_1.getBinaryNodeChild)(group, 'ephemeral')) === null || _a === void 0 ? void 0 : _a.attrs.expiration;
    var memberAddMode = (0, WABinary_1.getBinaryNodeChildString)(group, 'member_add_mode') === 'all_member_add';
    var metadata = {
        id: groupId,
        addressingMode: group.attrs.addressing_mode,
        subject: group.attrs.subject,
        subjectOwner: group.attrs.s_o,
        subjectOwnerJid: group.attrs.s_o_pn,
        subjectTime: +group.attrs.s_t,
        size: group.attrs.size ? +group.attrs.size : (0, WABinary_1.getBinaryNodeChildren)(group, 'participant').length,
        creation: +group.attrs.creation,
        owner: group.attrs.creator ? (0, WABinary_1.jidNormalizedUser)(group.attrs.creator) : undefined,
        ownerJid: group.attrs.creator_pn ? (0, WABinary_1.jidNormalizedUser)(group.attrs.creator_pn) : undefined,
        owner_country_code: group.attrs.creator_country_code,
        desc: desc,
        descId: descId,
        descOwner: descOwner,
        descOwnerJid: descOwnerJid,
        descTime: descTime,
        linkedParent: ((_b = (0, WABinary_1.getBinaryNodeChild)(group, 'linked_parent')) === null || _b === void 0 ? void 0 : _b.attrs.jid) || undefined,
        restrict: !!(0, WABinary_1.getBinaryNodeChild)(group, 'locked'),
        announce: !!(0, WABinary_1.getBinaryNodeChild)(group, 'announcement'),
        isCommunity: !!(0, WABinary_1.getBinaryNodeChild)(group, 'parent'),
        isCommunityAnnounce: !!(0, WABinary_1.getBinaryNodeChild)(group, 'default_sub_group'),
        joinApprovalMode: !!(0, WABinary_1.getBinaryNodeChild)(group, 'membership_approval_mode'),
        memberAddMode: memberAddMode,
        participants: (0, WABinary_1.getBinaryNodeChildren)(group, 'participant').map(function (_a) {
            var attrs = _a.attrs;
            return {
                id: attrs.jid,
                jid: (0, WABinary_1.isJidUser)(attrs.jid) ? attrs.jid : (0, WABinary_1.jidNormalizedUser)(attrs.phone_number),
                lid: (0, WABinary_1.isLidUser)(attrs.jid) ? attrs.jid : attrs.lid,
                admin: (attrs.type || null)
            };
        }),
        ephemeralDuration: eph ? +eph : undefined
    };
    return metadata;
};
exports.extractGroupMetadata = extractGroupMetadata;
//# sourceMappingURL=groups.js.map