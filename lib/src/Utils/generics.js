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
exports.isWABusinessPlatform = exports.getCodeFromWSError = exports.getCallStatusFromNode = exports.getErrorCodeFromStreamError = exports.getStatusFromReceiptType = exports.generateMdTagPrefix = exports.fetchLatestWaWebVersion = exports.fetchLatestBaileysVersion = exports.bindWaitForConnectionUpdate = exports.generateMessageID = exports.generateMessageIDV2 = exports.delayCancellable = exports.delay = exports.debouncedTimeout = exports.unixTimestampSeconds = exports.toNumber = exports.encodeBigEndian = exports.generateRegistrationId = exports.encodeWAMessage = exports.unpadRandomMax16 = exports.writeRandomPadMax16 = exports.getKeyAuthor = exports.BufferJSON = exports.getPlatformId = exports.Browsers = void 0;
exports.promiseTimeout = promiseTimeout;
exports.bindWaitForEvent = bindWaitForEvent;
exports.trimUndefined = trimUndefined;
exports.bytesToCrockford = bytesToCrockford;
exports.encodeNewsletterMessage = encodeNewsletterMessage;
var boom_1 = require("@hapi/boom");
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var os_1 = require("os");
var index_js_1 = require("../../WAProto/index.js");
var baileys_version_json_1 = require("../Defaults/baileys-version.json");
var baileysVersion = baileys_version_json_1.default.version;
var Types_1 = require("../Types/index.js");
var WABinary_1 = require("../WABinary/index.js");
var PLATFORM_MAP = {
    aix: 'AIX',
    darwin: 'Mac OS',
    win32: 'Windows',
    android: 'Android',
    freebsd: 'FreeBSD',
    openbsd: 'OpenBSD',
    sunos: 'Solaris',
    linux: undefined,
    haiku: undefined,
    cygwin: undefined,
    netbsd: undefined
};
exports.Browsers = {
    ubuntu: function (browser) { return ['Ubuntu', browser, '22.04.4']; },
    macOS: function (browser) { return ['Mac OS', browser, '14.4.1']; },
    baileys: function (browser) { return ['Baileys', browser, '6.5.0']; },
    windows: function (browser) { return ['Windows', browser, '10.0.22631']; },
    /** The appropriate browser based on your OS & release */
    appropriate: function (browser) { return [PLATFORM_MAP[(0, os_1.platform)()] || 'Ubuntu', browser, (0, os_1.release)()]; }
};
var getPlatformId = function (browser) {
    var platformType = index_js_1.proto.DeviceProps.PlatformType[browser.toUpperCase()];
    return platformType ? platformType.toString() : '1'; //chrome
};
exports.getPlatformId = getPlatformId;
exports.BufferJSON = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    replacer: function (k, value) {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || (value === null || value === void 0 ? void 0 : value.type) === 'Buffer') {
            return { type: 'Buffer', data: Buffer.from((value === null || value === void 0 ? void 0 : value.data) || value).toString('base64') };
        }
        return value;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviver: function (_, value) {
        if (typeof value === 'object' && !!value && (value.buffer === true || value.type === 'Buffer')) {
            var val = value.data || value.value;
            return typeof val === 'string' ? Buffer.from(val, 'base64') : Buffer.from(val || []);
        }
        return value;
    }
};
var getKeyAuthor = function (key, meId) {
    if (meId === void 0) { meId = 'me'; }
    return ((key === null || key === void 0 ? void 0 : key.fromMe) ? meId : (key === null || key === void 0 ? void 0 : key.participant) || (key === null || key === void 0 ? void 0 : key.remoteJid)) || '';
};
exports.getKeyAuthor = getKeyAuthor;
var writeRandomPadMax16 = function (msg) {
    var pad = (0, crypto_1.randomBytes)(1);
    if (pad[0]) {
        pad[0] &= 0xf;
    }
    else {
        pad[0] = 0xf;
    }
    return Buffer.concat([msg, Buffer.alloc(pad[0], pad[0])]);
};
exports.writeRandomPadMax16 = writeRandomPadMax16;
var unpadRandomMax16 = function (e) {
    var t = new Uint8Array(e);
    if (0 === t.length) {
        throw new Error('unpadPkcs7 given empty bytes');
    }
    var r = t[t.length - 1];
    if (r > t.length) {
        throw new Error("unpad given ".concat(t.length, " bytes, but pad is ").concat(r));
    }
    return new Uint8Array(t.buffer, t.byteOffset, t.length - r);
};
exports.unpadRandomMax16 = unpadRandomMax16;
var encodeWAMessage = function (message) { return (0, exports.writeRandomPadMax16)(index_js_1.proto.Message.encode(message).finish()); };
exports.encodeWAMessage = encodeWAMessage;
var generateRegistrationId = function () {
    return Uint16Array.from((0, crypto_1.randomBytes)(2))[0] & 16383;
};
exports.generateRegistrationId = generateRegistrationId;
var encodeBigEndian = function (e, t) {
    if (t === void 0) { t = 4; }
    var r = e;
    var a = new Uint8Array(t);
    for (var i = t - 1; i >= 0; i--) {
        a[i] = 255 & r;
        r >>>= 8;
    }
    return a;
};
exports.encodeBigEndian = encodeBigEndian;
var toNumber = function (t) {
    return typeof t === 'object' && t ? ('toNumber' in t ? t.toNumber() : t.low) : t || 0;
};
exports.toNumber = toNumber;
/** unix timestamp of a date in seconds */
var unixTimestampSeconds = function (date) {
    if (date === void 0) { date = new Date(); }
    return Math.floor(date.getTime() / 1000);
};
exports.unixTimestampSeconds = unixTimestampSeconds;
var debouncedTimeout = function (intervalMs, task) {
    if (intervalMs === void 0) { intervalMs = 1000; }
    var timeout;
    return {
        start: function (newIntervalMs, newTask) {
            task = newTask || task;
            intervalMs = newIntervalMs || intervalMs;
            timeout && clearTimeout(timeout);
            timeout = setTimeout(function () { return task === null || task === void 0 ? void 0 : task(); }, intervalMs);
        },
        cancel: function () {
            timeout && clearTimeout(timeout);
            timeout = undefined;
        },
        setTask: function (newTask) { return (task = newTask); },
        setInterval: function (newInterval) { return (intervalMs = newInterval); }
    };
};
exports.debouncedTimeout = debouncedTimeout;
var delay = function (ms) { return (0, exports.delayCancellable)(ms).delay; };
exports.delay = delay;
var delayCancellable = function (ms) {
    var stack = new Error().stack;
    var timeout;
    var reject;
    var delay = new Promise(function (resolve, _reject) {
        timeout = setTimeout(resolve, ms);
        reject = _reject;
    });
    var cancel = function () {
        clearTimeout(timeout);
        reject(new boom_1.Boom('Cancelled', {
            statusCode: 500,
            data: {
                stack: stack
            }
        }));
    };
    return { delay: delay, cancel: cancel };
};
exports.delayCancellable = delayCancellable;
function promiseTimeout(ms, promise) {
    return __awaiter(this, void 0, void 0, function () {
        var stack, _a, delay, cancel, p;
        return __generator(this, function (_b) {
            if (!ms) {
                return [2 /*return*/, new Promise(promise)];
            }
            stack = new Error().stack;
            _a = (0, exports.delayCancellable)(ms), delay = _a.delay, cancel = _a.cancel;
            p = new Promise(function (resolve, reject) {
                delay
                    .then(function () {
                    return reject(new boom_1.Boom('Timed Out', {
                        statusCode: Types_1.DisconnectReason.timedOut,
                        data: {
                            stack: stack
                        }
                    }));
                })
                    .catch(function (err) { return reject(err); });
                promise(resolve, reject);
            }).finally(cancel);
            return [2 /*return*/, p];
        });
    });
}
// inspired from whatsmeow code
// https://github.com/tulir/whatsmeow/blob/64bc969fbe78d31ae0dd443b8d4c80a5d026d07a/send.go#L42
var generateMessageIDV2 = function (userId) {
    var data = Buffer.alloc(8 + 20 + 16);
    data.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000)));
    if (userId) {
        var id = (0, WABinary_1.jidDecode)(userId);
        if (id === null || id === void 0 ? void 0 : id.user) {
            data.write(id.user, 8);
            data.write('@c.us', 8 + id.user.length);
        }
    }
    var random = (0, crypto_1.randomBytes)(16);
    random.copy(data, 28);
    var hash = (0, crypto_1.createHash)('sha256').update(data).digest();
    return '3EB0' + hash.toString('hex').toUpperCase().substring(0, 18);
};
exports.generateMessageIDV2 = generateMessageIDV2;
// generate a random ID to attach to a message
var generateMessageID = function () { return '3EB0' + (0, crypto_1.randomBytes)(18).toString('hex').toUpperCase(); };
exports.generateMessageID = generateMessageID;
function bindWaitForEvent(ev, event) {
    var _this = this;
    return function (check, timeoutMs) { return __awaiter(_this, void 0, void 0, function () {
        var listener, closeListener;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promiseTimeout(timeoutMs, function (resolve, reject) {
                        closeListener = function (_a) {
                            var connection = _a.connection, lastDisconnect = _a.lastDisconnect;
                            if (connection === 'close') {
                                reject((lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) || new boom_1.Boom('Connection Closed', { statusCode: Types_1.DisconnectReason.connectionClosed }));
                            }
                        };
                        ev.on('connection.update', closeListener);
                        listener = function (update) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, check(update)];
                                    case 1:
                                        if (_a.sent()) {
                                            resolve();
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        ev.on(event, listener);
                    }).finally(function () {
                        ev.off(event, listener);
                        ev.off('connection.update', closeListener);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
}
var bindWaitForConnectionUpdate = function (ev) { return bindWaitForEvent(ev, 'connection.update'); };
exports.bindWaitForConnectionUpdate = bindWaitForConnectionUpdate;
/**
 * utility that fetches latest baileys version from the master branch.
 * Use to ensure your WA connection is always on the latest version
 */
var fetchLatestBaileysVersion = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (options) {
        var URL, result, error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    URL = 'https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(URL, __assign(__assign({}, options), { responseType: 'json' }))];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, {
                            version: result.data.version,
                            isLatest: true
                        }];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, {
                            version: baileysVersion,
                            isLatest: false,
                            error: error_1
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.fetchLatestBaileysVersion = fetchLatestBaileysVersion;
/**
 * A utility that fetches the latest web version of whatsapp.
 * Use to ensure your WA connection is always on the latest version
 */
var fetchLatestWaWebVersion = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var data, regex, match, clientRevision, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get('https://web.whatsapp.com/sw.js', __assign(__assign({}, options), { responseType: 'json' }))];
            case 1:
                data = (_a.sent()).data;
                regex = /\\?"client_revision\\?":\s*(\d+)/;
                match = data.match(regex);
                if (!(match === null || match === void 0 ? void 0 : match[1])) {
                    return [2 /*return*/, {
                            version: baileysVersion,
                            isLatest: false,
                            error: {
                                message: 'Could not find client revision in the fetched content'
                            }
                        }];
                }
                clientRevision = match[1];
                return [2 /*return*/, {
                        version: [2, 3000, +clientRevision],
                        isLatest: true
                    }];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, {
                        version: baileysVersion,
                        isLatest: false,
                        error: error_2
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.fetchLatestWaWebVersion = fetchLatestWaWebVersion;
/** unique message tag prefix for MD clients */
var generateMdTagPrefix = function () {
    var bytes = (0, crypto_1.randomBytes)(4);
    return "".concat(bytes.readUInt16BE(), ".").concat(bytes.readUInt16BE(2), "-");
};
exports.generateMdTagPrefix = generateMdTagPrefix;
var STATUS_MAP = {
    sender: index_js_1.proto.WebMessageInfo.Status.SERVER_ACK,
    played: index_js_1.proto.WebMessageInfo.Status.PLAYED,
    read: index_js_1.proto.WebMessageInfo.Status.READ,
    'read-self': index_js_1.proto.WebMessageInfo.Status.READ
};
/**
 * Given a type of receipt, returns what the new status of the message should be
 * @param type type from receipt
 */
var getStatusFromReceiptType = function (type) {
    var status = STATUS_MAP[type];
    if (typeof type === 'undefined') {
        return index_js_1.proto.WebMessageInfo.Status.DELIVERY_ACK;
    }
    return status;
};
exports.getStatusFromReceiptType = getStatusFromReceiptType;
var CODE_MAP = {
    conflict: Types_1.DisconnectReason.connectionReplaced
};
/**
 * Stream errors generally provide a reason, map that to a baileys DisconnectReason
 * @param reason the string reason given, eg. "conflict"
 */
var getErrorCodeFromStreamError = function (node) {
    var reasonNode = (0, WABinary_1.getAllBinaryNodeChildren)(node)[0];
    var reason = (reasonNode === null || reasonNode === void 0 ? void 0 : reasonNode.tag) || 'unknown';
    var statusCode = +(node.attrs.code || CODE_MAP[reason] || Types_1.DisconnectReason.badSession);
    if (statusCode === Types_1.DisconnectReason.restartRequired) {
        reason = 'restart required';
    }
    return {
        reason: reason,
        statusCode: statusCode
    };
};
exports.getErrorCodeFromStreamError = getErrorCodeFromStreamError;
var getCallStatusFromNode = function (_a) {
    var tag = _a.tag, attrs = _a.attrs;
    var status;
    switch (tag) {
        case 'offer':
        case 'offer_notice':
            status = 'offer';
            break;
        case 'terminate':
            if (attrs.reason === 'timeout') {
                status = 'timeout';
            }
            else {
                //fired when accepted/rejected/timeout/caller hangs up
                status = 'terminate';
            }
            break;
        case 'reject':
            status = 'reject';
            break;
        case 'accept':
            status = 'accept';
            break;
        default:
            status = 'ringing';
            break;
    }
    return status;
};
exports.getCallStatusFromNode = getCallStatusFromNode;
var UNEXPECTED_SERVER_CODE_TEXT = 'Unexpected server response: ';
var getCodeFromWSError = function (error) {
    var _a, _b, _c;
    var statusCode = 500;
    if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes(UNEXPECTED_SERVER_CODE_TEXT)) {
        var code = +(error === null || error === void 0 ? void 0 : error.message.slice(UNEXPECTED_SERVER_CODE_TEXT.length));
        if (!Number.isNaN(code) && code >= 400) {
            statusCode = code;
        }
    }
    else if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((_b = error === null || error === void 0 ? void 0 : error.code) === null || _b === void 0 ? void 0 : _b.startsWith('E')) ||
        ((_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0 ? void 0 : _c.includes('timed out'))) {
        // handle ETIMEOUT, ENOTFOUND etc
        statusCode = 408;
    }
    return statusCode;
};
exports.getCodeFromWSError = getCodeFromWSError;
/**
 * Is the given platform WA business
 * @param platform AuthenticationCreds.platform
 */
var isWABusinessPlatform = function (platform) {
    return platform === 'smbi' || platform === 'smba';
};
exports.isWABusinessPlatform = isWABusinessPlatform;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function trimUndefined(obj) {
    for (var key in obj) {
        if (typeof obj[key] === 'undefined') {
            delete obj[key];
        }
    }
    return obj;
}
var CROCKFORD_CHARACTERS = '123456789ABCDEFGHJKLMNPQRSTVWXYZ';
function bytesToCrockford(buffer) {
    var value = 0;
    var bitCount = 0;
    var crockford = [];
    for (var _i = 0, buffer_1 = buffer; _i < buffer_1.length; _i++) {
        var element = buffer_1[_i];
        value = (value << 8) | (element & 0xff);
        bitCount += 8;
        while (bitCount >= 5) {
            crockford.push(CROCKFORD_CHARACTERS.charAt((value >>> (bitCount - 5)) & 31));
            bitCount -= 5;
        }
    }
    if (bitCount > 0) {
        crockford.push(CROCKFORD_CHARACTERS.charAt((value << (5 - bitCount)) & 31));
    }
    return crockford.join('');
}
function encodeNewsletterMessage(message) {
    return index_js_1.proto.Message.encode(message).finish();
}
//# sourceMappingURL=generics.js.map