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
exports.makeBusinessSocket = void 0;
var business_1 = require("../Utils/business.js");
var WABinary_1 = require("../WABinary/index.js");
var generic_utils_1 = require("../WABinary/generic-utils.js");
var messages_recv_1 = require("./messages-recv.js");
var makeBusinessSocket = function (config) {
    var sock = (0, messages_recv_1.makeMessagesRecvSocket)(config);
    var authState = sock.authState, query = sock.query, waUploadToServer = sock.waUploadToServer;
    var getCatalog = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var queryParamNodes, result;
        var _c;
        var jid = _b.jid, limit = _b.limit, cursor = _b.cursor;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    jid = jid || ((_c = authState.creds.me) === null || _c === void 0 ? void 0 : _c.id);
                    jid = (0, WABinary_1.jidNormalizedUser)(jid);
                    queryParamNodes = [
                        {
                            tag: 'limit',
                            attrs: {},
                            content: Buffer.from((limit || 10).toString())
                        },
                        {
                            tag: 'width',
                            attrs: {},
                            content: Buffer.from('100')
                        },
                        {
                            tag: 'height',
                            attrs: {},
                            content: Buffer.from('100')
                        }
                    ];
                    if (cursor) {
                        queryParamNodes.push({
                            tag: 'after',
                            attrs: {},
                            content: cursor
                        });
                    }
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: {
                                to: WABinary_1.S_WHATSAPP_NET,
                                type: 'get',
                                xmlns: 'w:biz:catalog'
                            },
                            content: [
                                {
                                    tag: 'product_catalog',
                                    attrs: {
                                        jid: jid,
                                        allow_shop_source: 'true'
                                    },
                                    content: queryParamNodes
                                }
                            ]
                        })];
                case 1:
                    result = _d.sent();
                    return [2 /*return*/, (0, business_1.parseCatalogNode)(result)];
            }
        });
    }); };
    var getCollections = function (jid_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([jid_1], args_1, true), void 0, function (jid, limit) {
            var result;
            var _a;
            if (limit === void 0) { limit = 51; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        jid = jid || ((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id);
                        jid = (0, WABinary_1.jidNormalizedUser)(jid);
                        return [4 /*yield*/, query({
                                tag: 'iq',
                                attrs: {
                                    to: WABinary_1.S_WHATSAPP_NET,
                                    type: 'get',
                                    xmlns: 'w:biz:catalog',
                                    smax_id: '35'
                                },
                                content: [
                                    {
                                        tag: 'collections',
                                        attrs: {
                                            biz_jid: jid
                                        },
                                        content: [
                                            {
                                                tag: 'collection_limit',
                                                attrs: {},
                                                content: Buffer.from(limit.toString())
                                            },
                                            {
                                                tag: 'item_limit',
                                                attrs: {},
                                                content: Buffer.from(limit.toString())
                                            },
                                            {
                                                tag: 'width',
                                                attrs: {},
                                                content: Buffer.from('100')
                                            },
                                            {
                                                tag: 'height',
                                                attrs: {},
                                                content: Buffer.from('100')
                                            }
                                        ]
                                    }
                                ]
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (0, business_1.parseCollectionsNode)(result)];
                }
            });
        });
    };
    var getOrderDetails = function (orderId, tokenBase64) { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'get',
                            xmlns: 'fb:thrift_iq',
                            smax_id: '5'
                        },
                        content: [
                            {
                                tag: 'order',
                                attrs: {
                                    op: 'get',
                                    id: orderId
                                },
                                content: [
                                    {
                                        tag: 'image_dimensions',
                                        attrs: {},
                                        content: [
                                            {
                                                tag: 'width',
                                                attrs: {},
                                                content: Buffer.from('100')
                                            },
                                            {
                                                tag: 'height',
                                                attrs: {},
                                                content: Buffer.from('100')
                                            }
                                        ]
                                    },
                                    {
                                        tag: 'token',
                                        attrs: {},
                                        content: Buffer.from(tokenBase64)
                                    }
                                ]
                            }
                        ]
                    })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, (0, business_1.parseOrderDetailsNode)(result)];
            }
        });
    }); };
    var productUpdate = function (productId, update) { return __awaiter(void 0, void 0, void 0, function () {
        var editNode, result, productCatalogEditNode, productNode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, business_1.uploadingNecessaryImagesOfProduct)(update, waUploadToServer)];
                case 1:
                    update = _a.sent();
                    editNode = (0, business_1.toProductNode)(productId, update);
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: {
                                to: WABinary_1.S_WHATSAPP_NET,
                                type: 'set',
                                xmlns: 'w:biz:catalog'
                            },
                            content: [
                                {
                                    tag: 'product_catalog_edit',
                                    attrs: { v: '1' },
                                    content: [
                                        editNode,
                                        {
                                            tag: 'width',
                                            attrs: {},
                                            content: '100'
                                        },
                                        {
                                            tag: 'height',
                                            attrs: {},
                                            content: '100'
                                        }
                                    ]
                                }
                            ]
                        })];
                case 2:
                    result = _a.sent();
                    productCatalogEditNode = (0, generic_utils_1.getBinaryNodeChild)(result, 'product_catalog_edit');
                    productNode = (0, generic_utils_1.getBinaryNodeChild)(productCatalogEditNode, 'product');
                    return [2 /*return*/, (0, business_1.parseProductNode)(productNode)];
            }
        });
    }); };
    var productCreate = function (create) { return __awaiter(void 0, void 0, void 0, function () {
        var createNode, result, productCatalogAddNode, productNode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // ensure isHidden is defined
                    create.isHidden = !!create.isHidden;
                    return [4 /*yield*/, (0, business_1.uploadingNecessaryImagesOfProduct)(create, waUploadToServer)];
                case 1:
                    create = _a.sent();
                    createNode = (0, business_1.toProductNode)(undefined, create);
                    return [4 /*yield*/, query({
                            tag: 'iq',
                            attrs: {
                                to: WABinary_1.S_WHATSAPP_NET,
                                type: 'set',
                                xmlns: 'w:biz:catalog'
                            },
                            content: [
                                {
                                    tag: 'product_catalog_add',
                                    attrs: { v: '1' },
                                    content: [
                                        createNode,
                                        {
                                            tag: 'width',
                                            attrs: {},
                                            content: '100'
                                        },
                                        {
                                            tag: 'height',
                                            attrs: {},
                                            content: '100'
                                        }
                                    ]
                                }
                            ]
                        })];
                case 2:
                    result = _a.sent();
                    productCatalogAddNode = (0, generic_utils_1.getBinaryNodeChild)(result, 'product_catalog_add');
                    productNode = (0, generic_utils_1.getBinaryNodeChild)(productCatalogAddNode, 'product');
                    return [2 /*return*/, (0, business_1.parseProductNode)(productNode)];
            }
        });
    }); };
    var productDelete = function (productIds) { return __awaiter(void 0, void 0, void 0, function () {
        var result, productCatalogDelNode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query({
                        tag: 'iq',
                        attrs: {
                            to: WABinary_1.S_WHATSAPP_NET,
                            type: 'set',
                            xmlns: 'w:biz:catalog'
                        },
                        content: [
                            {
                                tag: 'product_catalog_delete',
                                attrs: { v: '1' },
                                content: productIds.map(function (id) { return ({
                                    tag: 'product',
                                    attrs: {},
                                    content: [
                                        {
                                            tag: 'id',
                                            attrs: {},
                                            content: Buffer.from(id)
                                        }
                                    ]
                                }); })
                            }
                        ]
                    })];
                case 1:
                    result = _a.sent();
                    productCatalogDelNode = (0, generic_utils_1.getBinaryNodeChild)(result, 'product_catalog_delete');
                    return [2 /*return*/, {
                            deleted: +((productCatalogDelNode === null || productCatalogDelNode === void 0 ? void 0 : productCatalogDelNode.attrs.deleted_count) || 0)
                        }];
            }
        });
    }); };
    return __assign(__assign({}, sock), { logger: config.logger, getOrderDetails: getOrderDetails, getCatalog: getCatalog, getCollections: getCollections, productCreate: productCreate, productDelete: productDelete, productUpdate: productUpdate });
};
exports.makeBusinessSocket = makeBusinessSocket;
//# sourceMappingURL=business.js.map