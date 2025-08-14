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
exports.processSyncAction = exports.chatModificationToAppPatch = exports.decodePatches = exports.decodeSyncdSnapshot = exports.downloadExternalPatch = exports.downloadExternalBlob = exports.extractSyncdPatches = exports.decodeSyncdPatch = exports.decodeSyncdMutations = exports.encodeSyncdPatch = exports.newLTHashState = void 0;
var boom_1 = require("@hapi/boom");
var index_js_1 = require("../../WAProto/index.js");
var LabelAssociation_1 = require("../Types/LabelAssociation.js");
var WABinary_1 = require("../WABinary/index.js");
var crypto_1 = require("./crypto.js");
var generics_1 = require("./generics.js");
var lt_hash_1 = require("./lt-hash.js");
var messages_media_1 = require("./messages-media.js");
var mutationKeys = function (keydata) { return __awaiter(void 0, void 0, void 0, function () {
    var expanded;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, crypto_1.hkdf)(keydata, 160, { info: 'WhatsApp Mutation Keys' })];
            case 1:
                expanded = _a.sent();
                return [2 /*return*/, {
                        indexKey: expanded.slice(0, 32),
                        valueEncryptionKey: expanded.slice(32, 64),
                        valueMacKey: expanded.slice(64, 96),
                        snapshotMacKey: expanded.slice(96, 128),
                        patchMacKey: expanded.slice(128, 160)
                    }];
        }
    });
}); };
var generateMac = function (operation, data, keyId, key) {
    var getKeyData = function () {
        var r;
        switch (operation) {
            case index_js_1.proto.SyncdMutation.SyncdOperation.SET:
                r = 0x01;
                break;
            case index_js_1.proto.SyncdMutation.SyncdOperation.REMOVE:
                r = 0x02;
                break;
        }
        var buff = Buffer.from([r]);
        return Buffer.concat([buff, Buffer.from(keyId, 'base64')]);
    };
    var keyData = getKeyData();
    var last = Buffer.alloc(8); // 8 bytes
    last.set([keyData.length], last.length - 1);
    var total = Buffer.concat([keyData, data, last]);
    var hmac = (0, crypto_1.hmacSign)(total, key, 'sha512');
    return hmac.slice(0, 32);
};
var to64BitNetworkOrder = function (e) {
    var buff = Buffer.alloc(8);
    buff.writeUint32BE(e, 4);
    return buff;
};
var makeLtHashGenerator = function (_a) {
    var indexValueMap = _a.indexValueMap, hash = _a.hash;
    indexValueMap = __assign({}, indexValueMap);
    var addBuffs = [];
    var subBuffs = [];
    return {
        mix: function (_a) {
            var indexMac = _a.indexMac, valueMac = _a.valueMac, operation = _a.operation;
            var indexMacBase64 = Buffer.from(indexMac).toString('base64');
            var prevOp = indexValueMap[indexMacBase64];
            if (operation === index_js_1.proto.SyncdMutation.SyncdOperation.REMOVE) {
                if (!prevOp) {
                    throw new boom_1.Boom('tried remove, but no previous op', { data: { indexMac: indexMac, valueMac: valueMac } });
                }
                // remove from index value mac, since this mutation is erased
                delete indexValueMap[indexMacBase64];
            }
            else {
                addBuffs.push(new Uint8Array(valueMac).buffer);
                // add this index into the history map
                indexValueMap[indexMacBase64] = { valueMac: valueMac };
            }
            if (prevOp) {
                subBuffs.push(new Uint8Array(prevOp.valueMac).buffer);
            }
        },
        finish: function () { return __awaiter(void 0, void 0, void 0, function () {
            var hashArrayBuffer, result, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hashArrayBuffer = new Uint8Array(hash).buffer;
                        return [4 /*yield*/, lt_hash_1.LT_HASH_ANTI_TAMPERING.subtractThenAdd(hashArrayBuffer, addBuffs, subBuffs)];
                    case 1:
                        result = _a.sent();
                        buffer = Buffer.from(result);
                        return [2 /*return*/, {
                                hash: buffer,
                                indexValueMap: indexValueMap
                            }];
                }
            });
        }); }
    };
};
var generateSnapshotMac = function (lthash, version, name, key) {
    var total = Buffer.concat([lthash, to64BitNetworkOrder(version), Buffer.from(name, 'utf-8')]);
    return (0, crypto_1.hmacSign)(total, key, 'sha256');
};
var generatePatchMac = function (snapshotMac, valueMacs, version, type, key) {
    var total = Buffer.concat(__spreadArray(__spreadArray([snapshotMac], valueMacs, true), [to64BitNetworkOrder(version), Buffer.from(type, 'utf-8')], false));
    return (0, crypto_1.hmacSign)(total, key);
};
var newLTHashState = function () { return ({ version: 0, hash: Buffer.alloc(128), indexValueMap: {} }); };
exports.newLTHashState = newLTHashState;
var encodeSyncdPatch = function (_a, myAppStateKeyId_1, state_1, getAppStateSyncKey_1) { return __awaiter(void 0, [_a, myAppStateKeyId_1, state_1, getAppStateSyncKey_1], void 0, function (_b, myAppStateKeyId, state, getAppStateSyncKey) {
    var key, _c, encKeyId, indexBuffer, dataProto, encoded, keyValue, encValue, valueMac, indexMac, generator, _d, _e, _f, snapshotMac, patch, base64Index;
    var type = _b.type, index = _b.index, syncAction = _b.syncAction, apiVersion = _b.apiVersion, operation = _b.operation;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                if (!!!myAppStateKeyId) return [3 /*break*/, 2];
                return [4 /*yield*/, getAppStateSyncKey(myAppStateKeyId)];
            case 1:
                _c = _g.sent();
                return [3 /*break*/, 3];
            case 2:
                _c = undefined;
                _g.label = 3;
            case 3:
                key = _c;
                if (!key) {
                    throw new boom_1.Boom("myAppStateKey (\"".concat(myAppStateKeyId, "\") not present"), { statusCode: 404 });
                }
                encKeyId = Buffer.from(myAppStateKeyId, 'base64');
                state = __assign(__assign({}, state), { indexValueMap: __assign({}, state.indexValueMap) });
                indexBuffer = Buffer.from(JSON.stringify(index));
                dataProto = index_js_1.proto.SyncActionData.fromObject({
                    index: indexBuffer,
                    value: syncAction,
                    padding: new Uint8Array(0),
                    version: apiVersion
                });
                encoded = index_js_1.proto.SyncActionData.encode(dataProto).finish();
                return [4 /*yield*/, mutationKeys(key.keyData)];
            case 4:
                keyValue = _g.sent();
                encValue = (0, crypto_1.aesEncrypt)(encoded, keyValue.valueEncryptionKey);
                valueMac = generateMac(operation, encValue, encKeyId, keyValue.valueMacKey);
                indexMac = (0, crypto_1.hmacSign)(indexBuffer, keyValue.indexKey);
                generator = makeLtHashGenerator(state);
                generator.mix({ indexMac: indexMac, valueMac: valueMac, operation: operation });
                _e = (_d = Object).assign;
                _f = [state];
                return [4 /*yield*/, generator.finish()];
            case 5:
                _e.apply(_d, _f.concat([_g.sent()]));
                state.version += 1;
                snapshotMac = generateSnapshotMac(state.hash, state.version, type, keyValue.snapshotMacKey);
                patch = {
                    patchMac: generatePatchMac(snapshotMac, [valueMac], state.version, type, keyValue.patchMacKey),
                    snapshotMac: snapshotMac,
                    keyId: { id: encKeyId },
                    mutations: [
                        {
                            operation: operation,
                            record: {
                                index: {
                                    blob: indexMac
                                },
                                value: {
                                    blob: Buffer.concat([encValue, valueMac])
                                },
                                keyId: { id: encKeyId }
                            }
                        }
                    ]
                };
                base64Index = indexMac.toString('base64');
                state.indexValueMap[base64Index] = { valueMac: valueMac };
                return [2 /*return*/, { patch: patch, state: state }];
        }
    });
}); };
exports.encodeSyncdPatch = encodeSyncdPatch;
var decodeSyncdMutations = function (msgMutations, initialState, getAppStateSyncKey, onMutation, validateMacs) { return __awaiter(void 0, void 0, void 0, function () {
    function getKey(keyId) {
        return __awaiter(this, void 0, void 0, function () {
            var base64Key, keyEnc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        base64Key = Buffer.from(keyId).toString('base64');
                        return [4 /*yield*/, getAppStateSyncKey(base64Key)];
                    case 1:
                        keyEnc = _a.sent();
                        if (!keyEnc) {
                            throw new boom_1.Boom("failed to find key \"".concat(base64Key, "\" to decode mutation"), {
                                statusCode: 404,
                                data: { msgMutations: msgMutations }
                            });
                        }
                        return [2 /*return*/, mutationKeys(keyEnc.keyData)];
                }
            });
        });
    }
    var ltGenerator, _i, msgMutations_1, msgMutation, operation, record, key, content, encContent, ogValueMac, contentHmac, result, syncAction, hmac, indexStr;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ltGenerator = makeLtHashGenerator(initialState);
                _i = 0, msgMutations_1 = msgMutations;
                _a.label = 1;
            case 1:
                if (!(_i < msgMutations_1.length)) return [3 /*break*/, 4];
                msgMutation = msgMutations_1[_i];
                operation = 'operation' in msgMutation ? msgMutation.operation : index_js_1.proto.SyncdMutation.SyncdOperation.SET;
                record = 'record' in msgMutation && !!msgMutation.record ? msgMutation.record : msgMutation;
                return [4 /*yield*/, getKey(record.keyId.id)];
            case 2:
                key = _a.sent();
                content = Buffer.from(record.value.blob);
                encContent = content.slice(0, -32);
                ogValueMac = content.slice(-32);
                if (validateMacs) {
                    contentHmac = generateMac(operation, encContent, record.keyId.id, key.valueMacKey);
                    if (Buffer.compare(contentHmac, ogValueMac) !== 0) {
                        throw new boom_1.Boom('HMAC content verification failed');
                    }
                }
                result = (0, crypto_1.aesDecrypt)(encContent, key.valueEncryptionKey);
                syncAction = index_js_1.proto.SyncActionData.decode(result);
                if (validateMacs) {
                    hmac = (0, crypto_1.hmacSign)(syncAction.index, key.indexKey);
                    if (Buffer.compare(hmac, record.index.blob) !== 0) {
                        throw new boom_1.Boom('HMAC index verification failed');
                    }
                }
                indexStr = Buffer.from(syncAction.index).toString();
                onMutation({ syncAction: syncAction, index: JSON.parse(indexStr) });
                ltGenerator.mix({
                    indexMac: record.index.blob,
                    valueMac: ogValueMac,
                    operation: operation
                });
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [4 /*yield*/, ltGenerator.finish()];
            case 5: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.decodeSyncdMutations = decodeSyncdMutations;
var decodeSyncdPatch = function (msg, name, initialState, getAppStateSyncKey, onMutation, validateMacs) { return __awaiter(void 0, void 0, void 0, function () {
    var base64Key, mainKeyObj, mainKey, mutationmacs, patchMac, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!validateMacs) return [3 /*break*/, 3];
                base64Key = Buffer.from(msg.keyId.id).toString('base64');
                return [4 /*yield*/, getAppStateSyncKey(base64Key)];
            case 1:
                mainKeyObj = _a.sent();
                if (!mainKeyObj) {
                    throw new boom_1.Boom("failed to find key \"".concat(base64Key, "\" to decode patch"), { statusCode: 404, data: { msg: msg } });
                }
                return [4 /*yield*/, mutationKeys(mainKeyObj.keyData)];
            case 2:
                mainKey = _a.sent();
                mutationmacs = msg.mutations.map(function (mutation) { return mutation.record.value.blob.slice(-32); });
                patchMac = generatePatchMac(msg.snapshotMac, mutationmacs, (0, generics_1.toNumber)(msg.version.version), name, mainKey.patchMacKey);
                if (Buffer.compare(patchMac, msg.patchMac) !== 0) {
                    throw new boom_1.Boom('Invalid patch mac');
                }
                _a.label = 3;
            case 3: return [4 /*yield*/, (0, exports.decodeSyncdMutations)(msg.mutations, initialState, getAppStateSyncKey, onMutation, validateMacs)];
            case 4:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
exports.decodeSyncdPatch = decodeSyncdPatch;
var extractSyncdPatches = function (result, options) { return __awaiter(void 0, void 0, void 0, function () {
    var syncNode, collectionNodes, final;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                syncNode = (0, WABinary_1.getBinaryNodeChild)(result, 'sync');
                collectionNodes = (0, WABinary_1.getBinaryNodeChildren)(syncNode, 'collection');
                final = {};
                return [4 /*yield*/, Promise.all(collectionNodes.map(function (collectionNode) { return __awaiter(void 0, void 0, void 0, function () {
                        var patchesNode, patches, snapshotNode, syncds, name, hasMorePatches, snapshot, blobRef, data, _i, patches_1, content, syncd;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    patchesNode = (0, WABinary_1.getBinaryNodeChild)(collectionNode, 'patches');
                                    patches = (0, WABinary_1.getBinaryNodeChildren)(patchesNode || collectionNode, 'patch');
                                    snapshotNode = (0, WABinary_1.getBinaryNodeChild)(collectionNode, 'snapshot');
                                    syncds = [];
                                    name = collectionNode.attrs.name;
                                    hasMorePatches = collectionNode.attrs.has_more_patches === 'true';
                                    snapshot = undefined;
                                    if (!(snapshotNode && !!snapshotNode.content)) return [3 /*break*/, 2];
                                    if (!Buffer.isBuffer(snapshotNode)) {
                                        snapshotNode.content = Buffer.from(Object.values(snapshotNode.content));
                                    }
                                    blobRef = index_js_1.proto.ExternalBlobReference.decode(snapshotNode.content);
                                    return [4 /*yield*/, (0, exports.downloadExternalBlob)(blobRef, options)];
                                case 1:
                                    data = _a.sent();
                                    snapshot = index_js_1.proto.SyncdSnapshot.decode(data);
                                    _a.label = 2;
                                case 2:
                                    for (_i = 0, patches_1 = patches; _i < patches_1.length; _i++) {
                                        content = patches_1[_i].content;
                                        if (content) {
                                            if (!Buffer.isBuffer(content)) {
                                                content = Buffer.from(Object.values(content));
                                            }
                                            syncd = index_js_1.proto.SyncdPatch.decode(content);
                                            if (!syncd.version) {
                                                syncd.version = { version: +collectionNode.attrs.version + 1 };
                                            }
                                            syncds.push(syncd);
                                        }
                                    }
                                    final[name] = { patches: syncds, hasMorePatches: hasMorePatches, snapshot: snapshot };
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                _a.sent();
                return [2 /*return*/, final];
        }
    });
}); };
exports.extractSyncdPatches = extractSyncdPatches;
var downloadExternalBlob = function (blob, options) { return __awaiter(void 0, void 0, void 0, function () {
    var stream, bufferArray, _a, stream_1, stream_1_1, chunk, e_1_1;
    var _b, e_1, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, (0, messages_media_1.downloadContentFromMessage)(blob, 'md-app-state', { options: options })];
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
            case 13: return [2 /*return*/, Buffer.concat(bufferArray)];
        }
    });
}); };
exports.downloadExternalBlob = downloadExternalBlob;
var downloadExternalPatch = function (blob, options) { return __awaiter(void 0, void 0, void 0, function () {
    var buffer, syncData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.downloadExternalBlob)(blob, options)];
            case 1:
                buffer = _a.sent();
                syncData = index_js_1.proto.SyncdMutations.decode(buffer);
                return [2 /*return*/, syncData];
        }
    });
}); };
exports.downloadExternalPatch = downloadExternalPatch;
var decodeSyncdSnapshot = function (name_1, snapshot_1, getAppStateSyncKey_1, minimumVersionNumber_1) {
    var args_1 = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args_1[_i - 4] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([name_1, snapshot_1, getAppStateSyncKey_1, minimumVersionNumber_1], args_1, true), void 0, function (name, snapshot, getAppStateSyncKey, minimumVersionNumber, validateMacs) {
        var newState, mutationMap, areMutationsRequired, _a, hash, indexValueMap, base64Key, keyEnc, result, computedSnapshotMac;
        if (validateMacs === void 0) { validateMacs = true; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newState = (0, exports.newLTHashState)();
                    newState.version = (0, generics_1.toNumber)(snapshot.version.version);
                    mutationMap = {};
                    areMutationsRequired = typeof minimumVersionNumber === 'undefined' || newState.version > minimumVersionNumber;
                    return [4 /*yield*/, (0, exports.decodeSyncdMutations)(snapshot.records, newState, getAppStateSyncKey, areMutationsRequired
                            ? function (mutation) {
                                var _a;
                                var index = (_a = mutation.syncAction.index) === null || _a === void 0 ? void 0 : _a.toString();
                                mutationMap[index] = mutation;
                            }
                            : function () { }, validateMacs)];
                case 1:
                    _a = _b.sent(), hash = _a.hash, indexValueMap = _a.indexValueMap;
                    newState.hash = hash;
                    newState.indexValueMap = indexValueMap;
                    if (!validateMacs) return [3 /*break*/, 4];
                    base64Key = Buffer.from(snapshot.keyId.id).toString('base64');
                    return [4 /*yield*/, getAppStateSyncKey(base64Key)];
                case 2:
                    keyEnc = _b.sent();
                    if (!keyEnc) {
                        throw new boom_1.Boom("failed to find key \"".concat(base64Key, "\" to decode mutation"));
                    }
                    return [4 /*yield*/, mutationKeys(keyEnc.keyData)];
                case 3:
                    result = _b.sent();
                    computedSnapshotMac = generateSnapshotMac(newState.hash, newState.version, name, result.snapshotMacKey);
                    if (Buffer.compare(snapshot.mac, computedSnapshotMac) !== 0) {
                        throw new boom_1.Boom("failed to verify LTHash at ".concat(newState.version, " of ").concat(name, " from snapshot"));
                    }
                    _b.label = 4;
                case 4: return [2 /*return*/, {
                        state: newState,
                        mutationMap: mutationMap
                    }];
            }
        });
    });
};
exports.decodeSyncdSnapshot = decodeSyncdSnapshot;
var decodePatches = function (name_1, syncds_1, initial_1, getAppStateSyncKey_1, options_1, minimumVersionNumber_1, logger_1) {
    var args_1 = [];
    for (var _i = 7; _i < arguments.length; _i++) {
        args_1[_i - 7] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([name_1, syncds_1, initial_1, getAppStateSyncKey_1, options_1, minimumVersionNumber_1, logger_1], args_1, true), void 0, function (name, syncds, initial, getAppStateSyncKey, options, minimumVersionNumber, logger, validateMacs) {
        var newState, mutationMap, _a, syncds_2, syncd, version, keyId, snapshotMac, ref, patchVersion, shouldMutate, decodeResult, base64Key, keyEnc, result, computedSnapshotMac;
        var _b;
        if (validateMacs === void 0) { validateMacs = true; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    newState = __assign(__assign({}, initial), { indexValueMap: __assign({}, initial.indexValueMap) });
                    mutationMap = {};
                    _a = 0, syncds_2 = syncds;
                    _c.label = 1;
                case 1:
                    if (!(_a < syncds_2.length)) return [3 /*break*/, 9];
                    syncd = syncds_2[_a];
                    version = syncd.version, keyId = syncd.keyId, snapshotMac = syncd.snapshotMac;
                    if (!syncd.externalMutations) return [3 /*break*/, 3];
                    logger === null || logger === void 0 ? void 0 : logger.trace({ name: name, version: version }, 'downloading external patch');
                    return [4 /*yield*/, (0, exports.downloadExternalPatch)(syncd.externalMutations, options)];
                case 2:
                    ref = _c.sent();
                    logger === null || logger === void 0 ? void 0 : logger.debug({ name: name, version: version, mutations: ref.mutations.length }, 'downloaded external patch');
                    (_b = syncd.mutations) === null || _b === void 0 ? void 0 : _b.push.apply(_b, ref.mutations);
                    _c.label = 3;
                case 3:
                    patchVersion = (0, generics_1.toNumber)(version.version);
                    newState.version = patchVersion;
                    shouldMutate = typeof minimumVersionNumber === 'undefined' || patchVersion > minimumVersionNumber;
                    return [4 /*yield*/, (0, exports.decodeSyncdPatch)(syncd, name, newState, getAppStateSyncKey, shouldMutate
                            ? function (mutation) {
                                var _a;
                                var index = (_a = mutation.syncAction.index) === null || _a === void 0 ? void 0 : _a.toString();
                                mutationMap[index] = mutation;
                            }
                            : function () { }, true)];
                case 4:
                    decodeResult = _c.sent();
                    newState.hash = decodeResult.hash;
                    newState.indexValueMap = decodeResult.indexValueMap;
                    if (!validateMacs) return [3 /*break*/, 7];
                    base64Key = Buffer.from(keyId.id).toString('base64');
                    return [4 /*yield*/, getAppStateSyncKey(base64Key)];
                case 5:
                    keyEnc = _c.sent();
                    if (!keyEnc) {
                        throw new boom_1.Boom("failed to find key \"".concat(base64Key, "\" to decode mutation"));
                    }
                    return [4 /*yield*/, mutationKeys(keyEnc.keyData)];
                case 6:
                    result = _c.sent();
                    computedSnapshotMac = generateSnapshotMac(newState.hash, newState.version, name, result.snapshotMacKey);
                    if (Buffer.compare(snapshotMac, computedSnapshotMac) !== 0) {
                        throw new boom_1.Boom("failed to verify LTHash at ".concat(newState.version, " of ").concat(name));
                    }
                    _c.label = 7;
                case 7:
                    // clear memory used up by the mutations
                    syncd.mutations = [];
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/, { state: newState, mutationMap: mutationMap }];
            }
        });
    });
};
exports.decodePatches = decodePatches;
var chatModificationToAppPatch = function (mod, jid) {
    var OP = index_js_1.proto.SyncdMutation.SyncdOperation;
    var getMessageRange = function (lastMessages) {
        var messageRange;
        if (Array.isArray(lastMessages)) {
            var lastMsg = lastMessages[lastMessages.length - 1];
            messageRange = {
                lastMessageTimestamp: lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.messageTimestamp,
                messages: (lastMessages === null || lastMessages === void 0 ? void 0 : lastMessages.length)
                    ? lastMessages.map(function (m) {
                        var _a, _b;
                        if (!((_a = m.key) === null || _a === void 0 ? void 0 : _a.id) || !((_b = m.key) === null || _b === void 0 ? void 0 : _b.remoteJid)) {
                            throw new boom_1.Boom('Incomplete key', { statusCode: 400, data: m });
                        }
                        if ((0, WABinary_1.isJidGroup)(m.key.remoteJid) && !m.key.fromMe && !m.key.participant) {
                            throw new boom_1.Boom('Expected not from me message to have participant', { statusCode: 400, data: m });
                        }
                        if (!m.messageTimestamp || !(0, generics_1.toNumber)(m.messageTimestamp)) {
                            throw new boom_1.Boom('Missing timestamp in last message list', { statusCode: 400, data: m });
                        }
                        if (m.key.participant) {
                            m.key.participant = (0, WABinary_1.jidNormalizedUser)(m.key.participant);
                        }
                        return m;
                    })
                    : undefined
            };
        }
        else {
            messageRange = lastMessages;
        }
        return messageRange;
    };
    var patch;
    if ('mute' in mod) {
        patch = {
            syncAction: {
                muteAction: {
                    muted: !!mod.mute,
                    muteEndTimestamp: mod.mute || undefined
                }
            },
            index: ['mute', jid],
            type: 'regular_high',
            apiVersion: 2,
            operation: OP.SET
        };
    }
    else if ('archive' in mod) {
        patch = {
            syncAction: {
                archiveChatAction: {
                    archived: !!mod.archive,
                    messageRange: getMessageRange(mod.lastMessages)
                }
            },
            index: ['archive', jid],
            type: 'regular_low',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('markRead' in mod) {
        patch = {
            syncAction: {
                markChatAsReadAction: {
                    read: mod.markRead,
                    messageRange: getMessageRange(mod.lastMessages)
                }
            },
            index: ['markChatAsRead', jid],
            type: 'regular_low',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('deleteForMe' in mod) {
        var _a = mod.deleteForMe, timestamp = _a.timestamp, key = _a.key, deleteMedia = _a.deleteMedia;
        patch = {
            syncAction: {
                deleteMessageForMeAction: {
                    deleteMedia: deleteMedia,
                    messageTimestamp: timestamp
                }
            },
            index: ['deleteMessageForMe', jid, key.id, key.fromMe ? '1' : '0', '0'],
            type: 'regular_high',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('clear' in mod) {
        patch = {
            syncAction: {
                clearChatAction: {
                    messageRange: getMessageRange(mod.lastMessages)
                }
            },
            index: ['clearChat', jid, '1' /*the option here is 0 when keep starred messages is enabled*/, '0'],
            type: 'regular_high',
            apiVersion: 6,
            operation: OP.SET
        };
    }
    else if ('pin' in mod) {
        patch = {
            syncAction: {
                pinAction: {
                    pinned: !!mod.pin
                }
            },
            index: ['pin_v1', jid],
            type: 'regular_low',
            apiVersion: 5,
            operation: OP.SET
        };
    }
    else if ('contact' in mod) {
        patch = {
            syncAction: {
                contactAction: mod.contact || {}
            },
            index: ['contact', jid],
            type: 'critical_unblock_low',
            apiVersion: 2,
            operation: mod.contact ? OP.SET : OP.REMOVE
        };
    }
    else if ('disableLinkPreviews' in mod) {
        patch = {
            syncAction: {
                privacySettingDisableLinkPreviewsAction: mod.disableLinkPreviews || {}
            },
            index: ['setting_disableLinkPreviews'],
            type: 'regular',
            apiVersion: 8,
            operation: OP.SET
        };
    }
    else if ('star' in mod) {
        var key = mod.star.messages[0];
        patch = {
            syncAction: {
                starAction: {
                    starred: !!mod.star.star
                }
            },
            index: ['star', jid, key.id, key.fromMe ? '1' : '0', '0'],
            type: 'regular_low',
            apiVersion: 2,
            operation: OP.SET
        };
    }
    else if ('delete' in mod) {
        patch = {
            syncAction: {
                deleteChatAction: {
                    messageRange: getMessageRange(mod.lastMessages)
                }
            },
            index: ['deleteChat', jid, '1'],
            type: 'regular_high',
            apiVersion: 6,
            operation: OP.SET
        };
    }
    else if ('pushNameSetting' in mod) {
        patch = {
            syncAction: {
                pushNameSetting: {
                    name: mod.pushNameSetting
                }
            },
            index: ['setting_pushName'],
            type: 'critical_block',
            apiVersion: 1,
            operation: OP.SET
        };
    }
    else if ('addLabel' in mod) {
        patch = {
            syncAction: {
                labelEditAction: {
                    name: mod.addLabel.name,
                    color: mod.addLabel.color,
                    predefinedId: mod.addLabel.predefinedId,
                    deleted: mod.addLabel.deleted
                }
            },
            index: ['label_edit', mod.addLabel.id],
            type: 'regular',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('addChatLabel' in mod) {
        patch = {
            syncAction: {
                labelAssociationAction: {
                    labeled: true
                }
            },
            index: [LabelAssociation_1.LabelAssociationType.Chat, mod.addChatLabel.labelId, jid],
            type: 'regular',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('removeChatLabel' in mod) {
        patch = {
            syncAction: {
                labelAssociationAction: {
                    labeled: false
                }
            },
            index: [LabelAssociation_1.LabelAssociationType.Chat, mod.removeChatLabel.labelId, jid],
            type: 'regular',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('addMessageLabel' in mod) {
        patch = {
            syncAction: {
                labelAssociationAction: {
                    labeled: true
                }
            },
            index: [LabelAssociation_1.LabelAssociationType.Message, mod.addMessageLabel.labelId, jid, mod.addMessageLabel.messageId, '0', '0'],
            type: 'regular',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('removeMessageLabel' in mod) {
        patch = {
            syncAction: {
                labelAssociationAction: {
                    labeled: false
                }
            },
            index: [
                LabelAssociation_1.LabelAssociationType.Message,
                mod.removeMessageLabel.labelId,
                jid,
                mod.removeMessageLabel.messageId,
                '0',
                '0'
            ],
            type: 'regular',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else {
        throw new boom_1.Boom('not supported');
    }
    patch.syncAction.timestamp = Date.now();
    return patch;
};
exports.chatModificationToAppPatch = chatModificationToAppPatch;
var processSyncAction = function (syncAction, ev, me, initialSyncOpts, logger) {
    var _a, _b, _c, _d;
    var isInitialSync = !!initialSyncOpts;
    var accountSettings = initialSyncOpts === null || initialSyncOpts === void 0 ? void 0 : initialSyncOpts.accountSettings;
    logger === null || logger === void 0 ? void 0 : logger.trace({ syncAction: syncAction, initialSync: !!initialSyncOpts }, 'processing sync action');
    var action = syncAction.syncAction.value, _e = syncAction.index, type = _e[0], id = _e[1], msgId = _e[2], fromMe = _e[3];
    if (action === null || action === void 0 ? void 0 : action.muteAction) {
        ev.emit('chats.update', [
            {
                id: id,
                muteEndTime: ((_a = action.muteAction) === null || _a === void 0 ? void 0 : _a.muted) ? (0, generics_1.toNumber)(action.muteAction.muteEndTimestamp) : null,
                conditional: getChatUpdateConditional(id, undefined)
            }
        ]);
    }
    else if ((action === null || action === void 0 ? void 0 : action.archiveChatAction) || type === 'archive' || type === 'unarchive') {
        // okay so we've to do some annoying computation here
        // when we're initially syncing the app state
        // there are a few cases we need to handle
        // 1. if the account unarchiveChats setting is true
        //   a. if the chat is archived, and no further messages have been received -- simple, keep archived
        //   b. if the chat was archived, and the user received messages from the other person afterwards
        //		then the chat should be marked unarchved --
        //		we compare the timestamp of latest message from the other person to determine this
        // 2. if the account unarchiveChats setting is false -- then it doesn't matter,
        //	it'll always take an app state action to mark in unarchived -- which we'll get anyway
        var archiveAction = action === null || action === void 0 ? void 0 : action.archiveChatAction;
        var isArchived = archiveAction ? archiveAction.archived : type === 'archive';
        // // basically we don't need to fire an "archive" update if the chat is being marked unarchvied
        // // this only applies for the initial sync
        // if(isInitialSync && !isArchived) {
        // 	isArchived = false
        // }
        var msgRange = !(accountSettings === null || accountSettings === void 0 ? void 0 : accountSettings.unarchiveChats) ? undefined : archiveAction === null || archiveAction === void 0 ? void 0 : archiveAction.messageRange;
        // logger?.debug({ chat: id, syncAction }, 'message range archive')
        ev.emit('chats.update', [
            {
                id: id,
                archived: isArchived,
                conditional: getChatUpdateConditional(id, msgRange)
            }
        ]);
    }
    else if (action === null || action === void 0 ? void 0 : action.markChatAsReadAction) {
        var markReadAction = action.markChatAsReadAction;
        // basically we don't need to fire an "read" update if the chat is being marked as read
        // because the chat is read by default
        // this only applies for the initial sync
        var isNullUpdate = isInitialSync && markReadAction.read;
        ev.emit('chats.update', [
            {
                id: id,
                unreadCount: isNullUpdate ? null : !!(markReadAction === null || markReadAction === void 0 ? void 0 : markReadAction.read) ? 0 : -1,
                conditional: getChatUpdateConditional(id, markReadAction === null || markReadAction === void 0 ? void 0 : markReadAction.messageRange)
            }
        ]);
    }
    else if ((action === null || action === void 0 ? void 0 : action.deleteMessageForMeAction) || type === 'deleteMessageForMe') {
        ev.emit('messages.delete', {
            keys: [
                {
                    remoteJid: id,
                    id: msgId,
                    fromMe: fromMe === '1'
                }
            ]
        });
    }
    else if (action === null || action === void 0 ? void 0 : action.contactAction) {
        ev.emit('contacts.upsert', [
            {
                id: id,
                name: action.contactAction.fullName,
                lid: action.contactAction.lidJid || undefined,
                jid: (0, WABinary_1.isJidUser)(id) ? id : undefined
            }
        ]);
    }
    else if (action === null || action === void 0 ? void 0 : action.pushNameSetting) {
        var name_1 = (_b = action === null || action === void 0 ? void 0 : action.pushNameSetting) === null || _b === void 0 ? void 0 : _b.name;
        if (name_1 && (me === null || me === void 0 ? void 0 : me.name) !== name_1) {
            ev.emit('creds.update', { me: __assign(__assign({}, me), { name: name_1 }) });
        }
    }
    else if (action === null || action === void 0 ? void 0 : action.pinAction) {
        ev.emit('chats.update', [
            {
                id: id,
                pinned: ((_c = action.pinAction) === null || _c === void 0 ? void 0 : _c.pinned) ? (0, generics_1.toNumber)(action.timestamp) : null,
                conditional: getChatUpdateConditional(id, undefined)
            }
        ]);
    }
    else if (action === null || action === void 0 ? void 0 : action.unarchiveChatsSetting) {
        var unarchiveChats = !!action.unarchiveChatsSetting.unarchiveChats;
        ev.emit('creds.update', { accountSettings: { unarchiveChats: unarchiveChats } });
        logger === null || logger === void 0 ? void 0 : logger.info("archive setting updated => '".concat(action.unarchiveChatsSetting.unarchiveChats, "'"));
        if (accountSettings) {
            accountSettings.unarchiveChats = unarchiveChats;
        }
    }
    else if ((action === null || action === void 0 ? void 0 : action.starAction) || type === 'star') {
        var starred = (_d = action === null || action === void 0 ? void 0 : action.starAction) === null || _d === void 0 ? void 0 : _d.starred;
        if (typeof starred !== 'boolean') {
            starred = syncAction.index[syncAction.index.length - 1] === '1';
        }
        ev.emit('messages.update', [
            {
                key: { remoteJid: id, id: msgId, fromMe: fromMe === '1' },
                update: { starred: starred }
            }
        ]);
    }
    else if ((action === null || action === void 0 ? void 0 : action.deleteChatAction) || type === 'deleteChat') {
        if (!isInitialSync) {
            ev.emit('chats.delete', [id]);
        }
    }
    else if (action === null || action === void 0 ? void 0 : action.labelEditAction) {
        var _f = action.labelEditAction, name_2 = _f.name, color = _f.color, deleted = _f.deleted, predefinedId = _f.predefinedId;
        ev.emit('labels.edit', {
            id: id,
            name: name_2,
            color: color,
            deleted: deleted,
            predefinedId: predefinedId ? String(predefinedId) : undefined
        });
    }
    else if (action === null || action === void 0 ? void 0 : action.labelAssociationAction) {
        ev.emit('labels.association', {
            type: action.labelAssociationAction.labeled ? 'add' : 'remove',
            association: type === LabelAssociation_1.LabelAssociationType.Chat
                ? {
                    type: LabelAssociation_1.LabelAssociationType.Chat,
                    chatId: syncAction.index[2],
                    labelId: syncAction.index[1]
                }
                : {
                    type: LabelAssociation_1.LabelAssociationType.Message,
                    chatId: syncAction.index[2],
                    messageId: syncAction.index[3],
                    labelId: syncAction.index[1]
                }
        });
    }
    else {
        logger === null || logger === void 0 ? void 0 : logger.debug({ syncAction: syncAction, id: id }, 'unprocessable update');
    }
    function getChatUpdateConditional(id, msgRange) {
        return isInitialSync
            ? function (data) {
                var chat = data.historySets.chats[id] || data.chatUpserts[id];
                if (chat) {
                    return msgRange ? isValidPatchBasedOnMessageRange(chat, msgRange) : true;
                }
            }
            : undefined;
    }
    function isValidPatchBasedOnMessageRange(chat, msgRange) {
        var lastMsgTimestamp = Number((msgRange === null || msgRange === void 0 ? void 0 : msgRange.lastMessageTimestamp) || (msgRange === null || msgRange === void 0 ? void 0 : msgRange.lastSystemMessageTimestamp) || 0);
        var chatLastMsgTimestamp = Number((chat === null || chat === void 0 ? void 0 : chat.lastMessageRecvTimestamp) || 0);
        return lastMsgTimestamp >= chatLastMsgTimestamp;
    }
};
exports.processSyncAction = processSyncAction;
//# sourceMappingURL=chat-utils.js.map