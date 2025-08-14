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
var node_cache_1 = require("@cacheable/node-cache");
var readline_1 = require("readline");
var src_1 = require("../src/index.js");
var fs_1 = require("fs");
var pino_1 = require("pino");
var logger = (0, pino_1.default)({ timestamp: function () { return ",\"time\":\"".concat(new Date().toJSON(), "\""); } }, pino_1.default.destination('./wa-logs.txt'));
logger.level = 'trace';
var doReplies = process.argv.includes('--do-reply');
var usePairingCode = process.argv.includes('--use-pairing-code');
// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
var msgRetryCounterCache = new node_cache_1.default();
var onDemandMap = new Map();
// Read line interface
var rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
var question = function (text) { return new Promise(function (resolve) { return rl.question(text, resolve); }); };
// start a connection
var startSock = function () { return __awaiter(void 0, void 0, void 0, function () {
    function getMessage(key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implement a way to retreive messages that were upserted from messages.upsert
                // up to you
                // only if store is present
                return [2 /*return*/, src_1.proto.Message.fromObject({ conversation: 'test' })];
            });
        });
    }
    var _a, state, saveCreds, _b, version, isLatest, sock, phoneNumber, code, sendMessageWTyping;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, src_1.useMultiFileAuthState)('baileys_auth_info')
                // fetch latest version of WA Web
            ];
            case 1:
                _a = _c.sent(), state = _a.state, saveCreds = _a.saveCreds;
                return [4 /*yield*/, (0, src_1.fetchLatestBaileysVersion)()];
            case 2:
                _b = _c.sent(), version = _b.version, isLatest = _b.isLatest;
                console.log("using WA v".concat(version.join('.'), ", isLatest: ").concat(isLatest));
                sock = (0, src_1.default)({
                    version: version,
                    logger: logger,
                    auth: {
                        creds: state.creds,
                        /** caching makes the store faster to send/recv messages */
                        keys: (0, src_1.makeCacheableSignalKeyStore)(state.keys, logger),
                    },
                    msgRetryCounterCache: msgRetryCounterCache,
                    generateHighQualityLinkPreview: true,
                    // ignore all broadcast messages -- to receive the same
                    // comment the line below out
                    // shouldIgnoreJid: jid => isJidBroadcast(jid),
                    // implement to handle retries & poll updates
                    getMessage: getMessage
                });
                if (!(usePairingCode && !sock.authState.creds.registered)) return [3 /*break*/, 5];
                return [4 /*yield*/, question('Please enter your phone number:\n')];
            case 3:
                phoneNumber = _c.sent();
                return [4 /*yield*/, sock.requestPairingCode(phoneNumber)];
            case 4:
                code = _c.sent();
                console.log("Pairing code: ".concat(code));
                _c.label = 5;
            case 5:
                sendMessageWTyping = function (msg, jid) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sock.presenceSubscribe(jid)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, (0, src_1.delay)(500)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, sock.sendPresenceUpdate('composing', jid)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, (0, src_1.delay)(2000)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, sock.sendPresenceUpdate('paused', jid)];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, sock.sendMessage(jid, msg)];
                            case 6:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                // the process function lets you process all events that just occurred
                // efficiently in a batch
                sock.ev.process(
                // events is a map for event name => event data
                function (events) { return __awaiter(void 0, void 0, void 0, function () {
                    var update, connection, lastDisconnect, sendWAMExample, _a, _b, wamVersion, eventSequenceNumber, events_1, _c, _d, binaryInfo, buffer, result, _e, chats, contacts, messages, isLatest_1, progress, syncType, upsert, _i, _f, msg, text, messageId, messageId, _g, _h, _j, key, update, pollCreation, _k, _l, contact, newUrl, _m;
                    var _o, _p, _q, _r, _s, _t, _u, _v, _w;
                    return __generator(this, function (_x) {
                        switch (_x.label) {
                            case 0:
                                if (!events['connection.update']) return [3 /*break*/, 4];
                                update = events['connection.update'];
                                connection = update.connection, lastDisconnect = update.lastDisconnect;
                                if (connection === 'close') {
                                    // reconnect if not logged out
                                    if (((_p = (_o = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _o === void 0 ? void 0 : _o.output) === null || _p === void 0 ? void 0 : _p.statusCode) !== src_1.DisconnectReason.loggedOut) {
                                        startSock();
                                    }
                                    else {
                                        console.log('Connection closed. You are logged out.');
                                    }
                                }
                                sendWAMExample = false;
                                if (!(connection === 'open' && sendWAMExample)) return [3 /*break*/, 3];
                                _d = (_c = JSON).parse;
                                return [4 /*yield*/, fs_1.default.promises.readFile("./boot_analytics_test.json", "utf-8")];
                            case 1:
                                _a = _d.apply(_c, [_x.sent()]), _b = _a.header, wamVersion = _b.wamVersion, eventSequenceNumber = _b.eventSequenceNumber, events_1 = _a.events;
                                binaryInfo = new src_1.BinaryInfo({
                                    protocolVersion: wamVersion,
                                    sequence: eventSequenceNumber,
                                    events: events_1
                                });
                                buffer = (0, src_1.encodeWAM)(binaryInfo);
                                return [4 /*yield*/, sock.sendWAMBuffer(buffer)];
                            case 2:
                                result = _x.sent();
                                console.log(result);
                                _x.label = 3;
                            case 3:
                                console.log('connection update', update);
                                _x.label = 4;
                            case 4:
                                if (!events['creds.update']) return [3 /*break*/, 6];
                                return [4 /*yield*/, saveCreds()];
                            case 5:
                                _x.sent();
                                _x.label = 6;
                            case 6:
                                if (events['labels.association']) {
                                    console.log(events['labels.association']);
                                }
                                if (events['labels.edit']) {
                                    console.log(events['labels.edit']);
                                }
                                if (events.call) {
                                    console.log('recv call event', events.call);
                                }
                                // history received
                                if (events['messaging-history.set']) {
                                    _e = events['messaging-history.set'], chats = _e.chats, contacts = _e.contacts, messages = _e.messages, isLatest_1 = _e.isLatest, progress = _e.progress, syncType = _e.syncType;
                                    if (syncType === src_1.proto.HistorySync.HistorySyncType.ON_DEMAND) {
                                        console.log('received on-demand history sync, messages=', messages);
                                    }
                                    console.log("recv ".concat(chats.length, " chats, ").concat(contacts.length, " contacts, ").concat(messages.length, " msgs (is latest: ").concat(isLatest_1, ", progress: ").concat(progress, "%), type: ").concat(syncType));
                                }
                                if (!events['messages.upsert']) return [3 /*break*/, 15];
                                upsert = events['messages.upsert'];
                                console.log('recv messages ', JSON.stringify(upsert, undefined, 2));
                                if (!!upsert.requestId) {
                                    console.log("placeholder message received for request of id=" + upsert.requestId, upsert);
                                }
                                if (!(upsert.type === 'notify')) return [3 /*break*/, 15];
                                _i = 0, _f = upsert.messages;
                                _x.label = 7;
                            case 7:
                                if (!(_i < _f.length)) return [3 /*break*/, 15];
                                msg = _f[_i];
                                if (!(((_q = msg.message) === null || _q === void 0 ? void 0 : _q.conversation) || ((_s = (_r = msg.message) === null || _r === void 0 ? void 0 : _r.extendedTextMessage) === null || _s === void 0 ? void 0 : _s.text))) return [3 /*break*/, 14];
                                text = ((_t = msg.message) === null || _t === void 0 ? void 0 : _t.conversation) || ((_v = (_u = msg.message) === null || _u === void 0 ? void 0 : _u.extendedTextMessage) === null || _v === void 0 ? void 0 : _v.text);
                                if (!(text == "requestPlaceholder" && !upsert.requestId)) return [3 /*break*/, 9];
                                return [4 /*yield*/, sock.requestPlaceholderResend(msg.key)];
                            case 8:
                                messageId = _x.sent();
                                console.log('requested placeholder resync, id=', messageId);
                                _x.label = 9;
                            case 9:
                                if (!(text == "onDemandHistSync")) return [3 /*break*/, 11];
                                return [4 /*yield*/, sock.fetchMessageHistory(50, msg.key, msg.messageTimestamp)];
                            case 10:
                                messageId = _x.sent();
                                console.log('requested on-demand sync, id=', messageId);
                                _x.label = 11;
                            case 11:
                                if (!(!msg.key.fromMe && doReplies && !(0, src_1.isJidNewsletter)((_w = msg.key) === null || _w === void 0 ? void 0 : _w.remoteJid))) return [3 /*break*/, 14];
                                console.log('replying to', msg.key.remoteJid);
                                return [4 /*yield*/, sock.readMessages([msg.key])];
                            case 12:
                                _x.sent();
                                return [4 /*yield*/, sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)];
                            case 13:
                                _x.sent();
                                _x.label = 14;
                            case 14:
                                _i++;
                                return [3 /*break*/, 7];
                            case 15:
                                // messages updated like status delivered, message deleted etc.
                                if (events['messages.update']) {
                                    console.log(JSON.stringify(events['messages.update'], undefined, 2));
                                    for (_g = 0, _h = events['messages.update']; _g < _h.length; _g++) {
                                        _j = _h[_g], key = _j.key, update = _j.update;
                                        if (update.pollUpdates) {
                                            pollCreation = {} // get the poll creation message somehow
                                            ;
                                            if (pollCreation) {
                                                console.log('got poll update, aggregation: ', (0, src_1.getAggregateVotesInPollMessage)({
                                                    message: pollCreation,
                                                    pollUpdates: update.pollUpdates,
                                                }));
                                            }
                                        }
                                    }
                                }
                                if (events['message-receipt.update']) {
                                    console.log(events['message-receipt.update']);
                                }
                                if (events['messages.reaction']) {
                                    console.log(events['messages.reaction']);
                                }
                                if (events['presence.update']) {
                                    console.log(events['presence.update']);
                                }
                                if (events['chats.update']) {
                                    console.log(events['chats.update']);
                                }
                                if (!events['contacts.update']) return [3 /*break*/, 21];
                                _k = 0, _l = events['contacts.update'];
                                _x.label = 16;
                            case 16:
                                if (!(_k < _l.length)) return [3 /*break*/, 21];
                                contact = _l[_k];
                                if (!(typeof contact.imgUrl !== 'undefined')) return [3 /*break*/, 20];
                                if (!(contact.imgUrl === null)) return [3 /*break*/, 17];
                                _m = null;
                                return [3 /*break*/, 19];
                            case 17: return [4 /*yield*/, sock.profilePictureUrl(contact.id).catch(function () { return null; })];
                            case 18:
                                _m = _x.sent();
                                _x.label = 19;
                            case 19:
                                newUrl = _m;
                                console.log("contact ".concat(contact.id, " has a new profile pic: ").concat(newUrl));
                                _x.label = 20;
                            case 20:
                                _k++;
                                return [3 /*break*/, 16];
                            case 21:
                                if (events['chats.delete']) {
                                    console.log('chats deleted ', events['chats.delete']);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/, sock];
        }
    });
}); };
startSock();
//# sourceMappingURL=example.js.map