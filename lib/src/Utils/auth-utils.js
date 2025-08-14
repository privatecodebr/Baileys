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
exports.initAuthCreds = exports.addTransactionCapability = void 0;
exports.makeCacheableSignalKeyStore = makeCacheableSignalKeyStore;
var node_cache_1 = require("@cacheable/node-cache");
var crypto_1 = require("crypto");
var Defaults_1 = require("../Defaults/index.js");
var crypto_2 = require("./crypto.js");
var generics_1 = require("./generics.js");
/**
 * Adds caching capability to a SignalKeyStore
 * @param store the store to add caching to
 * @param logger to log trace events
 * @param _cache cache store to use
 */
function makeCacheableSignalKeyStore(store, logger, _cache) {
    var cache = _cache ||
        new node_cache_1.default({
            stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.SIGNAL_STORE, // 5 minutes
            useClones: false,
            deleteOnExpire: true
        });
    function getUniqueId(type, id) {
        return "".concat(type, ".").concat(id);
    }
    return {
        get: function (type, ids) {
            return __awaiter(this, void 0, void 0, function () {
                var data, idsToFetch, _i, ids_1, id, item, fetched, _a, idsToFetch_1, id, item;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            data = {};
                            idsToFetch = [];
                            for (_i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                                id = ids_1[_i];
                                item = cache.get(getUniqueId(type, id));
                                if (typeof item !== 'undefined') {
                                    data[id] = item;
                                }
                                else {
                                    idsToFetch.push(id);
                                }
                            }
                            if (!idsToFetch.length) return [3 /*break*/, 2];
                            logger === null || logger === void 0 ? void 0 : logger.trace({ items: idsToFetch.length }, 'loading from store');
                            return [4 /*yield*/, store.get(type, idsToFetch)];
                        case 1:
                            fetched = _b.sent();
                            for (_a = 0, idsToFetch_1 = idsToFetch; _a < idsToFetch_1.length; _a++) {
                                id = idsToFetch_1[_a];
                                item = fetched[id];
                                if (item) {
                                    data[id] = item;
                                    cache.set(getUniqueId(type, id), item);
                                }
                            }
                            _b.label = 2;
                        case 2: return [2 /*return*/, data];
                    }
                });
            });
        },
        set: function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var keys, type, id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            keys = 0;
                            for (type in data) {
                                for (id in data[type]) {
                                    cache.set(getUniqueId(type, id), data[type][id]);
                                    keys += 1;
                                }
                            }
                            logger === null || logger === void 0 ? void 0 : logger.trace({ keys: keys }, 'updated cache');
                            return [4 /*yield*/, store.set(data)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        clear: function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            cache.flushAll();
                            return [4 /*yield*/, ((_a = store.clear) === null || _a === void 0 ? void 0 : _a.call(store))];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
    };
}
/**
 * Adds DB like transaction capability (https://en.wikipedia.org/wiki/Database_transaction) to the SignalKeyStore,
 * this allows batch read & write operations & improves the performance of the lib
 * @param state the key store to apply this capability to
 * @param logger logger to log events
 * @returns SignalKeyStore with transaction capability
 */
var addTransactionCapability = function (state, logger, _a) {
    var maxCommitRetries = _a.maxCommitRetries, delayBetweenTriesMs = _a.delayBetweenTriesMs;
    // number of queries made to the DB during the transaction
    // only there for logging purposes
    var dbQueriesInTransaction = 0;
    var transactionCache = {};
    var mutations = {};
    var transactionsInProgress = 0;
    return {
        get: function (type, ids) { return __awaiter(void 0, void 0, void 0, function () {
            var dict_1, idsRequiringFetch, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isInTransaction()) return [3 /*break*/, 3];
                        dict_1 = transactionCache[type];
                        idsRequiringFetch = dict_1 ? ids.filter(function (item) { return typeof dict_1[item] === 'undefined'; }) : ids;
                        if (!idsRequiringFetch.length) return [3 /*break*/, 2];
                        dbQueriesInTransaction += 1;
                        return [4 /*yield*/, state.get(type, idsRequiringFetch)];
                    case 1:
                        result = _a.sent();
                        transactionCache[type] || (transactionCache[type] = {});
                        Object.assign(transactionCache[type], result);
                        _a.label = 2;
                    case 2: return [2 /*return*/, ids.reduce(function (dict, id) {
                            var _a;
                            var value = (_a = transactionCache[type]) === null || _a === void 0 ? void 0 : _a[id];
                            if (value) {
                                dict[id] = value;
                            }
                            return dict;
                        }, {})];
                    case 3: return [2 /*return*/, state.get(type, ids)];
                }
            });
        }); },
        set: function (data) {
            if (isInTransaction()) {
                logger.trace({ types: Object.keys(data) }, 'caching in transaction');
                for (var key_ in data) {
                    var key = key_;
                    transactionCache[key] = transactionCache[key] || {};
                    Object.assign(transactionCache[key], data[key]);
                    mutations[key] = mutations[key] || {};
                    Object.assign(mutations[key], data[key]);
                }
            }
            else {
                return state.set(data);
            }
        },
        isInTransaction: isInTransaction,
        transaction: function (work) {
            return __awaiter(this, void 0, void 0, function () {
                var result, tries, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            transactionsInProgress += 1;
                            if (transactionsInProgress === 1) {
                                logger.trace('entering transaction');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, , 12, 13]);
                            return [4 /*yield*/, work()
                                // commit if this is the outermost transaction
                            ];
                        case 2:
                            result = _a.sent();
                            if (!(transactionsInProgress === 1)) return [3 /*break*/, 11];
                            if (!Object.keys(mutations).length) return [3 /*break*/, 10];
                            logger.trace('committing transaction');
                            tries = maxCommitRetries;
                            _a.label = 3;
                        case 3:
                            if (!tries) return [3 /*break*/, 9];
                            tries -= 1;
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 6, , 8]);
                            return [4 /*yield*/, state.set(mutations)];
                        case 5:
                            _a.sent();
                            logger.trace({ dbQueriesInTransaction: dbQueriesInTransaction }, 'committed transaction');
                            return [3 /*break*/, 9];
                        case 6:
                            error_1 = _a.sent();
                            logger.warn("failed to commit ".concat(Object.keys(mutations).length, " mutations, tries left=").concat(tries));
                            return [4 /*yield*/, (0, generics_1.delay)(delayBetweenTriesMs)];
                        case 7:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 8: return [3 /*break*/, 3];
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            logger.trace('no mutations in transaction');
                            _a.label = 11;
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            transactionsInProgress -= 1;
                            if (transactionsInProgress === 0) {
                                transactionCache = {};
                                mutations = {};
                                dbQueriesInTransaction = 0;
                            }
                            return [7 /*endfinally*/];
                        case 13: return [2 /*return*/, result];
                    }
                });
            });
        }
    };
    function isInTransaction() {
        return transactionsInProgress > 0;
    }
};
exports.addTransactionCapability = addTransactionCapability;
var initAuthCreds = function () {
    var identityKey = crypto_2.Curve.generateKeyPair();
    return {
        noiseKey: crypto_2.Curve.generateKeyPair(),
        pairingEphemeralKeyPair: crypto_2.Curve.generateKeyPair(),
        signedIdentityKey: identityKey,
        signedPreKey: (0, crypto_2.signedKeyPair)(identityKey, 1),
        registrationId: (0, generics_1.generateRegistrationId)(),
        advSecretKey: (0, crypto_1.randomBytes)(32).toString('base64'),
        processedHistoryMessages: [],
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        accountSyncCounter: 0,
        accountSettings: {
            unarchiveChats: false
        },
        registered: false,
        pairingCode: undefined,
        lastPropHash: undefined,
        routingInfo: undefined
    };
};
exports.initAuthCreds = initAuthCreds;
//# sourceMappingURL=auth-utils.js.map