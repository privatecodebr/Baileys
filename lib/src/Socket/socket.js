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
exports.makeSocket = void 0;
var boom_1 = require("@hapi/boom");
var crypto_1 = require("crypto");
var url_1 = require("url");
var util_1 = require("util");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var Types_1 = require("../Types/index.js");
var Utils_1 = require("../Utils/index.js");
var WABinary_1 = require("../WABinary/index.js");
var Client_1 = require("./Client/index.js");
/**
 * Connects to WA servers and performs:
 * - simple queries (no retry mechanism, wait for connection establishment)
 * - listen to messages and emit events
 * - query phone connection
 */
var makeSocket = function (config) {
    var _a, _b;
    var waWebSocketUrl = config.waWebSocketUrl, connectTimeoutMs = config.connectTimeoutMs, logger = config.logger, keepAliveIntervalMs = config.keepAliveIntervalMs, browser = config.browser, authState = config.auth, printQRInTerminal = config.printQRInTerminal, defaultQueryTimeoutMs = config.defaultQueryTimeoutMs, transactionOpts = config.transactionOpts, qrTimeout = config.qrTimeout, makeSignalRepository = config.makeSignalRepository;
    if (printQRInTerminal) {
        console.warn('⚠️ The printQRInTerminal option has been deprecated. You will no longer receive QR codes in the terminal automatically. Please listen to the connection.update event yourself and handle the QR your way. You can remove this message by removing this opttion. This message will be removed in a future version.');
    }
    var url = typeof waWebSocketUrl === 'string' ? new url_1.URL(waWebSocketUrl) : waWebSocketUrl;
    if (config.mobile || url.protocol === 'tcp:') {
        throw new boom_1.Boom('Mobile API is not supported anymore', { statusCode: Types_1.DisconnectReason.loggedOut });
    }
    if (url.protocol === 'wss' && ((_a = authState === null || authState === void 0 ? void 0 : authState.creds) === null || _a === void 0 ? void 0 : _a.routingInfo)) {
        url.searchParams.append('ED', authState.creds.routingInfo.toString('base64url'));
    }
    var ws = new Client_1.WebSocketClient(url, config);
    ws.connect();
    var ev = (0, Utils_1.makeEventBuffer)(logger);
    /** ephemeral key pair used to encrypt/decrypt communication. Unique for each connection */
    var ephemeralKeyPair = Utils_1.Curve.generateKeyPair();
    /** WA noise protocol wrapper */
    var noise = (0, Utils_1.makeNoiseHandler)({
        keyPair: ephemeralKeyPair,
        NOISE_HEADER: Defaults_1.NOISE_WA_HEADER,
        logger: logger,
        routingInfo: (_b = authState === null || authState === void 0 ? void 0 : authState.creds) === null || _b === void 0 ? void 0 : _b.routingInfo
    });
    var creds = authState.creds;
    // add transaction capability
    var keys = (0, Utils_1.addTransactionCapability)(authState.keys, logger, transactionOpts);
    var signalRepository = makeSignalRepository({ creds: creds, keys: keys });
    var lastDateRecv;
    var epoch = 1;
    var keepAliveReq;
    var qrTimer;
    var closed = false;
    var uqTagId = (0, Utils_1.generateMdTagPrefix)();
    var generateMessageTag = function () { return "".concat(uqTagId).concat(epoch++); };
    var sendPromise = (0, util_1.promisify)(ws.send);
    /** send a raw buffer */
    var sendRawMessage = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var bytes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ws.isOpen) {
                        throw new boom_1.Boom('Connection Closed', { statusCode: Types_1.DisconnectReason.connectionClosed });
                    }
                    bytes = noise.encodeFrame(data);
                    return [4 /*yield*/, (0, Utils_1.promiseTimeout)(connectTimeoutMs, function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                            var error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, sendPromise.call(ws, bytes)];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_1 = _a.sent();
                                        reject(error_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /** send a binary node */
    var sendNode = function (frame) {
        if (logger.level === 'trace') {
            logger.trace({ xml: (0, WABinary_1.binaryNodeToString)(frame), msg: 'xml send' });
        }
        var buff = (0, WABinary_1.encodeBinaryNode)(frame);
        return sendRawMessage(buff);
    };
    /** log & process any unexpected errors */
    var onUnexpectedError = function (err, msg) {
        logger.error({ err: err }, "unexpected error in '".concat(msg, "'"));
    };
    /** await the next incoming message */
    var awaitNextMessage = function (sendMsg) { return __awaiter(void 0, void 0, void 0, function () {
        var onOpen, onClose, result;
        return __generator(this, function (_a) {
            if (!ws.isOpen) {
                throw new boom_1.Boom('Connection Closed', {
                    statusCode: Types_1.DisconnectReason.connectionClosed
                });
            }
            result = (0, Utils_1.promiseTimeout)(connectTimeoutMs, function (resolve, reject) {
                onOpen = resolve;
                onClose = mapWebSocketError(reject);
                ws.on('frame', onOpen);
                ws.on('close', onClose);
                ws.on('error', onClose);
            }).finally(function () {
                ws.off('frame', onOpen);
                ws.off('close', onClose);
                ws.off('error', onClose);
            });
            if (sendMsg) {
                sendRawMessage(sendMsg).catch(onClose);
            }
            return [2 /*return*/, result];
        });
    }); };
    /**
     * Wait for a message with a certain tag to be received
     * @param msgId the message tag to await
     * @param timeoutMs timeout after which the promise will reject
     */
    var waitForMessage = function (msgId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([msgId_1], args_1, true), void 0, function (msgId, timeoutMs) {
            var onRecv, onErr, result;
            if (timeoutMs === void 0) { timeoutMs = defaultQueryTimeoutMs; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 2, 3]);
                        return [4 /*yield*/, (0, Utils_1.promiseTimeout)(timeoutMs, function (resolve, reject) {
                                onRecv = resolve;
                                onErr = function (err) {
                                    reject(err || new boom_1.Boom('Connection Closed', { statusCode: Types_1.DisconnectReason.connectionClosed }));
                                };
                                ws.on("TAG:".concat(msgId), onRecv);
                                ws.on('close', onErr); // if the socket closes, you'll never receive the message
                                ws.off('error', onErr);
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        ws.off("TAG:".concat(msgId), onRecv);
                        ws.off('close', onErr); // if the socket closes, you'll never receive the message
                        ws.off('error', onErr);
                        return [7 /*endfinally*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** send a query, and wait for its response. auto-generates message ID if not provided */
    var query = function (node, timeoutMs) { return __awaiter(void 0, void 0, void 0, function () {
        var msgId, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!node.attrs.id) {
                        node.attrs.id = generateMessageTag();
                    }
                    msgId = node.attrs.id;
                    return [4 /*yield*/, Promise.all([waitForMessage(msgId, timeoutMs), sendNode(node)])];
                case 1:
                    result = (_a.sent())[0];
                    if ('tag' in result) {
                        (0, WABinary_1.assertNodeErrorFree)(result);
                    }
                    return [2 /*return*/, result];
            }
        });
    }); };
    /** connection handshake */
    var validateConnection = function () { return __awaiter(void 0, void 0, void 0, function () {
        var helloMsg, init, result, handshake, keyEnc, node, payloadEnc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    helloMsg = {
                        clientHello: { ephemeral: ephemeralKeyPair.public }
                    };
                    helloMsg = index_js_1.proto.HandshakeMessage.fromObject(helloMsg);
                    logger.info({ browser: browser, helloMsg: helloMsg }, 'connected to WA');
                    init = index_js_1.proto.HandshakeMessage.encode(helloMsg).finish();
                    return [4 /*yield*/, awaitNextMessage(init)];
                case 1:
                    result = _a.sent();
                    handshake = index_js_1.proto.HandshakeMessage.decode(result);
                    logger.trace({ handshake: handshake }, 'handshake recv from WA');
                    return [4 /*yield*/, noise.processHandshake(handshake, creds.noiseKey)];
                case 2:
                    keyEnc = _a.sent();
                    if (!creds.me) {
                        node = (0, Utils_1.generateRegistrationNode)(creds, config);
                        logger.info({ node: node }, 'not logged in, attempting registration...');
                    }
                    else {
                        node = (0, Utils_1.generateLoginNode)(creds.me.id, config);
                        logger.info({ node: node }, 'logging in...');
                    }
                    payloadEnc = noise.encrypt(index_js_1.proto.ClientPayload.encode(node).finish());
                    return [4 /*yield*/, sendRawMessage(index_js_1.proto.HandshakeMessage.encode({
                            clientFinish: {
                                static: keyEnc,
                                payload: payloadEnc
                            }
                        }).finish())];
                case 3:
                    _a.sent();
                    noise.finishInit();
                    startKeepAliveRequest();
                    return [2 /*return*/];
            }
        });
    }); };
    var getAvailablePreKeysOnServer = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, countChild;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            id: generateMessageTag(),
                            xmlns: 'encrypt',
                            type: 'get',
                            to: WABinary_1.S_WHATSAPP_NET
                        },
                        content: [{ tag: 'count', attrs: {} }]
                    })];
                case 1:
                    result = _a.sent();
                    countChild = (0, WABinary_1.getBinaryNodeChild)(result, 'count');
                    return [2 /*return*/, +countChild.attrs.value];
            }
        });
    }); };
    /** generates and uploads a set of pre-keys to the server */
    var uploadPreKeys = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (count) {
            if (count === void 0) { count = Defaults_1.INITIAL_PREKEY_COUNT; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, keys.transaction(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, update, node;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        logger.info({ count: count }, 'uploading pre-keys');
                                        return [4 /*yield*/, (0, Utils_1.getNextPreKeysNode)({ creds: creds, keys: keys }, count)];
                                    case 1:
                                        _a = _b.sent(), update = _a.update, node = _a.node;
                                        return [4 /*yield*/, query(node)];
                                    case 2:
                                        _b.sent();
                                        ev.emit('creds.update', update);
                                        logger.info({ count: count }, 'uploaded pre-keys');
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var uploadPreKeysToServerIfRequired = function () { return __awaiter(void 0, void 0, void 0, function () {
        var preKeyCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAvailablePreKeysOnServer()];
                case 1:
                    preKeyCount = _a.sent();
                    logger.info("".concat(preKeyCount, " pre-keys found on server"));
                    if (!(preKeyCount <= Defaults_1.MIN_PREKEY_COUNT)) return [3 /*break*/, 3];
                    return [4 /*yield*/, uploadPreKeys()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var onMessageReceived = function (data) {
        noise.decodeFrame(data, function (frame) {
            var _a;
            // reset ping timeout
            lastDateRecv = new Date();
            var anyTriggered = false;
            anyTriggered = ws.emit('frame', frame);
            // if it's a binary node
            if (!(frame instanceof Uint8Array)) {
                var msgId = frame.attrs.id;
                if (logger.level === 'trace') {
                    logger.trace({ xml: (0, WABinary_1.binaryNodeToString)(frame), msg: 'recv xml' });
                }
                /* Check if this is a response to a message we sent */
                anyTriggered = ws.emit("".concat(Defaults_1.DEF_TAG_PREFIX).concat(msgId), frame) || anyTriggered;
                /* Check if this is a response to a message we are expecting */
                var l0 = frame.tag;
                var l1 = frame.attrs || {};
                var l2 = Array.isArray(frame.content) ? (_a = frame.content[0]) === null || _a === void 0 ? void 0 : _a.tag : '';
                for (var _i = 0, _b = Object.keys(l1); _i < _b.length; _i++) {
                    var key = _b[_i];
                    anyTriggered = ws.emit("".concat(Defaults_1.DEF_CALLBACK_PREFIX).concat(l0, ",").concat(key, ":").concat(l1[key], ",").concat(l2), frame) || anyTriggered;
                    anyTriggered = ws.emit("".concat(Defaults_1.DEF_CALLBACK_PREFIX).concat(l0, ",").concat(key, ":").concat(l1[key]), frame) || anyTriggered;
                    anyTriggered = ws.emit("".concat(Defaults_1.DEF_CALLBACK_PREFIX).concat(l0, ",").concat(key), frame) || anyTriggered;
                }
                anyTriggered = ws.emit("".concat(Defaults_1.DEF_CALLBACK_PREFIX).concat(l0, ",,").concat(l2), frame) || anyTriggered;
                anyTriggered = ws.emit("".concat(Defaults_1.DEF_CALLBACK_PREFIX).concat(l0), frame) || anyTriggered;
                if (!anyTriggered && logger.level === 'debug') {
                    logger.debug({ unhandled: true, msgId: msgId, fromMe: false, frame: frame }, 'communication recv');
                }
            }
        });
    };
    var end = function (error) {
        if (closed) {
            logger.trace({ trace: error === null || error === void 0 ? void 0 : error.stack }, 'connection already closed');
            return;
        }
        closed = true;
        logger.info({ trace: error === null || error === void 0 ? void 0 : error.stack }, error ? 'connection errored' : 'connection closed');
        clearInterval(keepAliveReq);
        clearTimeout(qrTimer);
        ws.removeAllListeners('close');
        ws.removeAllListeners('open');
        ws.removeAllListeners('message');
        if (!ws.isClosed && !ws.isClosing) {
            try {
                ws.close();
            }
            catch (_a) { }
        }
        ev.emit('connection.update', {
            connection: 'close',
            lastDisconnect: {
                error: error,
                date: new Date()
            }
        });
        ev.removeAllListeners('connection.update');
    };
    var waitForSocketOpen = function () { return __awaiter(void 0, void 0, void 0, function () {
        var onOpen, onClose;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ws.isOpen) {
                        return [2 /*return*/];
                    }
                    if (ws.isClosed || ws.isClosing) {
                        throw new boom_1.Boom('Connection Closed', { statusCode: Types_1.DisconnectReason.connectionClosed });
                    }
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            onOpen = function () { return resolve(undefined); };
                            onClose = mapWebSocketError(reject);
                            ws.on('open', onOpen);
                            ws.on('close', onClose);
                            ws.on('error', onClose);
                        }).finally(function () {
                            ws.off('open', onOpen);
                            ws.off('close', onClose);
                            ws.off('error', onClose);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var startKeepAliveRequest = function () {
        return (keepAliveReq = setInterval(function () {
            if (!lastDateRecv) {
                lastDateRecv = new Date();
            }
            var diff = Date.now() - lastDateRecv.getTime();
            /*
                check if it's been a suspicious amount of time since the server responded with our last seen
                it could be that the network is down
            */
            if (diff > keepAliveIntervalMs + 5000) {
                end(new boom_1.Boom('Connection was lost', { statusCode: Types_1.DisconnectReason.connectionLost }));
            }
            else if (ws.isOpen) {
                // if its all good, send a keep alive request
                query({
                    tag: 'iq',
                    attrs: {
                        id: generateMessageTag(),
                        to: WABinary_1.S_WHATSAPP_NET,
                        type: 'get',
                        xmlns: 'w:p'
                    },
                    content: [{ tag: 'ping', attrs: {} }]
                }).catch(function (err) {
                    logger.error({ trace: err.stack }, 'error in sending keep alive');
                });
            }
            else {
                logger.warn('keep alive called when WS not open');
            }
        }, keepAliveIntervalMs));
    };
    /** i have no idea why this exists. pls enlighten me */
    var sendPassiveIq = function (tag) {
        return query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                xmlns: 'passive',
                type: 'set'
            },
            content: [{ tag: tag, attrs: {} }]
        });
    };
    /** logout & invalidate connection */
    var logout = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
        var jid;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    jid = (_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id;
                    if (!jid) return [3 /*break*/, 2];
                    return [4 /*yield*/, sendNode({
                            tag: 'iq',
                            attrs: {
                                to: WABinary_1.S_WHATSAPP_NET,
                                type: 'set',
                                id: generateMessageTag(),
                                xmlns: 'md'
                            },
                            content: [
                                {
                                    tag: 'remove-companion-device',
                                    attrs: {
                                        jid: jid,
                                        reason: 'user_initiated'
                                    }
                                }
                            ]
                        })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    end(new boom_1.Boom(msg || 'Intentional Logout', { statusCode: Types_1.DisconnectReason.loggedOut }));
                    return [2 /*return*/];
            }
        });
    }); };
    var requestPairingCode = function (phoneNumber, customPairingCode) { return __awaiter(void 0, void 0, void 0, function () {
        var pairingCode, _a;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    pairingCode = customPairingCode !== null && customPairingCode !== void 0 ? customPairingCode : (0, Utils_1.bytesToCrockford)((0, crypto_1.randomBytes)(5));
                    if (customPairingCode && (customPairingCode === null || customPairingCode === void 0 ? void 0 : customPairingCode.length) !== 8) {
                        throw new Error('Custom pairing code must be exactly 8 chars');
                    }
                    authState.creds.pairingCode = pairingCode;
                    authState.creds.me = {
                        id: (0, WABinary_1.jidEncode)(phoneNumber, 's.whatsapp.net'),
                        name: '~'
                    };
                    ev.emit('creds.update', authState.creds);
                    _a = sendNode;
                    _b = {
                        tag: 'iq',
                        attrs: {
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'set',
                            id: generateMessageTag(),
                            xmlns: 'md'
                        }
                    };
                    _c = {
                        tag: 'link_code_companion_reg',
                        attrs: {
                            jid: authState.creds.me.id,
                            stage: 'companion_hello',
                            should_show_push_notification: 'true'
                        }
                    };
                    _d = {
                        tag: 'link_code_pairing_wrapped_companion_ephemeral_pub',
                        attrs: {}
                    };
                    return [4 /*yield*/, generatePairingKey()];
                case 1: return [4 /*yield*/, _a.apply(void 0, [(_b.content = [
                            (_c.content = [
                                (_d.content = _e.sent(),
                                    _d),
                                {
                                    tag: 'companion_server_auth_key_pub',
                                    attrs: {},
                                    content: authState.creds.noiseKey.public
                                },
                                {
                                    tag: 'companion_platform_id',
                                    attrs: {},
                                    content: (0, Utils_1.getPlatformId)(browser[1])
                                },
                                {
                                    tag: 'companion_platform_display',
                                    attrs: {},
                                    content: "".concat(browser[1], " (").concat(browser[0], ")")
                                },
                                {
                                    tag: 'link_code_pairing_nonce',
                                    attrs: {},
                                    content: '0'
                                }
                            ],
                                _c)
                        ],
                            _b)])];
                case 2:
                    _e.sent();
                    return [2 /*return*/, authState.creds.pairingCode];
            }
        });
    }); };
    function generatePairingKey() {
        return __awaiter(this, void 0, void 0, function () {
            var salt, randomIv, key, ciphered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        salt = (0, crypto_1.randomBytes)(32);
                        randomIv = (0, crypto_1.randomBytes)(16);
                        return [4 /*yield*/, (0, Utils_1.derivePairingCodeKey)(authState.creds.pairingCode, salt)];
                    case 1:
                        key = _a.sent();
                        ciphered = (0, Utils_1.aesEncryptCTR)(authState.creds.pairingEphemeralKeyPair.public, key, randomIv);
                        return [2 /*return*/, Buffer.concat([salt, randomIv, ciphered])];
                }
            });
        });
    }
    var sendWAMBuffer = function (wamBuffer) {
        return query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                id: generateMessageTag(),
                xmlns: 'w:stats'
            },
            content: [
                {
                    tag: 'add',
                    attrs: {},
                    content: wamBuffer
                }
            ]
        });
    };
    ws.on('message', onMessageReceived);
    ws.on('open', function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, validateConnection()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    logger.error({ err: err_1 }, 'error in validating connection');
                    end(err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    ws.on('error', mapWebSocketError(end));
    ws.on('close', function () { return end(new boom_1.Boom('Connection Terminated', { statusCode: Types_1.DisconnectReason.connectionClosed })); });
    // the server terminated the connection
    ws.on('CB:xmlstreamend', function () {
        return end(new boom_1.Boom('Connection Terminated by Server', { statusCode: Types_1.DisconnectReason.connectionClosed }));
    });
    // QR gen
    ws.on('CB:iq,type:set,pair-device', function (stanza) { return __awaiter(void 0, void 0, void 0, function () {
        var iq, pairDeviceNode, refNodes, noiseKeyB64, identityKeyB64, advB64, qrMs, genPairQR;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iq = {
                        tag: 'iq',
                        attrs: {
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'result',
                            id: stanza.attrs.id
                        }
                    };
                    return [4 /*yield*/, sendNode(iq)];
                case 1:
                    _a.sent();
                    pairDeviceNode = (0, WABinary_1.getBinaryNodeChild)(stanza, 'pair-device');
                    refNodes = (0, WABinary_1.getBinaryNodeChildren)(pairDeviceNode, 'ref');
                    noiseKeyB64 = Buffer.from(creds.noiseKey.public).toString('base64');
                    identityKeyB64 = Buffer.from(creds.signedIdentityKey.public).toString('base64');
                    advB64 = creds.advSecretKey;
                    qrMs = qrTimeout || 60000 // time to let a QR live
                    ;
                    genPairQR = function () {
                        if (!ws.isOpen) {
                            return;
                        }
                        var refNode = refNodes.shift();
                        if (!refNode) {
                            end(new boom_1.Boom('QR refs attempts ended', { statusCode: Types_1.DisconnectReason.timedOut }));
                            return;
                        }
                        var ref = refNode.content.toString('utf-8');
                        var qr = [ref, noiseKeyB64, identityKeyB64, advB64].join(',');
                        ev.emit('connection.update', { qr: qr });
                        qrTimer = setTimeout(genPairQR, qrMs);
                        qrMs = qrTimeout || 20000; // shorter subsequent qrs
                    };
                    genPairQR();
                    return [2 /*return*/];
            }
        });
    }); });
    // device paired for the first time
    // if device pairs successfully, the server asks to restart the connection
    ws.on('CB:iq,,pair-success', function (stanza) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, reply, updatedCreds, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger.debug('pair success recv');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = (0, Utils_1.configureSuccessfulPairing)(stanza, creds), reply = _a.reply, updatedCreds = _a.creds;
                    logger.info({ me: updatedCreds.me, platform: updatedCreds.platform }, 'pairing configured successfully, expect to restart the connection...');
                    ev.emit('creds.update', updatedCreds);
                    ev.emit('connection.update', { isNewLogin: true, qr: undefined });
                    return [4 /*yield*/, sendNode(reply)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    logger.info({ trace: error_2.stack }, 'error in pairing');
                    end(error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // login complete
    ws.on('CB:success', function (node) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, uploadPreKeysToServerIfRequired()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sendPassiveIq('active')];
                case 2:
                    _a.sent();
                    logger.info('opened connection to WA');
                    clearTimeout(qrTimer); // will never happen in all likelyhood -- but just in case WA sends success on first try
                    ev.emit('creds.update', { me: __assign(__assign({}, authState.creds.me), { lid: node.attrs.lid }) });
                    ev.emit('connection.update', { connection: 'open' });
                    return [2 /*return*/];
            }
        });
    }); });
    ws.on('CB:stream:error', function (node) {
        logger.error({ node: node }, 'stream errored out');
        var _a = (0, Utils_1.getErrorCodeFromStreamError)(node), reason = _a.reason, statusCode = _a.statusCode;
        end(new boom_1.Boom("Stream Errored (".concat(reason, ")"), { statusCode: statusCode, data: node }));
    });
    // stream fail, possible logout
    ws.on('CB:failure', function (node) {
        var reason = +(node.attrs.reason || 500);
        end(new boom_1.Boom('Connection Failure', { statusCode: reason, data: node.attrs }));
    });
    ws.on('CB:ib,,downgrade_webclient', function () {
        end(new boom_1.Boom('Multi-device beta not joined', { statusCode: Types_1.DisconnectReason.multideviceMismatch }));
    });
    ws.on('CB:ib,,offline_preview', function (node) {
        logger.info('offline preview received', JSON.stringify(node));
        sendNode({
            tag: 'ib',
            attrs: {},
            content: [{ tag: 'offline_batch', attrs: { count: '100' } }]
        });
    });
    ws.on('CB:ib,,edge_routing', function (node) {
        var edgeRoutingNode = (0, WABinary_1.getBinaryNodeChild)(node, 'edge_routing');
        var routingInfo = (0, WABinary_1.getBinaryNodeChild)(edgeRoutingNode, 'routing_info');
        if (routingInfo === null || routingInfo === void 0 ? void 0 : routingInfo.content) {
            authState.creds.routingInfo = Buffer.from(routingInfo === null || routingInfo === void 0 ? void 0 : routingInfo.content);
            ev.emit('creds.update', authState.creds);
        }
    });
    var didStartBuffer = false;
    process.nextTick(function () {
        var _a;
        if ((_a = creds.me) === null || _a === void 0 ? void 0 : _a.id) {
            // start buffering important events
            // if we're logged in
            ev.buffer();
            didStartBuffer = true;
        }
        ev.emit('connection.update', { connection: 'connecting', receivedPendingNotifications: false, qr: undefined });
    });
    // called when all offline notifs are handled
    ws.on('CB:ib,,offline', function (node) {
        var child = (0, WABinary_1.getBinaryNodeChild)(node, 'offline');
        var offlineNotifs = +((child === null || child === void 0 ? void 0 : child.attrs.count) || 0);
        logger.info("handled ".concat(offlineNotifs, " offline messages/notifications"));
        if (didStartBuffer) {
            ev.flush();
            logger.trace('flushed events for initial buffer');
        }
        ev.emit('connection.update', { receivedPendingNotifications: true });
    });
    // update credentials when required
    ev.on('creds.update', function (update) {
        var _a, _b;
        var name = (_a = update.me) === null || _a === void 0 ? void 0 : _a.name;
        // if name has just been received
        if (((_b = creds.me) === null || _b === void 0 ? void 0 : _b.name) !== name) {
            logger.debug({ name: name }, 'updated pushName');
            sendNode({
                tag: 'presence',
                attrs: { name: name }
            }).catch(function (err) {
                logger.warn({ trace: err.stack }, 'error in sending presence update on name change');
            });
        }
        Object.assign(creds, update);
    });
    return {
        type: 'md',
        ws: ws,
        ev: ev,
        authState: { creds: creds, keys: keys },
        signalRepository: signalRepository,
        get user() {
            return authState.creds.me;
        },
        generateMessageTag: generateMessageTag,
        query: query,
        waitForMessage: waitForMessage,
        waitForSocketOpen: waitForSocketOpen,
        sendRawMessage: sendRawMessage,
        sendNode: sendNode,
        logout: logout,
        end: end,
        onUnexpectedError: onUnexpectedError,
        uploadPreKeys: uploadPreKeys,
        uploadPreKeysToServerIfRequired: uploadPreKeysToServerIfRequired,
        requestPairingCode: requestPairingCode,
        /** Waits for the connection to WA to reach a state */
        waitForConnectionUpdate: (0, Utils_1.bindWaitForConnectionUpdate)(ev),
        sendWAMBuffer: sendWAMBuffer
    };
};
exports.makeSocket = makeSocket;
/**
 * map the websocket error to the right type
 * so it can be retried by the caller
 * */
function mapWebSocketError(handler) {
    return function (error) {
        handler(new boom_1.Boom("WebSocket Error (".concat(error === null || error === void 0 ? void 0 : error.message, ")"), { statusCode: (0, Utils_1.getCodeFromWSError)(error), data: error }));
    };
}
//# sourceMappingURL=socket.js.map