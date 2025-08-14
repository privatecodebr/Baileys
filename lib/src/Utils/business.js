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
exports.uploadingNecessaryImages = exports.parseProductNode = exports.toProductNode = exports.parseOrderDetailsNode = exports.parseCollectionsNode = exports.parseCatalogNode = void 0;
exports.uploadingNecessaryImagesOfProduct = uploadingNecessaryImagesOfProduct;
var boom_1 = require("@hapi/boom");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var WABinary_1 = require("../WABinary/index.js");
var generics_1 = require("./generics.js");
var messages_media_1 = require("./messages-media.js");
var parseCatalogNode = function (node) {
    var catalogNode = (0, WABinary_1.getBinaryNodeChild)(node, 'product_catalog');
    var products = (0, WABinary_1.getBinaryNodeChildren)(catalogNode, 'product').map(exports.parseProductNode);
    var paging = (0, WABinary_1.getBinaryNodeChild)(catalogNode, 'paging');
    return {
        products: products,
        nextPageCursor: paging ? (0, WABinary_1.getBinaryNodeChildString)(paging, 'after') : undefined
    };
};
exports.parseCatalogNode = parseCatalogNode;
var parseCollectionsNode = function (node) {
    var collectionsNode = (0, WABinary_1.getBinaryNodeChild)(node, 'collections');
    var collections = (0, WABinary_1.getBinaryNodeChildren)(collectionsNode, 'collection').map(function (collectionNode) {
        var id = (0, WABinary_1.getBinaryNodeChildString)(collectionNode, 'id');
        var name = (0, WABinary_1.getBinaryNodeChildString)(collectionNode, 'name');
        var products = (0, WABinary_1.getBinaryNodeChildren)(collectionNode, 'product').map(exports.parseProductNode);
        return {
            id: id,
            name: name,
            products: products,
            status: parseStatusInfo(collectionNode)
        };
    });
    return {
        collections: collections
    };
};
exports.parseCollectionsNode = parseCollectionsNode;
var parseOrderDetailsNode = function (node) {
    var orderNode = (0, WABinary_1.getBinaryNodeChild)(node, 'order');
    var products = (0, WABinary_1.getBinaryNodeChildren)(orderNode, 'product').map(function (productNode) {
        var imageNode = (0, WABinary_1.getBinaryNodeChild)(productNode, 'image');
        return {
            id: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'id'),
            name: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'name'),
            imageUrl: (0, WABinary_1.getBinaryNodeChildString)(imageNode, 'url'),
            price: +(0, WABinary_1.getBinaryNodeChildString)(productNode, 'price'),
            currency: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'currency'),
            quantity: +(0, WABinary_1.getBinaryNodeChildString)(productNode, 'quantity')
        };
    });
    var priceNode = (0, WABinary_1.getBinaryNodeChild)(orderNode, 'price');
    var orderDetails = {
        price: {
            total: +(0, WABinary_1.getBinaryNodeChildString)(priceNode, 'total'),
            currency: (0, WABinary_1.getBinaryNodeChildString)(priceNode, 'currency')
        },
        products: products
    };
    return orderDetails;
};
exports.parseOrderDetailsNode = parseOrderDetailsNode;
var toProductNode = function (productId, product) {
    var attrs = {};
    var content = [];
    if (typeof productId !== 'undefined') {
        content.push({
            tag: 'id',
            attrs: {},
            content: Buffer.from(productId)
        });
    }
    if (typeof product.name !== 'undefined') {
        content.push({
            tag: 'name',
            attrs: {},
            content: Buffer.from(product.name)
        });
    }
    if (typeof product.description !== 'undefined') {
        content.push({
            tag: 'description',
            attrs: {},
            content: Buffer.from(product.description)
        });
    }
    if (typeof product.retailerId !== 'undefined') {
        content.push({
            tag: 'retailer_id',
            attrs: {},
            content: Buffer.from(product.retailerId)
        });
    }
    if (product.images.length) {
        content.push({
            tag: 'media',
            attrs: {},
            content: product.images.map(function (img) {
                if (!('url' in img)) {
                    throw new boom_1.Boom('Expected img for product to already be uploaded', { statusCode: 400 });
                }
                return {
                    tag: 'image',
                    attrs: {},
                    content: [
                        {
                            tag: 'url',
                            attrs: {},
                            content: Buffer.from(img.url.toString())
                        }
                    ]
                };
            })
        });
    }
    if (typeof product.price !== 'undefined') {
        content.push({
            tag: 'price',
            attrs: {},
            content: Buffer.from(product.price.toString())
        });
    }
    if (typeof product.currency !== 'undefined') {
        content.push({
            tag: 'currency',
            attrs: {},
            content: Buffer.from(product.currency)
        });
    }
    if ('originCountryCode' in product) {
        if (typeof product.originCountryCode === 'undefined') {
            attrs['compliance_category'] = 'COUNTRY_ORIGIN_EXEMPT';
        }
        else {
            content.push({
                tag: 'compliance_info',
                attrs: {},
                content: [
                    {
                        tag: 'country_code_origin',
                        attrs: {},
                        content: Buffer.from(product.originCountryCode)
                    }
                ]
            });
        }
    }
    if (typeof product.isHidden !== 'undefined') {
        attrs['is_hidden'] = product.isHidden.toString();
    }
    var node = {
        tag: 'product',
        attrs: attrs,
        content: content
    };
    return node;
};
exports.toProductNode = toProductNode;
var parseProductNode = function (productNode) {
    var isHidden = productNode.attrs.is_hidden === 'true';
    var id = (0, WABinary_1.getBinaryNodeChildString)(productNode, 'id');
    var mediaNode = (0, WABinary_1.getBinaryNodeChild)(productNode, 'media');
    var statusInfoNode = (0, WABinary_1.getBinaryNodeChild)(productNode, 'status_info');
    var product = {
        id: id,
        imageUrls: parseImageUrls(mediaNode),
        reviewStatus: {
            whatsapp: (0, WABinary_1.getBinaryNodeChildString)(statusInfoNode, 'status')
        },
        availability: 'in stock',
        name: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'name'),
        retailerId: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'retailer_id'),
        url: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'url'),
        description: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'description'),
        price: +(0, WABinary_1.getBinaryNodeChildString)(productNode, 'price'),
        currency: (0, WABinary_1.getBinaryNodeChildString)(productNode, 'currency'),
        isHidden: isHidden
    };
    return product;
};
exports.parseProductNode = parseProductNode;
/**
 * Uploads images not already uploaded to WA's servers
 */
function uploadingNecessaryImagesOfProduct(product_1, waUploadToServer_1) {
    return __awaiter(this, arguments, void 0, function (product, waUploadToServer, timeoutMs) {
        var _a, _b;
        var _c;
        if (timeoutMs === void 0) { timeoutMs = 30000; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = [__assign({}, product)];
                    _c = {};
                    if (!product.images) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.uploadingNecessaryImages)(product.images, waUploadToServer, timeoutMs)];
                case 1:
                    _b = _d.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _b = product.images;
                    _d.label = 3;
                case 3:
                    product = __assign.apply(void 0, _a.concat([(_c.images = _b, _c)]));
                    return [2 /*return*/, product];
            }
        });
    });
}
/**
 * Uploads images not already uploaded to WA's servers
 */
var uploadingNecessaryImages = function (images_1, waUploadToServer_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([images_1, waUploadToServer_1], args_1, true), void 0, function (images, waUploadToServer, timeoutMs) {
        var results;
        if (timeoutMs === void 0) { timeoutMs = 30000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(images.map(function (img) { return __awaiter(void 0, void 0, void 0, function () {
                        var url, stream, hasher, filePath, encFileWriteStream, _a, stream_1, stream_1_1, block, e_1_1, sha, directPath;
                        var _b, e_1, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    if ('url' in img) {
                                        url = img.url.toString();
                                        if (url.includes('.whatsapp.net')) {
                                            return [2 /*return*/, { url: url }];
                                        }
                                    }
                                    return [4 /*yield*/, (0, messages_media_1.getStream)(img)];
                                case 1:
                                    stream = (_e.sent()).stream;
                                    hasher = (0, crypto_1.createHash)('sha256');
                                    filePath = (0, path_1.join)((0, os_1.tmpdir)(), 'img' + (0, generics_1.generateMessageIDV2)());
                                    encFileWriteStream = (0, fs_1.createWriteStream)(filePath);
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
                                    block = _d;
                                    hasher.update(block);
                                    encFileWriteStream.write(block);
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
                                    sha = hasher.digest('base64');
                                    return [4 /*yield*/, waUploadToServer(filePath, {
                                            mediaType: 'product-catalog-image',
                                            fileEncSha256B64: sha,
                                            timeoutMs: timeoutMs
                                        })];
                                case 14:
                                    directPath = (_e.sent()).directPath;
                                    return [4 /*yield*/, fs_1.promises.unlink(filePath).catch(function (err) { return console.log('Error deleting temp file ', err); })];
                                case 15:
                                    _e.sent();
                                    return [2 /*return*/, { url: (0, messages_media_1.getUrlFromDirectPath)(directPath) }];
                            }
                        });
                    }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results];
            }
        });
    });
};
exports.uploadingNecessaryImages = uploadingNecessaryImages;
var parseImageUrls = function (mediaNode) {
    var imgNode = (0, WABinary_1.getBinaryNodeChild)(mediaNode, 'image');
    return {
        requested: (0, WABinary_1.getBinaryNodeChildString)(imgNode, 'request_image_url'),
        original: (0, WABinary_1.getBinaryNodeChildString)(imgNode, 'original_image_url')
    };
};
var parseStatusInfo = function (mediaNode) {
    var node = (0, WABinary_1.getBinaryNodeChild)(mediaNode, 'status_info');
    return {
        status: (0, WABinary_1.getBinaryNodeChildString)(node, 'status'),
        canAppeal: (0, WABinary_1.getBinaryNodeChildString)(node, 'can_appeal') === 'true'
    };
};
//# sourceMappingURL=business.js.map