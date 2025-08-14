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
exports.makeEventBuffer = void 0;
var events_1 = require("events");
var Types_1 = require("../Types/index.js");
var generics_1 = require("./generics.js");
var messages_1 = require("./messages.js");
var process_message_1 = require("./process-message.js");
var BUFFERABLE_EVENT = [
    'messaging-history.set',
    'chats.upsert',
    'chats.update',
    'chats.delete',
    'contacts.upsert',
    'contacts.update',
    'messages.upsert',
    'messages.update',
    'messages.delete',
    'messages.reaction',
    'message-receipt.update',
    'groups.update'
];
var BUFFERABLE_EVENT_SET = new Set(BUFFERABLE_EVENT);
/**
 * The event buffer logically consolidates different events into a single event
 * making the data processing more efficient.
 * @param ev the baileys event emitter
 */
var makeEventBuffer = function (logger) {
    var ev = new events_1.default();
    var historyCache = new Set();
    var data = makeBufferData();
    var isBuffering = false;
    // take the generic event and fire it as a baileys event
    ev.on('event', function (map) {
        for (var event_1 in map) {
            ev.emit(event_1, map[event_1]);
        }
    });
    function buffer() {
        if (!isBuffering) {
            logger.debug('Event buffer activated');
            isBuffering = true;
        }
    }
    function flush() {
        if (!isBuffering) {
            return false;
        }
        logger.debug('Flushing event buffer');
        isBuffering = false;
        var newData = makeBufferData();
        var chatUpdates = Object.values(data.chatUpdates);
        var conditionalChatUpdatesLeft = 0;
        for (var _i = 0, chatUpdates_1 = chatUpdates; _i < chatUpdates_1.length; _i++) {
            var update = chatUpdates_1[_i];
            if (update.conditional) {
                conditionalChatUpdatesLeft += 1;
                newData.chatUpdates[update.id] = update;
                delete data.chatUpdates[update.id];
            }
        }
        var consolidatedData = consolidateEvents(data);
        if (Object.keys(consolidatedData).length) {
            ev.emit('event', consolidatedData);
        }
        data = newData;
        logger.trace({ conditionalChatUpdatesLeft: conditionalChatUpdatesLeft }, 'released buffered events');
        return true;
    }
    return {
        process: function (handler) {
            var listener = function (map) {
                handler(map);
            };
            ev.on('event', listener);
            return function () {
                ev.off('event', listener);
            };
        },
        emit: function (event, evData) {
            var _a;
            if (isBuffering && BUFFERABLE_EVENT_SET.has(event)) {
                append(data, historyCache, event, evData, logger);
                return true;
            }
            return ev.emit('event', (_a = {}, _a[event] = evData, _a));
        },
        isBuffering: function () {
            return isBuffering;
        },
        buffer: buffer,
        flush: flush,
        createBufferedFunction: function (work) {
            var _this = this;
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                buffer();
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, , 3, 4]);
                                return [4 /*yield*/, work.apply(void 0, args)];
                            case 2: return [2 /*return*/, _a.sent()];
                            case 3: return [7 /*endfinally*/];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            };
        },
        on: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return ev.on.apply(ev, args);
        },
        off: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return ev.off.apply(ev, args);
        },
        removeAllListeners: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return ev.removeAllListeners.apply(ev, args);
        }
    };
};
exports.makeEventBuffer = makeEventBuffer;
var makeBufferData = function () {
    return {
        historySets: {
            chats: {},
            messages: {},
            contacts: {},
            isLatest: false,
            empty: true
        },
        chatUpserts: {},
        chatUpdates: {},
        chatDeletes: new Set(),
        contactUpserts: {},
        contactUpdates: {},
        messageUpserts: {},
        messageUpdates: {},
        messageReactions: {},
        messageDeletes: {},
        messageReceipts: {},
        groupUpdates: {}
    };
};
function append(data, historyCache, event, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
eventData, logger) {
    var _a, _b, _c;
    switch (event) {
        case 'messaging-history.set':
            for (var _i = 0, _d = eventData.chats; _i < _d.length; _i++) {
                var chat = _d[_i];
                var existingChat = data.historySets.chats[chat.id];
                if (existingChat) {
                    existingChat.endOfHistoryTransferType = chat.endOfHistoryTransferType;
                }
                if (!existingChat && !historyCache.has(chat.id)) {
                    data.historySets.chats[chat.id] = chat;
                    historyCache.add(chat.id);
                    absorbingChatUpdate(chat);
                }
            }
            for (var _e = 0, _f = eventData.contacts; _e < _f.length; _e++) {
                var contact = _f[_e];
                var existingContact = data.historySets.contacts[contact.id];
                if (existingContact) {
                    Object.assign(existingContact, (0, generics_1.trimUndefined)(contact));
                }
                else {
                    var historyContactId = "c:".concat(contact.id);
                    var hasAnyName = contact.notify || contact.name || contact.verifiedName;
                    if (!historyCache.has(historyContactId) || hasAnyName) {
                        data.historySets.contacts[contact.id] = contact;
                        historyCache.add(historyContactId);
                    }
                }
            }
            for (var _g = 0, _h = eventData.messages; _g < _h.length; _g++) {
                var message = _h[_g];
                var key = stringifyMessageKey(message.key);
                var existingMsg = data.historySets.messages[key];
                if (!existingMsg && !historyCache.has(key)) {
                    data.historySets.messages[key] = message;
                    historyCache.add(key);
                }
            }
            data.historySets.empty = false;
            data.historySets.syncType = eventData.syncType;
            data.historySets.progress = eventData.progress;
            data.historySets.peerDataRequestSessionId = eventData.peerDataRequestSessionId;
            data.historySets.isLatest = eventData.isLatest || data.historySets.isLatest;
            break;
        case 'chats.upsert':
            for (var _j = 0, _k = eventData; _j < _k.length; _j++) {
                var chat = _k[_j];
                var upsert = data.chatUpserts[chat.id];
                if (!upsert) {
                    upsert = data.historySets.chats[chat.id];
                    if (upsert) {
                        logger.debug({ chatId: chat.id }, 'absorbed chat upsert in chat set');
                    }
                }
                if (upsert) {
                    upsert = concatChats(upsert, chat);
                }
                else {
                    upsert = chat;
                    data.chatUpserts[chat.id] = upsert;
                }
                absorbingChatUpdate(upsert);
                if (data.chatDeletes.has(chat.id)) {
                    data.chatDeletes.delete(chat.id);
                }
            }
            break;
        case 'chats.update':
            for (var _l = 0, _m = eventData; _l < _m.length; _l++) {
                var update = _m[_l];
                var chatId = update.id;
                var conditionMatches = update.conditional ? update.conditional(data) : true;
                if (conditionMatches) {
                    delete update.conditional;
                    // if there is an existing upsert, merge the update into it
                    var upsert = data.historySets.chats[chatId] || data.chatUpserts[chatId];
                    if (upsert) {
                        concatChats(upsert, update);
                    }
                    else {
                        // merge the update into the existing update
                        var chatUpdate = data.chatUpdates[chatId] || {};
                        data.chatUpdates[chatId] = concatChats(chatUpdate, update);
                    }
                }
                else if (conditionMatches === undefined) {
                    // condition yet to be fulfilled
                    data.chatUpdates[chatId] = update;
                }
                // otherwise -- condition not met, update is invalid
                // if the chat has been updated
                // ignore any existing chat delete
                if (data.chatDeletes.has(chatId)) {
                    data.chatDeletes.delete(chatId);
                }
            }
            break;
        case 'chats.delete':
            for (var _o = 0, _p = eventData; _o < _p.length; _o++) {
                var chatId = _p[_o];
                if (!data.chatDeletes.has(chatId)) {
                    data.chatDeletes.add(chatId);
                }
                // remove any prior updates & upserts
                if (data.chatUpdates[chatId]) {
                    delete data.chatUpdates[chatId];
                }
                if (data.chatUpserts[chatId]) {
                    delete data.chatUpserts[chatId];
                }
                if (data.historySets.chats[chatId]) {
                    delete data.historySets.chats[chatId];
                }
            }
            break;
        case 'contacts.upsert':
            for (var _q = 0, _r = eventData; _q < _r.length; _q++) {
                var contact = _r[_q];
                var upsert = data.contactUpserts[contact.id];
                if (!upsert) {
                    upsert = data.historySets.contacts[contact.id];
                    if (upsert) {
                        logger.debug({ contactId: contact.id }, 'absorbed contact upsert in contact set');
                    }
                }
                if (upsert) {
                    upsert = Object.assign(upsert, (0, generics_1.trimUndefined)(contact));
                }
                else {
                    upsert = contact;
                    data.contactUpserts[contact.id] = upsert;
                }
                if (data.contactUpdates[contact.id]) {
                    upsert = Object.assign(data.contactUpdates[contact.id], (0, generics_1.trimUndefined)(contact));
                    delete data.contactUpdates[contact.id];
                }
            }
            break;
        case 'contacts.update':
            var contactUpdates = eventData;
            for (var _s = 0, contactUpdates_1 = contactUpdates; _s < contactUpdates_1.length; _s++) {
                var update = contactUpdates_1[_s];
                var id = update.id;
                // merge into prior upsert
                var upsert = data.historySets.contacts[id] || data.contactUpserts[id];
                if (upsert) {
                    Object.assign(upsert, update);
                }
                else {
                    // merge into prior update
                    var contactUpdate = data.contactUpdates[id] || {};
                    data.contactUpdates[id] = Object.assign(contactUpdate, update);
                }
            }
            break;
        case 'messages.upsert':
            var _t = eventData, messages = _t.messages, type = _t.type;
            for (var _u = 0, messages_2 = messages; _u < messages_2.length; _u++) {
                var message = messages_2[_u];
                var key = stringifyMessageKey(message.key);
                var existing = (_a = data.messageUpserts[key]) === null || _a === void 0 ? void 0 : _a.message;
                if (!existing) {
                    existing = data.historySets.messages[key];
                    if (existing) {
                        logger.debug({ messageId: key }, 'absorbed message upsert in message set');
                    }
                }
                if (existing) {
                    message.messageTimestamp = existing.messageTimestamp;
                }
                if (data.messageUpdates[key]) {
                    logger.debug('absorbed prior message update in message upsert');
                    Object.assign(message, data.messageUpdates[key].update);
                    delete data.messageUpdates[key];
                }
                if (data.historySets.messages[key]) {
                    data.historySets.messages[key] = message;
                }
                else {
                    data.messageUpserts[key] = {
                        message: message,
                        type: type === 'notify' || ((_b = data.messageUpserts[key]) === null || _b === void 0 ? void 0 : _b.type) === 'notify' ? 'notify' : type
                    };
                }
            }
            break;
        case 'messages.update':
            var msgUpdates = eventData;
            for (var _v = 0, msgUpdates_1 = msgUpdates; _v < msgUpdates_1.length; _v++) {
                var _w = msgUpdates_1[_v], key = _w.key, update = _w.update;
                var keyStr = stringifyMessageKey(key);
                var existing = data.historySets.messages[keyStr] || ((_c = data.messageUpserts[keyStr]) === null || _c === void 0 ? void 0 : _c.message);
                if (existing) {
                    Object.assign(existing, update);
                    // if the message was received & read by us
                    // the chat counter must have been incremented
                    // so we need to decrement it
                    if (update.status === Types_1.WAMessageStatus.READ && !key.fromMe) {
                        decrementChatReadCounterIfMsgDidUnread(existing);
                    }
                }
                else {
                    var msgUpdate = data.messageUpdates[keyStr] || { key: key, update: {} };
                    Object.assign(msgUpdate.update, update);
                    data.messageUpdates[keyStr] = msgUpdate;
                }
            }
            break;
        case 'messages.delete':
            var deleteData = eventData;
            if ('keys' in deleteData) {
                var keys = deleteData.keys;
                for (var _x = 0, keys_1 = keys; _x < keys_1.length; _x++) {
                    var key = keys_1[_x];
                    var keyStr = stringifyMessageKey(key);
                    if (!data.messageDeletes[keyStr]) {
                        data.messageDeletes[keyStr] = key;
                    }
                    if (data.messageUpserts[keyStr]) {
                        delete data.messageUpserts[keyStr];
                    }
                    if (data.messageUpdates[keyStr]) {
                        delete data.messageUpdates[keyStr];
                    }
                }
            }
            else {
                // TODO: add support
            }
            break;
        case 'messages.reaction':
            var reactions = eventData;
            for (var _y = 0, reactions_1 = reactions; _y < reactions_1.length; _y++) {
                var _z = reactions_1[_y], key = _z.key, reaction = _z.reaction;
                var keyStr = stringifyMessageKey(key);
                var existing = data.messageUpserts[keyStr];
                if (existing) {
                    (0, messages_1.updateMessageWithReaction)(existing.message, reaction);
                }
                else {
                    data.messageReactions[keyStr] = data.messageReactions[keyStr] || { key: key, reactions: [] };
                    (0, messages_1.updateMessageWithReaction)(data.messageReactions[keyStr], reaction);
                }
            }
            break;
        case 'message-receipt.update':
            var receipts = eventData;
            for (var _0 = 0, receipts_1 = receipts; _0 < receipts_1.length; _0++) {
                var _1 = receipts_1[_0], key = _1.key, receipt = _1.receipt;
                var keyStr = stringifyMessageKey(key);
                var existing = data.messageUpserts[keyStr];
                if (existing) {
                    (0, messages_1.updateMessageWithReceipt)(existing.message, receipt);
                }
                else {
                    data.messageReceipts[keyStr] = data.messageReceipts[keyStr] || { key: key, userReceipt: [] };
                    (0, messages_1.updateMessageWithReceipt)(data.messageReceipts[keyStr], receipt);
                }
            }
            break;
        case 'groups.update':
            var groupUpdates = eventData;
            for (var _2 = 0, groupUpdates_1 = groupUpdates; _2 < groupUpdates_1.length; _2++) {
                var update = groupUpdates_1[_2];
                var id = update.id;
                var groupUpdate = data.groupUpdates[id] || {};
                if (!data.groupUpdates[id]) {
                    data.groupUpdates[id] = Object.assign(groupUpdate, update);
                }
            }
            break;
        default:
            throw new Error("\"".concat(event, "\" cannot be buffered"));
    }
    function absorbingChatUpdate(existing) {
        var chatId = existing.id;
        var update = data.chatUpdates[chatId];
        if (update) {
            var conditionMatches = update.conditional ? update.conditional(data) : true;
            if (conditionMatches) {
                delete update.conditional;
                logger.debug({ chatId: chatId }, 'absorbed chat update in existing chat');
                Object.assign(existing, concatChats(update, existing));
                delete data.chatUpdates[chatId];
            }
            else if (conditionMatches === false) {
                logger.debug({ chatId: chatId }, 'chat update condition fail, removing');
                delete data.chatUpdates[chatId];
            }
        }
    }
    function decrementChatReadCounterIfMsgDidUnread(message) {
        // decrement chat unread counter
        // if the message has already been marked read by us
        var chatId = message.key.remoteJid;
        var chat = data.chatUpdates[chatId] || data.chatUpserts[chatId];
        if ((0, process_message_1.isRealMessage)(message, '') &&
            (0, process_message_1.shouldIncrementChatUnread)(message) &&
            typeof (chat === null || chat === void 0 ? void 0 : chat.unreadCount) === 'number' &&
            chat.unreadCount > 0) {
            logger.debug({ chatId: chat.id }, 'decrementing chat counter');
            chat.unreadCount -= 1;
            if (chat.unreadCount === 0) {
                delete chat.unreadCount;
            }
        }
    }
}
function consolidateEvents(data) {
    var map = {};
    if (!data.historySets.empty) {
        map['messaging-history.set'] = {
            chats: Object.values(data.historySets.chats),
            messages: Object.values(data.historySets.messages),
            contacts: Object.values(data.historySets.contacts),
            syncType: data.historySets.syncType,
            progress: data.historySets.progress,
            isLatest: data.historySets.isLatest,
            peerDataRequestSessionId: data.historySets.peerDataRequestSessionId
        };
    }
    var chatUpsertList = Object.values(data.chatUpserts);
    if (chatUpsertList.length) {
        map['chats.upsert'] = chatUpsertList;
    }
    var chatUpdateList = Object.values(data.chatUpdates);
    if (chatUpdateList.length) {
        map['chats.update'] = chatUpdateList;
    }
    var chatDeleteList = Array.from(data.chatDeletes);
    if (chatDeleteList.length) {
        map['chats.delete'] = chatDeleteList;
    }
    var messageUpsertList = Object.values(data.messageUpserts);
    if (messageUpsertList.length) {
        var type = messageUpsertList[0].type;
        map['messages.upsert'] = {
            messages: messageUpsertList.map(function (m) { return m.message; }),
            type: type
        };
    }
    var messageUpdateList = Object.values(data.messageUpdates);
    if (messageUpdateList.length) {
        map['messages.update'] = messageUpdateList;
    }
    var messageDeleteList = Object.values(data.messageDeletes);
    if (messageDeleteList.length) {
        map['messages.delete'] = { keys: messageDeleteList };
    }
    var messageReactionList = Object.values(data.messageReactions).flatMap(function (_a) {
        var key = _a.key, reactions = _a.reactions;
        return reactions.flatMap(function (reaction) { return ({ key: key, reaction: reaction }); });
    });
    if (messageReactionList.length) {
        map['messages.reaction'] = messageReactionList;
    }
    var messageReceiptList = Object.values(data.messageReceipts).flatMap(function (_a) {
        var key = _a.key, userReceipt = _a.userReceipt;
        return userReceipt.flatMap(function (receipt) { return ({ key: key, receipt: receipt }); });
    });
    if (messageReceiptList.length) {
        map['message-receipt.update'] = messageReceiptList;
    }
    var contactUpsertList = Object.values(data.contactUpserts);
    if (contactUpsertList.length) {
        map['contacts.upsert'] = contactUpsertList;
    }
    var contactUpdateList = Object.values(data.contactUpdates);
    if (contactUpdateList.length) {
        map['contacts.update'] = contactUpdateList;
    }
    var groupUpdateList = Object.values(data.groupUpdates);
    if (groupUpdateList.length) {
        map['groups.update'] = groupUpdateList;
    }
    return map;
}
function concatChats(a, b) {
    if (b.unreadCount === null && // neutralize unread counter
        a.unreadCount < 0) {
        a.unreadCount = undefined;
        b.unreadCount = undefined;
    }
    if (typeof a.unreadCount === 'number' && typeof b.unreadCount === 'number') {
        b = __assign({}, b);
        if (b.unreadCount >= 0) {
            b.unreadCount = Math.max(b.unreadCount, 0) + Math.max(a.unreadCount, 0);
        }
    }
    return Object.assign(a, b);
}
var stringifyMessageKey = function (key) { return "".concat(key.remoteJid, ",").concat(key.id, ",").concat(key.fromMe ? '1' : '0'); };
//# sourceMappingURL=event-buffer.js.map