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
exports.getNextPreKeysNode = exports.getNextPreKeys = exports.extractDeviceJids = exports.parseAndInjectE2ESessions = exports.xmppPreKey = exports.xmppSignedPreKey = exports.generateOrGetPreKeys = exports.getPreKeys = exports.createSignalIdentity = void 0;
var Defaults_1 = require("../Defaults/index.js");
var WABinary_1 = require("../WABinary/index.js");
var crypto_1 = require("./crypto.js");
var generics_1 = require("./generics.js");
function chunk(array, size) {
    var chunks = [];
    for (var i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
var createSignalIdentity = function (wid, accountSignatureKey) {
    return {
        identifier: { name: wid, deviceId: 0 },
        identifierKey: (0, crypto_1.generateSignalPubKey)(accountSignatureKey)
    };
};
exports.createSignalIdentity = createSignalIdentity;
var getPreKeys = function (_a, min_1, limit_1) { return __awaiter(void 0, [_a, min_1, limit_1], void 0, function (_b, min, limit) {
    var idList, id;
    var get = _b.get;
    return __generator(this, function (_c) {
        idList = [];
        for (id = min; id < limit; id++) {
            idList.push(id.toString());
        }
        return [2 /*return*/, get('pre-key', idList)];
    });
}); };
exports.getPreKeys = getPreKeys;
var generateOrGetPreKeys = function (creds, range) {
    var avaliable = creds.nextPreKeyId - creds.firstUnuploadedPreKeyId;
    var remaining = range - avaliable;
    var lastPreKeyId = creds.nextPreKeyId + remaining - 1;
    var newPreKeys = {};
    if (remaining > 0) {
        for (var i = creds.nextPreKeyId; i <= lastPreKeyId; i++) {
            newPreKeys[i] = crypto_1.Curve.generateKeyPair();
        }
    }
    return {
        newPreKeys: newPreKeys,
        lastPreKeyId: lastPreKeyId,
        preKeysRange: [creds.firstUnuploadedPreKeyId, range]
    };
};
exports.generateOrGetPreKeys = generateOrGetPreKeys;
var xmppSignedPreKey = function (key) { return ({
    tag: 'skey',
    attrs: {},
    content: [
        { tag: 'id', attrs: {}, content: (0, generics_1.encodeBigEndian)(key.keyId, 3) },
        { tag: 'value', attrs: {}, content: key.keyPair.public },
        { tag: 'signature', attrs: {}, content: key.signature }
    ]
}); };
exports.xmppSignedPreKey = xmppSignedPreKey;
var xmppPreKey = function (pair, id) { return ({
    tag: 'key',
    attrs: {},
    content: [
        { tag: 'id', attrs: {}, content: (0, generics_1.encodeBigEndian)(id, 3) },
        { tag: 'value', attrs: {}, content: pair.public }
    ]
}); };
exports.xmppPreKey = xmppPreKey;
var parseAndInjectE2ESessions = function (node, repository) { return __awaiter(void 0, void 0, void 0, function () {
    var extractKey, nodes, _i, nodes_1, node_1, chunkSize, chunks, _a, chunks_1, nodesChunk;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                extractKey = function (key) {
                    return key
                        ? {
                            keyId: (0, WABinary_1.getBinaryNodeChildUInt)(key, 'id', 3),
                            publicKey: (0, crypto_1.generateSignalPubKey)((0, WABinary_1.getBinaryNodeChildBuffer)(key, 'value')),
                            signature: (0, WABinary_1.getBinaryNodeChildBuffer)(key, 'signature')
                        }
                        : undefined;
                };
                nodes = (0, WABinary_1.getBinaryNodeChildren)((0, WABinary_1.getBinaryNodeChild)(node, 'list'), 'user');
                for (_i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    node_1 = nodes_1[_i];
                    (0, WABinary_1.assertNodeErrorFree)(node_1);
                }
                chunkSize = 100;
                chunks = chunk(nodes, chunkSize);
                _a = 0, chunks_1 = chunks;
                _b.label = 1;
            case 1:
                if (!(_a < chunks_1.length)) return [3 /*break*/, 4];
                nodesChunk = chunks_1[_a];
                return [4 /*yield*/, Promise.all(nodesChunk.map(function (node) { return __awaiter(void 0, void 0, void 0, function () {
                        var signedKey, key, identity, jid, registrationId;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    signedKey = (0, WABinary_1.getBinaryNodeChild)(node, 'skey');
                                    key = (0, WABinary_1.getBinaryNodeChild)(node, 'key');
                                    identity = (0, WABinary_1.getBinaryNodeChildBuffer)(node, 'identity');
                                    jid = node.attrs.jid;
                                    registrationId = (0, WABinary_1.getBinaryNodeChildUInt)(node, 'registration', 4);
                                    return [4 /*yield*/, repository.injectE2ESession({
                                            jid: jid,
                                            session: {
                                                registrationId: registrationId,
                                                identityKey: (0, crypto_1.generateSignalPubKey)(identity),
                                                signedPreKey: extractKey(signedKey),
                                                preKey: extractKey(key)
                                            }
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                _a++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.parseAndInjectE2ESessions = parseAndInjectE2ESessions;
var extractDeviceJids = function (result, myJid, excludeZeroDevices) {
    var _a = (0, WABinary_1.jidDecode)(myJid), myUser = _a.user, myDevice = _a.device;
    var extracted = [];
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var userResult = result_1[_i];
        var _b = userResult, devices = _b.devices, id = _b.id;
        var user = (0, WABinary_1.jidDecode)(id).user;
        var deviceList = devices === null || devices === void 0 ? void 0 : devices.deviceList;
        if (Array.isArray(deviceList)) {
            for (var _c = 0, deviceList_1 = deviceList; _c < deviceList_1.length; _c++) {
                var _d = deviceList_1[_c], device = _d.id, keyIndex = _d.keyIndex;
                if ((!excludeZeroDevices || device !== 0) && // if zero devices are not-excluded, or device is non zero
                    (myUser !== user || myDevice !== device) && // either different user or if me user, not this device
                    (device === 0 || !!keyIndex) // ensure that "key-index" is specified for "non-zero" devices, produces a bad req otherwise
                ) {
                    extracted.push({ user: user, device: device });
                }
            }
        }
    }
    return extracted;
};
exports.extractDeviceJids = extractDeviceJids;
/**
 * get the next N keys for upload or processing
 * @param count number of pre-keys to get or generate
 */
var getNextPreKeys = function (_a, count_1) { return __awaiter(void 0, [_a, count_1], void 0, function (_b, count) {
    var _c, newPreKeys, lastPreKeyId, preKeysRange, update, preKeys;
    var creds = _b.creds, keys = _b.keys;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _c = (0, exports.generateOrGetPreKeys)(creds, count), newPreKeys = _c.newPreKeys, lastPreKeyId = _c.lastPreKeyId, preKeysRange = _c.preKeysRange;
                update = {
                    nextPreKeyId: Math.max(lastPreKeyId + 1, creds.nextPreKeyId),
                    firstUnuploadedPreKeyId: Math.max(creds.firstUnuploadedPreKeyId, lastPreKeyId + 1)
                };
                return [4 /*yield*/, keys.set({ 'pre-key': newPreKeys })];
            case 1:
                _d.sent();
                return [4 /*yield*/, (0, exports.getPreKeys)(keys, preKeysRange[0], preKeysRange[0] + preKeysRange[1])];
            case 2:
                preKeys = _d.sent();
                return [2 /*return*/, { update: update, preKeys: preKeys }];
        }
    });
}); };
exports.getNextPreKeys = getNextPreKeys;
var getNextPreKeysNode = function (state, count) { return __awaiter(void 0, void 0, void 0, function () {
    var creds, _a, update, preKeys, node;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                creds = state.creds;
                return [4 /*yield*/, (0, exports.getNextPreKeys)(state, count)];
            case 1:
                _a = _b.sent(), update = _a.update, preKeys = _a.preKeys;
                node = {
                    tag: 'iq',
                    attrs: {
                        xmlns: 'encrypt',
                        type: 'set',
                        to: WABinary_1.S_WHATSAPP_NET
                    },
                    content: [
                        { tag: 'registration', attrs: {}, content: (0, generics_1.encodeBigEndian)(creds.registrationId) },
                        { tag: 'type', attrs: {}, content: Defaults_1.KEY_BUNDLE_TYPE },
                        { tag: 'identity', attrs: {}, content: creds.signedIdentityKey.public },
                        { tag: 'list', attrs: {}, content: Object.keys(preKeys).map(function (k) { return (0, exports.xmppPreKey)(preKeys[+k], +k); }) },
                        (0, exports.xmppSignedPreKey)(creds.signedPreKey)
                    ]
                };
                return [2 /*return*/, { update: update, node: node }];
        }
    });
}); };
exports.getNextPreKeysNode = getNextPreKeysNode;
//# sourceMappingURL=signal.js.map