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
exports.getUrlInfo = void 0;
var messages_1 = require("./messages.js");
var messages_media_1 = require("./messages-media.js");
var THUMBNAIL_WIDTH_PX = 192;
/** Fetches an image and generates a thumbnail for it */
var getCompressedJpegThumbnail = function (url_1, _a) { return __awaiter(void 0, [url_1, _a], void 0, function (url, _b) {
    var stream, result;
    var thumbnailWidth = _b.thumbnailWidth, fetchOpts = _b.fetchOpts;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, messages_media_1.getHttpStream)(url, fetchOpts)];
            case 1:
                stream = _c.sent();
                return [4 /*yield*/, (0, messages_media_1.extractImageThumb)(stream, thumbnailWidth)];
            case 2:
                result = _c.sent();
                return [2 /*return*/, result];
        }
    });
}); };
/**
 * Given a piece of text, checks for any URL present, generates link preview for the same and returns it
 * Return undefined if the fetch failed or no URL was found
 * @param text first matched URL in text
 * @returns the URL info required to generate link preview
 */
var getUrlInfo = function (text_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([text_1], args_1, true), void 0, function (text, opts) {
        var retries_1, maxRetry_1, getLinkPreview, previewLink, info, image, urlInfo, imageMessage, _a, _b, error_1, error_2;
        var _c;
        if (opts === void 0) { opts = {
            thumbnailWidth: THUMBNAIL_WIDTH_PX,
            fetchOpts: { timeout: 3000 }
        }; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    retries_1 = 0;
                    maxRetry_1 = 5;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('link-preview-js'); })];
                case 1:
                    getLinkPreview = (_d.sent()).getLinkPreview;
                    previewLink = text;
                    if (!text.startsWith('https://') && !text.startsWith('http://')) {
                        previewLink = 'https://' + previewLink;
                    }
                    return [4 /*yield*/, getLinkPreview(previewLink, __assign(__assign({}, opts.fetchOpts), { followRedirects: 'follow', handleRedirects: function (baseURL, forwardedURL) {
                                var urlObj = new URL(baseURL);
                                var forwardedURLObj = new URL(forwardedURL);
                                if (retries_1 >= maxRetry_1) {
                                    return false;
                                }
                                if (forwardedURLObj.hostname === urlObj.hostname ||
                                    forwardedURLObj.hostname === 'www.' + urlObj.hostname ||
                                    'www.' + forwardedURLObj.hostname === urlObj.hostname) {
                                    retries_1 + 1;
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }, headers: opts.fetchOpts }))];
                case 2:
                    info = _d.sent();
                    if (!(info && 'title' in info && info.title)) return [3 /*break*/, 10];
                    image = info.images[0];
                    urlInfo = {
                        'canonical-url': info.url,
                        'matched-text': text,
                        title: info.title,
                        description: info.description,
                        originalThumbnailUrl: image
                    };
                    if (!opts.uploadImage) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, messages_1.prepareWAMessageMedia)({ image: { url: image } }, {
                            upload: opts.uploadImage,
                            mediaTypeOverride: 'thumbnail-link',
                            options: opts.fetchOpts
                        })];
                case 3:
                    imageMessage = (_d.sent()).imageMessage;
                    urlInfo.jpegThumbnail = (imageMessage === null || imageMessage === void 0 ? void 0 : imageMessage.jpegThumbnail) ? Buffer.from(imageMessage.jpegThumbnail) : undefined;
                    urlInfo.highQualityThumbnail = imageMessage || undefined;
                    return [3 /*break*/, 9];
                case 4:
                    _d.trys.push([4, 8, , 9]);
                    _a = urlInfo;
                    if (!image) return [3 /*break*/, 6];
                    return [4 /*yield*/, getCompressedJpegThumbnail(image, opts)];
                case 5:
                    _b = (_d.sent()).buffer;
                    return [3 /*break*/, 7];
                case 6:
                    _b = undefined;
                    _d.label = 7;
                case 7:
                    _a.jpegThumbnail = _b;
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _d.sent();
                    (_c = opts.logger) === null || _c === void 0 ? void 0 : _c.debug({ err: error_1.stack, url: previewLink }, 'error in generating thumbnail');
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, urlInfo];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_2 = _d.sent();
                    if (!error_2.message.includes('receive a valid')) {
                        throw error_2;
                    }
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
};
exports.getUrlInfo = getUrlInfo;
//# sourceMappingURL=link-preview.js.map