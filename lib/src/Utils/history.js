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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryMsg = exports.downloadAndProcessHistorySyncNotification = exports.processHistoryMessage = exports.downloadHistory = void 0;
var util_1 = require("util");
var zlib_1 = require("zlib");
var index_js_1 = require("../../WAProto/index.js");
var Types_1 = require("../Types/index.js");
var WABinary_1 = require("../WABinary/index.js");
var generics_1 = require("./generics.js");
var messages_1 = require("./messages.js");
var messages_media_1 = require("./messages-media.js");
var inflatePromise = (0, util_1.promisify)(zlib_1.inflate);
var downloadHistory = function (msg, options) { return __awaiter(void 0, void 0, void 0, function () {
    var stream, bufferArray, _a, stream_1, stream_1_1, chunk, e_1_1, buffer, syncData;
    var _b, e_1, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, (0, messages_media_1.downloadContentFromMessage)(msg, 'md-msg-hist', { options: options })];
            case 1:
                stream = _e.sent();
                bufferArray = [];
                _e.label = 2;
            case 2:
                _e.trys.push([2, 7, 8, 13]);
                _a = true, stream_1 = __asyncValues(stream);
                _e.label = 3;
            case 3: return [4 /*yield*/, stream_1.next()];
            case 4:
                if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 6];
                _d = stream_1_1.value;
                _a = false;
                chunk = _d;
                bufferArray.push(chunk);
                _e.label = 5;
            case 5:
                _a = true;
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 13];
            case 7:
                e_1_1 = _e.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 13];
            case 8:
                _e.trys.push([8, , 11, 12]);
                if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 10];
                return [4 /*yield*/, _c.call(stream_1)];
            case 9:
                _e.sent();
                _e.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 12: return [7 /*endfinally*/];
            case 13:
                buffer = Buffer.concat(bufferArray);
                return [4 /*yield*/, inflatePromise(buffer)];
            case 14:
                // decompress buffer
                buffer = _e.sent();
                syncData = index_js_1.proto.HistorySync.decode(buffer);
                return [2 /*return*/, syncData];
        }
    });
}); };
exports.downloadHistory = downloadHistory;
var processHistoryMessage = function (item) {
    var _a, _b, _c;
    var messages = [];
    var contacts = [];
    var chats = [];
    switch (item.syncType) {
        case index_js_1.proto.HistorySync.HistorySyncType.INITIAL_BOOTSTRAP:
        case index_js_1.proto.HistorySync.HistorySyncType.RECENT:
        case index_js_1.proto.HistorySync.HistorySyncType.FULL:
        case index_js_1.proto.HistorySync.HistorySyncType.ON_DEMAND:
            for (var _i = 0, _d = item.conversations; _i < _d.length; _i++) {
                var chat = _d[_i];
                contacts.push({
                    id: chat.id,
                    name: chat.name || undefined,
                    lid: chat.lidJid || undefined,
                    jid: (0, WABinary_1.isJidUser)(chat.id) ? chat.id : undefined
                });
                var msgs = chat.messages || [];
                delete chat.messages;
                for (var _e = 0, msgs_1 = msgs; _e < msgs_1.length; _e++) {
                    var item_1 = msgs_1[_e];
                    var message = item_1.message;
                    messages.push(message);
                    if (!((_a = chat.messages) === null || _a === void 0 ? void 0 : _a.length)) {
                        // keep only the most recent message in the chat array
                        chat.messages = [{ message: message }];
                    }
                    if (!message.key.fromMe && !chat.lastMessageRecvTimestamp) {
                        chat.lastMessageRecvTimestamp = (0, generics_1.toNumber)(message.messageTimestamp);
                    }
                    if ((message.messageStubType === Types_1.WAMessageStubType.BIZ_PRIVACY_MODE_TO_BSP ||
                        message.messageStubType === Types_1.WAMessageStubType.BIZ_PRIVACY_MODE_TO_FB) &&
                        ((_b = message.messageStubParameters) === null || _b === void 0 ? void 0 : _b[0])) {
                        contacts.push({
                            id: message.key.participant || message.key.remoteJid,
                            verifiedName: (_c = message.messageStubParameters) === null || _c === void 0 ? void 0 : _c[0]
                        });
                    }
                }
                chats.push(__assign({}, chat));
            }
            break;
        case index_js_1.proto.HistorySync.HistorySyncType.PUSH_NAME:
            for (var _f = 0, _g = item.pushnames; _f < _g.length; _f++) {
                var c = _g[_f];
                contacts.push({ id: c.id, notify: c.pushname });
            }
            break;
    }
    return {
        chats: chats,
        contacts: contacts,
        messages: messages,
        syncType: item.syncType,
        progress: item.progress
    };
};
exports.processHistoryMessage = processHistoryMessage;
var downloadAndProcessHistorySyncNotification = function (msg, options) { return __awaiter(void 0, void 0, void 0, function () {
    var historyMsg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.downloadHistory)(msg, options)];
            case 1:
                historyMsg = _a.sent();
                return [2 /*return*/, (0, exports.processHistoryMessage)(historyMsg)];
        }
    });
}); };
exports.downloadAndProcessHistorySyncNotification = downloadAndProcessHistorySyncNotification;
var getHistoryMsg = function (message) {
    var _a;
    var normalizedContent = !!message ? (0, messages_1.normalizeMessageContent)(message) : undefined;
    var anyHistoryMsg = (_a = normalizedContent === null || normalizedContent === void 0 ? void 0 : normalizedContent.protocolMessage) === null || _a === void 0 ? void 0 : _a.historySyncNotification;
    return anyHistoryMsg;
};
exports.getHistoryMsg = getHistoryMsg;
//# sourceMappingURL=history.js.map