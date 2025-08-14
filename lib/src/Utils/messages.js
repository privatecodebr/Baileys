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
exports.assertMediaContent = exports.downloadMediaMessage = exports.aggregateMessageKeysNotFromMe = exports.updateMessageWithPollUpdate = exports.updateMessageWithReaction = exports.updateMessageWithReceipt = exports.getDevice = exports.extractMessageContent = exports.normalizeMessageContent = exports.getContentType = exports.generateWAMessage = exports.generateWAMessageFromContent = exports.generateWAMessageContent = exports.generateForwardMessageContent = exports.prepareDisappearingMessageSettingContent = exports.prepareWAMessageMedia = exports.generateLinkPreviewIfRequired = exports.extractUrlFromText = void 0;
exports.getAggregateVotesInPollMessage = getAggregateVotesInPollMessage;
var boom_1 = require("@hapi/boom");
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var Types_1 = require("../Types/index.js");
var WABinary_1 = require("../WABinary/index.js");
var crypto_2 = require("./crypto.js");
var generics_1 = require("./generics.js");
var messages_media_1 = require("./messages-media.js");
var MIMETYPE_MAP = {
    image: 'image/jpeg',
    video: 'video/mp4',
    document: 'application/pdf',
    audio: 'audio/ogg; codecs=opus',
    sticker: 'image/webp',
    'product-catalog-image': 'image/jpeg'
};
var MessageTypeProto = {
    image: Types_1.WAProto.Message.ImageMessage,
    video: Types_1.WAProto.Message.VideoMessage,
    audio: Types_1.WAProto.Message.AudioMessage,
    sticker: Types_1.WAProto.Message.StickerMessage,
    document: Types_1.WAProto.Message.DocumentMessage
};
/**
 * Uses a regex to test whether the string contains a URL, and returns the URL if it does.
 * @param text eg. hello https://google.com
 * @returns the URL, eg. https://google.com
 */
var extractUrlFromText = function (text) { var _a; return (_a = text.match(Defaults_1.URL_REGEX)) === null || _a === void 0 ? void 0 : _a[0]; };
exports.extractUrlFromText = extractUrlFromText;
var generateLinkPreviewIfRequired = function (text, getUrlInfo, logger) { return __awaiter(void 0, void 0, void 0, function () {
    var url, urlInfo, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = (0, exports.extractUrlFromText)(text);
                if (!(!!getUrlInfo && url)) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getUrlInfo(url)];
            case 2:
                urlInfo = _a.sent();
                return [2 /*return*/, urlInfo];
            case 3:
                error_1 = _a.sent();
                // ignore if fails
                logger === null || logger === void 0 ? void 0 : logger.warn({ trace: error_1.stack }, 'url generation failed');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.generateLinkPreviewIfRequired = generateLinkPreviewIfRequired;
var assertColor = function (color) { return __awaiter(void 0, void 0, void 0, function () {
    var assertedColor, hex;
    return __generator(this, function (_a) {
        if (typeof color === 'number') {
            assertedColor = color > 0 ? color : 0xffffffff + Number(color) + 1;
        }
        else {
            hex = color.trim().replace('#', '');
            if (hex.length <= 6) {
                hex = 'FF' + hex.padStart(6, '0');
            }
            assertedColor = parseInt(hex, 16);
            return [2 /*return*/, assertedColor];
        }
        return [2 /*return*/];
    });
}); };
var prepareWAMessageMedia = function (message, options) { return __awaiter(void 0, void 0, void 0, function () {
    var logger, mediaType, _i, MEDIA_KEYS_1, key, uploadData, cacheableKey, mediaBuff, obj_1, key, isNewsletter, _a, filePath, fileSha256_1, fileLength_1, fileSha256B64, _b, mediaUrl_1, directPath_1, obj_2, requiresDurationComputation, requiresThumbnailComputation, requiresWaveformProcessing, requiresAudioBackground, requiresOriginalForSomeProcessing, _c, mediaKey, encFilePath, originalFilePath, fileEncSha256, fileSha256, fileLength, fileEncSha256B64, _d, mediaUrl, directPath, obj;
    var _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                logger = options.logger;
                for (_i = 0, MEDIA_KEYS_1 = Defaults_1.MEDIA_KEYS; _i < MEDIA_KEYS_1.length; _i++) {
                    key = MEDIA_KEYS_1[_i];
                    if (key in message) {
                        mediaType = key;
                    }
                }
                if (!mediaType) {
                    throw new boom_1.Boom('Invalid media type', { statusCode: 400 });
                }
                uploadData = __assign(__assign({}, message), { media: message[mediaType] });
                delete uploadData[mediaType];
                cacheableKey = typeof uploadData.media === 'object' &&
                    'url' in uploadData.media &&
                    !!uploadData.media.url &&
                    !!options.mediaCache &&
                    mediaType + ':' + uploadData.media.url.toString();
                if (mediaType === 'document' && !uploadData.fileName) {
                    uploadData.fileName = 'file';
                }
                if (!uploadData.mimetype) {
                    uploadData.mimetype = MIMETYPE_MAP[mediaType];
                }
                if (cacheableKey) {
                    mediaBuff = options.mediaCache.get(cacheableKey);
                    if (mediaBuff) {
                        logger === null || logger === void 0 ? void 0 : logger.debug({ cacheableKey: cacheableKey }, 'got media cache hit');
                        obj_1 = Types_1.WAProto.Message.decode(mediaBuff);
                        key = "".concat(mediaType, "Message");
                        Object.assign(obj_1[key], __assign(__assign({}, uploadData), { media: undefined }));
                        return [2 /*return*/, obj_1];
                    }
                }
                isNewsletter = !!options.jid && (0, WABinary_1.isJidNewsletter)(options.jid);
                if (!isNewsletter) return [3 /*break*/, 4];
                logger === null || logger === void 0 ? void 0 : logger.info({ key: cacheableKey }, 'Preparing raw media for newsletter');
                return [4 /*yield*/, (0, messages_media_1.getRawMediaUploadData)(uploadData.media, options.mediaTypeOverride || mediaType, logger)];
            case 1:
                _a = _g.sent(), filePath = _a.filePath, fileSha256_1 = _a.fileSha256, fileLength_1 = _a.fileLength;
                fileSha256B64 = fileSha256_1.toString('base64');
                return [4 /*yield*/, options.upload(filePath, {
                        fileEncSha256B64: fileSha256B64,
                        mediaType: mediaType,
                        timeoutMs: options.mediaUploadTimeoutMs
                    })];
            case 2:
                _b = _g.sent(), mediaUrl_1 = _b.mediaUrl, directPath_1 = _b.directPath;
                return [4 /*yield*/, fs_1.promises.unlink(filePath)];
            case 3:
                _g.sent();
                obj_2 = Types_1.WAProto.Message.fromObject((_e = {},
                    // todo: add more support here
                    _e["".concat(mediaType, "Message")] = MessageTypeProto[mediaType].fromObject(__assign(__assign({ url: mediaUrl_1, directPath: directPath_1, fileSha256: fileSha256_1, fileLength: fileLength_1 }, uploadData), { media: undefined })),
                    _e));
                if (uploadData.ptv) {
                    obj_2.ptvMessage = obj_2.videoMessage;
                    delete obj_2.videoMessage;
                }
                if (cacheableKey) {
                    logger === null || logger === void 0 ? void 0 : logger.debug({ cacheableKey: cacheableKey }, 'set cache');
                    options.mediaCache.set(cacheableKey, Types_1.WAProto.Message.encode(obj_2).finish());
                }
                return [2 /*return*/, obj_2];
            case 4:
                requiresDurationComputation = mediaType === 'audio' && typeof uploadData.seconds === 'undefined';
                requiresThumbnailComputation = (mediaType === 'image' || mediaType === 'video') && typeof uploadData['jpegThumbnail'] === 'undefined';
                requiresWaveformProcessing = mediaType === 'audio' && uploadData.ptt === true;
                requiresAudioBackground = options.backgroundColor && mediaType === 'audio' && uploadData.ptt === true;
                requiresOriginalForSomeProcessing = requiresDurationComputation || requiresThumbnailComputation;
                return [4 /*yield*/, (0, messages_media_1.encryptedStream)(uploadData.media, options.mediaTypeOverride || mediaType, {
                        logger: logger,
                        saveOriginalFileIfRequired: requiresOriginalForSomeProcessing,
                        opts: options.options
                    })];
            case 5:
                _c = _g.sent(), mediaKey = _c.mediaKey, encFilePath = _c.encFilePath, originalFilePath = _c.originalFilePath, fileEncSha256 = _c.fileEncSha256, fileSha256 = _c.fileSha256, fileLength = _c.fileLength;
                fileEncSha256B64 = fileEncSha256.toString('base64');
                return [4 /*yield*/, Promise.all([
                        (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, options.upload(encFilePath, {
                                            fileEncSha256B64: fileEncSha256B64,
                                            mediaType: mediaType,
                                            timeoutMs: options.mediaUploadTimeoutMs
                                        })];
                                    case 1:
                                        result = _a.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.debug({ mediaType: mediaType, cacheableKey: cacheableKey }, 'uploaded media');
                                        return [2 /*return*/, result];
                                }
                            });
                        }); })(),
                        (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, thumbnail, originalImageDimensions, _b, _c, _d, error_2;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        _e.trys.push([0, 9, , 10]);
                                        if (!requiresThumbnailComputation) return [3 /*break*/, 2];
                                        return [4 /*yield*/, (0, messages_media_1.generateThumbnail)(originalFilePath, mediaType, options)];
                                    case 1:
                                        _a = _e.sent(), thumbnail = _a.thumbnail, originalImageDimensions = _a.originalImageDimensions;
                                        uploadData.jpegThumbnail = thumbnail;
                                        if (!uploadData.width && originalImageDimensions) {
                                            uploadData.width = originalImageDimensions.width;
                                            uploadData.height = originalImageDimensions.height;
                                            logger === null || logger === void 0 ? void 0 : logger.debug('set dimensions');
                                        }
                                        logger === null || logger === void 0 ? void 0 : logger.debug('generated thumbnail');
                                        _e.label = 2;
                                    case 2:
                                        if (!requiresDurationComputation) return [3 /*break*/, 4];
                                        _b = uploadData;
                                        return [4 /*yield*/, (0, messages_media_1.getAudioDuration)(originalFilePath)];
                                    case 3:
                                        _b.seconds = _e.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.debug('computed audio duration');
                                        _e.label = 4;
                                    case 4:
                                        if (!requiresWaveformProcessing) return [3 /*break*/, 6];
                                        _c = uploadData;
                                        return [4 /*yield*/, (0, messages_media_1.getAudioWaveform)(originalFilePath, logger)];
                                    case 5:
                                        _c.waveform = _e.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.debug('processed waveform');
                                        _e.label = 6;
                                    case 6:
                                        if (!requiresAudioBackground) return [3 /*break*/, 8];
                                        _d = uploadData;
                                        return [4 /*yield*/, assertColor(options.backgroundColor)];
                                    case 7:
                                        _d.backgroundArgb = _e.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.debug('computed backgroundColor audio status');
                                        _e.label = 8;
                                    case 8: return [3 /*break*/, 10];
                                    case 9:
                                        error_2 = _e.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.warn({ trace: error_2.stack }, 'failed to obtain extra info');
                                        return [3 /*break*/, 10];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); })()
                    ]).finally(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, fs_1.promises.unlink(encFilePath)];
                                case 1:
                                    _a.sent();
                                    if (!originalFilePath) return [3 /*break*/, 3];
                                    return [4 /*yield*/, fs_1.promises.unlink(originalFilePath)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    logger === null || logger === void 0 ? void 0 : logger.debug('removed tmp files');
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_3 = _a.sent();
                                    logger === null || logger === void 0 ? void 0 : logger.warn('failed to remove tmp file');
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 6:
                _d = (_g.sent())[0], mediaUrl = _d.mediaUrl, directPath = _d.directPath;
                obj = Types_1.WAProto.Message.fromObject((_f = {},
                    _f["".concat(mediaType, "Message")] = MessageTypeProto[mediaType].fromObject(__assign(__assign({ url: mediaUrl, directPath: directPath, mediaKey: mediaKey, fileEncSha256: fileEncSha256, fileSha256: fileSha256, fileLength: fileLength, mediaKeyTimestamp: (0, generics_1.unixTimestampSeconds)() }, uploadData), { media: undefined })),
                    _f));
                if (uploadData.ptv) {
                    obj.ptvMessage = obj.videoMessage;
                    delete obj.videoMessage;
                }
                if (cacheableKey) {
                    logger === null || logger === void 0 ? void 0 : logger.debug({ cacheableKey: cacheableKey }, 'set cache');
                    options.mediaCache.set(cacheableKey, Types_1.WAProto.Message.encode(obj).finish());
                }
                return [2 /*return*/, obj];
        }
    });
}); };
exports.prepareWAMessageMedia = prepareWAMessageMedia;
var prepareDisappearingMessageSettingContent = function (ephemeralExpiration) {
    ephemeralExpiration = ephemeralExpiration || 0;
    var content = {
        ephemeralMessage: {
            message: {
                protocolMessage: {
                    type: Types_1.WAProto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING,
                    ephemeralExpiration: ephemeralExpiration
                }
            }
        }
    };
    return Types_1.WAProto.Message.fromObject(content);
};
exports.prepareDisappearingMessageSettingContent = prepareDisappearingMessageSettingContent;
/**
 * Generate forwarded message content like WA does
 * @param message the message to forward
 * @param options.forceForward will show the message as forwarded even if it is from you
 */
var generateForwardMessageContent = function (message, forceForward) {
    var _a, _b;
    var content = message.message;
    if (!content) {
        throw new boom_1.Boom('no content in message', { statusCode: 400 });
    }
    // hacky copy
    content = (0, exports.normalizeMessageContent)(content);
    content = index_js_1.proto.Message.decode(index_js_1.proto.Message.encode(content).finish());
    var key = Object.keys(content)[0];
    var score = ((_b = (_a = content === null || content === void 0 ? void 0 : content[key]) === null || _a === void 0 ? void 0 : _a.contextInfo) === null || _b === void 0 ? void 0 : _b.forwardingScore) || 0;
    score += message.key.fromMe && !forceForward ? 0 : 1;
    if (key === 'conversation') {
        content.extendedTextMessage = { text: content[key] };
        delete content.conversation;
        key = 'extendedTextMessage';
    }
    var key_ = content === null || content === void 0 ? void 0 : content[key];
    if (score > 0) {
        key_.contextInfo = { forwardingScore: score, isForwarded: true };
    }
    else {
        key_.contextInfo = {};
    }
    return content;
};
exports.generateForwardMessageContent = generateForwardMessageContent;
var generateWAMessageContent = function (message, options) { return __awaiter(void 0, void 0, void 0, function () {
    var m, extContent, urlInfo, img, _a, contactLen, exp, pfpUrl, resp, videoMessage, imageMessage, pollCreationMessage, messageType, key, messageType, key;
    var _b;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                m = {};
                if (!('text' in message)) return [3 /*break*/, 5];
                extContent = { text: message.text };
                urlInfo = message.linkPreview;
                if (!(typeof urlInfo === 'undefined')) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.generateLinkPreviewIfRequired)(message.text, options.getUrlInfo, options.logger)];
            case 1:
                urlInfo = _e.sent();
                _e.label = 2;
            case 2:
                if (urlInfo) {
                    extContent.matchedText = urlInfo['matched-text'];
                    extContent.jpegThumbnail = urlInfo.jpegThumbnail;
                    extContent.description = urlInfo.description;
                    extContent.title = urlInfo.title;
                    extContent.previewType = 0;
                    img = urlInfo.highQualityThumbnail;
                    if (img) {
                        extContent.thumbnailDirectPath = img.directPath;
                        extContent.mediaKey = img.mediaKey;
                        extContent.mediaKeyTimestamp = img.mediaKeyTimestamp;
                        extContent.thumbnailWidth = img.width;
                        extContent.thumbnailHeight = img.height;
                        extContent.thumbnailSha256 = img.fileSha256;
                        extContent.thumbnailEncSha256 = img.fileEncSha256;
                    }
                }
                if (!options.backgroundColor) return [3 /*break*/, 4];
                _a = extContent;
                return [4 /*yield*/, assertColor(options.backgroundColor)];
            case 3:
                _a.backgroundArgb = _e.sent();
                _e.label = 4;
            case 4:
                if (options.font) {
                    extContent.font = options.font;
                }
                m.extendedTextMessage = extContent;
                return [3 /*break*/, 27];
            case 5:
                if (!('contacts' in message)) return [3 /*break*/, 6];
                contactLen = message.contacts.contacts.length;
                if (!contactLen) {
                    throw new boom_1.Boom('require atleast 1 contact', { statusCode: 400 });
                }
                if (contactLen === 1) {
                    m.contactMessage = Types_1.WAProto.Message.ContactMessage.fromObject(message.contacts.contacts[0]);
                }
                else {
                    m.contactsArrayMessage = Types_1.WAProto.Message.ContactsArrayMessage.fromObject(message.contacts);
                }
                return [3 /*break*/, 27];
            case 6:
                if (!('location' in message)) return [3 /*break*/, 7];
                m.locationMessage = Types_1.WAProto.Message.LocationMessage.fromObject(message.location);
                return [3 /*break*/, 27];
            case 7:
                if (!('react' in message)) return [3 /*break*/, 8];
                if (!message.react.senderTimestampMs) {
                    message.react.senderTimestampMs = Date.now();
                }
                m.reactionMessage = Types_1.WAProto.Message.ReactionMessage.fromObject(message.react);
                return [3 /*break*/, 27];
            case 8:
                if (!('delete' in message)) return [3 /*break*/, 9];
                m.protocolMessage = {
                    key: message.delete,
                    type: Types_1.WAProto.Message.ProtocolMessage.Type.REVOKE
                };
                return [3 /*break*/, 27];
            case 9:
                if (!('forward' in message)) return [3 /*break*/, 10];
                m = (0, exports.generateForwardMessageContent)(message.forward, message.force);
                return [3 /*break*/, 27];
            case 10:
                if (!('disappearingMessagesInChat' in message)) return [3 /*break*/, 11];
                exp = typeof message.disappearingMessagesInChat === 'boolean'
                    ? message.disappearingMessagesInChat
                        ? Defaults_1.WA_DEFAULT_EPHEMERAL
                        : 0
                    : message.disappearingMessagesInChat;
                m = (0, exports.prepareDisappearingMessageSettingContent)(exp);
                return [3 /*break*/, 27];
            case 11:
                if (!('groupInvite' in message)) return [3 /*break*/, 15];
                m.groupInviteMessage = {};
                m.groupInviteMessage.inviteCode = message.groupInvite.inviteCode;
                m.groupInviteMessage.inviteExpiration = message.groupInvite.inviteExpiration;
                m.groupInviteMessage.caption = message.groupInvite.text;
                m.groupInviteMessage.groupJid = message.groupInvite.jid;
                m.groupInviteMessage.groupName = message.groupInvite.subject;
                if (!options.getProfilePicUrl) return [3 /*break*/, 14];
                return [4 /*yield*/, options.getProfilePicUrl(message.groupInvite.jid, 'preview')];
            case 12:
                pfpUrl = _e.sent();
                if (!pfpUrl) return [3 /*break*/, 14];
                return [4 /*yield*/, axios_1.default.get(pfpUrl, { responseType: 'arraybuffer' })];
            case 13:
                resp = _e.sent();
                if (resp.status === 200) {
                    m.groupInviteMessage.jpegThumbnail = resp.data;
                }
                _e.label = 14;
            case 14: return [3 /*break*/, 27];
            case 15:
                if (!('pin' in message)) return [3 /*break*/, 16];
                m.pinInChatMessage = {};
                m.messageContextInfo = {};
                m.pinInChatMessage.key = message.pin;
                m.pinInChatMessage.type = message.type;
                m.pinInChatMessage.senderTimestampMs = Date.now();
                m.messageContextInfo.messageAddOnDurationInSecs = message.type === 1 ? message.time || 86400 : 0;
                return [3 /*break*/, 27];
            case 16:
                if (!('buttonReply' in message)) return [3 /*break*/, 17];
                switch (message.type) {
                    case 'template':
                        m.templateButtonReplyMessage = {
                            selectedDisplayText: message.buttonReply.displayText,
                            selectedId: message.buttonReply.id,
                            selectedIndex: message.buttonReply.index
                        };
                        break;
                    case 'plain':
                        m.buttonsResponseMessage = {
                            selectedButtonId: message.buttonReply.id,
                            selectedDisplayText: message.buttonReply.displayText,
                            type: index_js_1.proto.Message.ButtonsResponseMessage.Type.DISPLAY_TEXT
                        };
                        break;
                }
                return [3 /*break*/, 27];
            case 17:
                if (!('ptv' in message && message.ptv)) return [3 /*break*/, 19];
                return [4 /*yield*/, (0, exports.prepareWAMessageMedia)({ video: message.video }, options)];
            case 18:
                videoMessage = (_e.sent()).videoMessage;
                m.ptvMessage = videoMessage;
                return [3 /*break*/, 27];
            case 19:
                if (!('product' in message)) return [3 /*break*/, 21];
                return [4 /*yield*/, (0, exports.prepareWAMessageMedia)({ image: message.product.productImage }, options)];
            case 20:
                imageMessage = (_e.sent()).imageMessage;
                m.productMessage = Types_1.WAProto.Message.ProductMessage.fromObject(__assign(__assign({}, message), { product: __assign(__assign({}, message.product), { productImage: imageMessage }) }));
                return [3 /*break*/, 27];
            case 21:
                if (!('listReply' in message)) return [3 /*break*/, 22];
                m.listResponseMessage = __assign({}, message.listReply);
                return [3 /*break*/, 27];
            case 22:
                if (!('poll' in message)) return [3 /*break*/, 23];
                (_c = message.poll).selectableCount || (_c.selectableCount = 0);
                (_d = message.poll).toAnnouncementGroup || (_d.toAnnouncementGroup = false);
                if (!Array.isArray(message.poll.values)) {
                    throw new boom_1.Boom('Invalid poll values', { statusCode: 400 });
                }
                if (message.poll.selectableCount < 0 || message.poll.selectableCount > message.poll.values.length) {
                    throw new boom_1.Boom("poll.selectableCount in poll should be >= 0 and <= ".concat(message.poll.values.length), {
                        statusCode: 400
                    });
                }
                m.messageContextInfo = {
                    // encKey
                    messageSecret: message.poll.messageSecret || (0, crypto_1.randomBytes)(32)
                };
                pollCreationMessage = {
                    name: message.poll.name,
                    selectableOptionsCount: message.poll.selectableCount,
                    options: message.poll.values.map(function (optionName) { return ({ optionName: optionName }); })
                };
                if (message.poll.toAnnouncementGroup) {
                    // poll v2 is for community announcement groups (single select and multiple)
                    m.pollCreationMessageV2 = pollCreationMessage;
                }
                else {
                    if (message.poll.selectableCount === 1) {
                        //poll v3 is for single select polls
                        m.pollCreationMessageV3 = pollCreationMessage;
                    }
                    else {
                        // poll for multiple choice polls
                        m.pollCreationMessage = pollCreationMessage;
                    }
                }
                return [3 /*break*/, 27];
            case 23:
                if (!('sharePhoneNumber' in message)) return [3 /*break*/, 24];
                m.protocolMessage = {
                    type: index_js_1.proto.Message.ProtocolMessage.Type.SHARE_PHONE_NUMBER
                };
                return [3 /*break*/, 27];
            case 24:
                if (!('requestPhoneNumber' in message)) return [3 /*break*/, 25];
                m.requestPhoneNumberMessage = {};
                return [3 /*break*/, 27];
            case 25: return [4 /*yield*/, (0, exports.prepareWAMessageMedia)(message, options)];
            case 26:
                m = _e.sent();
                _e.label = 27;
            case 27:
                if ('viewOnce' in message && !!message.viewOnce) {
                    m = { viewOnceMessage: { message: m } };
                }
                if ('mentions' in message && ((_b = message.mentions) === null || _b === void 0 ? void 0 : _b.length)) {
                    messageType = Object.keys(m)[0];
                    key = m[messageType];
                    if ('contextInfo' in key && !!key.contextInfo) {
                        key.contextInfo.mentionedJid = message.mentions;
                    }
                    else if (key) {
                        key.contextInfo = {
                            mentionedJid: message.mentions
                        };
                    }
                }
                if ('edit' in message) {
                    m = {
                        protocolMessage: {
                            key: message.edit,
                            editedMessage: m,
                            timestampMs: Date.now(),
                            type: Types_1.WAProto.Message.ProtocolMessage.Type.MESSAGE_EDIT
                        }
                    };
                }
                if ('contextInfo' in message && !!message.contextInfo) {
                    messageType = Object.keys(m)[0];
                    key = m[messageType];
                    if ('contextInfo' in key && !!key.contextInfo) {
                        key.contextInfo = __assign(__assign({}, key.contextInfo), message.contextInfo);
                    }
                    else if (key) {
                        key.contextInfo = message.contextInfo;
                    }
                }
                return [2 /*return*/, Types_1.WAProto.Message.fromObject(m)];
        }
    });
}); };
exports.generateWAMessageContent = generateWAMessageContent;
var generateWAMessageFromContent = function (jid, message, options) {
    var _a;
    var _b;
    // set timestamp to now
    // if not specified
    if (!options.timestamp) {
        options.timestamp = new Date();
    }
    var innerMessage = (0, exports.normalizeMessageContent)(message);
    var key = (0, exports.getContentType)(innerMessage);
    var timestamp = (0, generics_1.unixTimestampSeconds)(options.timestamp);
    var quoted = options.quoted, userJid = options.userJid;
    if (quoted && !(0, WABinary_1.isJidNewsletter)(jid)) {
        var participant = quoted.key.fromMe
            ? userJid
            : quoted.participant || quoted.key.participant || quoted.key.remoteJid;
        var quotedMsg = (0, exports.normalizeMessageContent)(quoted.message);
        var msgType = (0, exports.getContentType)(quotedMsg);
        // strip any redundant properties
        quotedMsg = index_js_1.proto.Message.fromObject((_a = {}, _a[msgType] = quotedMsg[msgType], _a));
        var quotedContent = quotedMsg[msgType];
        if (typeof quotedContent === 'object' && quotedContent && 'contextInfo' in quotedContent) {
            delete quotedContent.contextInfo;
        }
        var contextInfo = ('contextInfo' in innerMessage[key] && ((_b = innerMessage[key]) === null || _b === void 0 ? void 0 : _b.contextInfo)) || {};
        contextInfo.participant = (0, WABinary_1.jidNormalizedUser)(participant);
        contextInfo.stanzaId = quoted.key.id;
        contextInfo.quotedMessage = quotedMsg;
        // if a participant is quoted, then it must be a group
        // hence, remoteJid of group must also be entered
        if (jid !== quoted.key.remoteJid) {
            contextInfo.remoteJid = quoted.key.remoteJid;
        }
        if (contextInfo && innerMessage[key]) {
            /* @ts-ignore */
            innerMessage[key].contextInfo = contextInfo;
        }
    }
    if (
    // if we want to send a disappearing message
    !!(options === null || options === void 0 ? void 0 : options.ephemeralExpiration) &&
        // and it's not a protocol message -- delete, toggle disappear message
        key !== 'protocolMessage' &&
        // already not converted to disappearing message
        key !== 'ephemeralMessage' &&
        // newsletters don't support ephemeral messages
        !(0, WABinary_1.isJidNewsletter)(jid)) {
        /* @ts-ignore */
        innerMessage[key].contextInfo = __assign(__assign({}, (innerMessage[key].contextInfo || {})), { expiration: options.ephemeralExpiration || Defaults_1.WA_DEFAULT_EPHEMERAL });
    }
    message = Types_1.WAProto.Message.fromObject(message);
    var messageJSON = {
        key: {
            remoteJid: jid,
            fromMe: true,
            id: (options === null || options === void 0 ? void 0 : options.messageId) || (0, generics_1.generateMessageIDV2)()
        },
        message: message,
        messageTimestamp: timestamp,
        messageStubParameters: [],
        participant: (0, WABinary_1.isJidGroup)(jid) || (0, WABinary_1.isJidStatusBroadcast)(jid) ? userJid : undefined,
        status: Types_1.WAMessageStatus.PENDING
    };
    return Types_1.WAProto.WebMessageInfo.fromObject(messageJSON);
};
exports.generateWAMessageFromContent = generateWAMessageFromContent;
var generateWAMessage = function (jid, content, options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // ensure msg ID is with every log
                options.logger = (_c = options === null || options === void 0 ? void 0 : options.logger) === null || _c === void 0 ? void 0 : _c.child({ msgId: options.messageId });
                _a = exports.generateWAMessageFromContent;
                _b = [jid];
                return [4 /*yield*/, (0, exports.generateWAMessageContent)(content, __assign(__assign({}, options), { jid: jid }))];
            case 1: 
            // Pass jid in the options to generateWAMessageContent
            return [2 /*return*/, _a.apply(void 0, _b.concat([_d.sent(), options]))];
        }
    });
}); };
exports.generateWAMessage = generateWAMessage;
/** Get the key to access the true type of content */
var getContentType = function (content) {
    if (content) {
        var keys = Object.keys(content);
        var key = keys.find(function (k) { return (k === 'conversation' || k.includes('Message')) && k !== 'senderKeyDistributionMessage'; });
        return key;
    }
};
exports.getContentType = getContentType;
/**
 * Normalizes ephemeral, view once messages to regular message content
 * Eg. image messages in ephemeral messages, in view once messages etc.
 * @param content
 * @returns
 */
var normalizeMessageContent = function (content) {
    if (!content) {
        return undefined;
    }
    // set max iterations to prevent an infinite loop
    for (var i = 0; i < 5; i++) {
        var inner = getFutureProofMessage(content);
        if (!inner) {
            break;
        }
        content = inner.message;
    }
    return content;
    function getFutureProofMessage(message) {
        return ((message === null || message === void 0 ? void 0 : message.ephemeralMessage) ||
            (message === null || message === void 0 ? void 0 : message.viewOnceMessage) ||
            (message === null || message === void 0 ? void 0 : message.documentWithCaptionMessage) ||
            (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2) ||
            (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2Extension) ||
            (message === null || message === void 0 ? void 0 : message.editedMessage));
    }
};
exports.normalizeMessageContent = normalizeMessageContent;
/**
 * Extract the true message content from a message
 * Eg. extracts the inner message from a disappearing message/view once message
 */
var extractMessageContent = function (content) {
    var _a, _b, _c, _d, _e, _f;
    var extractFromTemplateMessage = function (msg) {
        if (msg.imageMessage) {
            return { imageMessage: msg.imageMessage };
        }
        else if (msg.documentMessage) {
            return { documentMessage: msg.documentMessage };
        }
        else if (msg.videoMessage) {
            return { videoMessage: msg.videoMessage };
        }
        else if (msg.locationMessage) {
            return { locationMessage: msg.locationMessage };
        }
        else {
            return {
                conversation: 'contentText' in msg ? msg.contentText : 'hydratedContentText' in msg ? msg.hydratedContentText : ''
            };
        }
    };
    content = (0, exports.normalizeMessageContent)(content);
    if (content === null || content === void 0 ? void 0 : content.buttonsMessage) {
        return extractFromTemplateMessage(content.buttonsMessage);
    }
    if ((_a = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _a === void 0 ? void 0 : _a.hydratedFourRowTemplate) {
        return extractFromTemplateMessage((_b = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _b === void 0 ? void 0 : _b.hydratedFourRowTemplate);
    }
    if ((_c = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _c === void 0 ? void 0 : _c.hydratedTemplate) {
        return extractFromTemplateMessage((_d = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _d === void 0 ? void 0 : _d.hydratedTemplate);
    }
    if ((_e = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _e === void 0 ? void 0 : _e.fourRowTemplate) {
        return extractFromTemplateMessage((_f = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _f === void 0 ? void 0 : _f.fourRowTemplate);
    }
    return content;
};
exports.extractMessageContent = extractMessageContent;
/**
 * Returns the device predicted by message ID
 */
var getDevice = function (id) {
    return /^3A.{18}$/.test(id)
        ? 'ios'
        : /^3E.{20}$/.test(id)
            ? 'web'
            : /^(.{21}|.{32})$/.test(id)
                ? 'android'
                : /^(3F|.{18}$)/.test(id)
                    ? 'desktop'
                    : 'unknown';
};
exports.getDevice = getDevice;
/** Upserts a receipt in the message */
var updateMessageWithReceipt = function (msg, receipt) {
    msg.userReceipt = msg.userReceipt || [];
    var recp = msg.userReceipt.find(function (m) { return m.userJid === receipt.userJid; });
    if (recp) {
        Object.assign(recp, receipt);
    }
    else {
        msg.userReceipt.push(receipt);
    }
};
exports.updateMessageWithReceipt = updateMessageWithReceipt;
/** Update the message with a new reaction */
var updateMessageWithReaction = function (msg, reaction) {
    var authorID = (0, generics_1.getKeyAuthor)(reaction.key);
    var reactions = (msg.reactions || []).filter(function (r) { return (0, generics_1.getKeyAuthor)(r.key) !== authorID; });
    reaction.text = reaction.text || '';
    reactions.push(reaction);
    msg.reactions = reactions;
};
exports.updateMessageWithReaction = updateMessageWithReaction;
/** Update the message with a new poll update */
var updateMessageWithPollUpdate = function (msg, update) {
    var _a, _b;
    var authorID = (0, generics_1.getKeyAuthor)(update.pollUpdateMessageKey);
    var reactions = (msg.pollUpdates || []).filter(function (r) { return (0, generics_1.getKeyAuthor)(r.pollUpdateMessageKey) !== authorID; });
    if ((_b = (_a = update.vote) === null || _a === void 0 ? void 0 : _a.selectedOptions) === null || _b === void 0 ? void 0 : _b.length) {
        reactions.push(update);
    }
    msg.pollUpdates = reactions;
};
exports.updateMessageWithPollUpdate = updateMessageWithPollUpdate;
/**
 * Aggregates all poll updates in a poll.
 * @param msg the poll creation message
 * @param meId your jid
 * @returns A list of options & their voters
 */
function getAggregateVotesInPollMessage(_a, meId) {
    var _b, _c, _d;
    var message = _a.message, pollUpdates = _a.pollUpdates;
    var opts = ((_b = message === null || message === void 0 ? void 0 : message.pollCreationMessage) === null || _b === void 0 ? void 0 : _b.options) ||
        ((_c = message === null || message === void 0 ? void 0 : message.pollCreationMessageV2) === null || _c === void 0 ? void 0 : _c.options) ||
        ((_d = message === null || message === void 0 ? void 0 : message.pollCreationMessageV3) === null || _d === void 0 ? void 0 : _d.options) ||
        [];
    var voteHashMap = opts.reduce(function (acc, opt) {
        var hash = (0, crypto_2.sha256)(Buffer.from(opt.optionName || '')).toString();
        acc[hash] = {
            name: opt.optionName || '',
            voters: []
        };
        return acc;
    }, {});
    for (var _i = 0, _e = pollUpdates || []; _i < _e.length; _i++) {
        var update = _e[_i];
        var vote = update.vote;
        if (!vote) {
            continue;
        }
        for (var _f = 0, _g = vote.selectedOptions || []; _f < _g.length; _f++) {
            var option = _g[_f];
            var hash = option.toString();
            var data = voteHashMap[hash];
            if (!data) {
                voteHashMap[hash] = {
                    name: 'Unknown',
                    voters: []
                };
                data = voteHashMap[hash];
            }
            voteHashMap[hash].voters.push((0, generics_1.getKeyAuthor)(update.pollUpdateMessageKey, meId));
        }
    }
    return Object.values(voteHashMap);
}
/** Given a list of message keys, aggregates them by chat & sender. Useful for sending read receipts in bulk */
var aggregateMessageKeysNotFromMe = function (keys) {
    var keyMap = {};
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var _a = keys_1[_i], remoteJid = _a.remoteJid, id = _a.id, participant = _a.participant, fromMe = _a.fromMe;
        if (!fromMe) {
            var uqKey = "".concat(remoteJid, ":").concat(participant || '');
            if (!keyMap[uqKey]) {
                keyMap[uqKey] = {
                    jid: remoteJid,
                    participant: participant,
                    messageIds: []
                };
            }
            keyMap[uqKey].messageIds.push(id);
        }
    }
    return Object.values(keyMap);
};
exports.aggregateMessageKeysNotFromMe = aggregateMessageKeysNotFromMe;
var REUPLOAD_REQUIRED_STATUS = [410, 404];
/**
 * Downloads the given message. Throws an error if it's not a media message
 */
var downloadMediaMessage = function (message, type, options, ctx) { return __awaiter(void 0, void 0, void 0, function () {
    function downloadMsg() {
        return __awaiter(this, void 0, void 0, function () {
            var mContent, contentType, mediaType, media, download, stream, bufferArray, _a, stream_1, stream_1_1, chunk, e_1_1;
            var _b, e_1, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        mContent = (0, exports.extractMessageContent)(message.message);
                        if (!mContent) {
                            throw new boom_1.Boom('No message present', { statusCode: 400, data: message });
                        }
                        contentType = (0, exports.getContentType)(mContent);
                        mediaType = contentType === null || contentType === void 0 ? void 0 : contentType.replace('Message', '');
                        media = mContent[contentType];
                        if (!media || typeof media !== 'object' || (!('url' in media) && !('thumbnailDirectPath' in media))) {
                            throw new boom_1.Boom("\"".concat(contentType, "\" message is not a media message"));
                        }
                        if ('thumbnailDirectPath' in media && !('url' in media)) {
                            download = {
                                directPath: media.thumbnailDirectPath,
                                mediaKey: media.mediaKey
                            };
                            mediaType = 'thumbnail-link';
                        }
                        else {
                            download = media;
                        }
                        return [4 /*yield*/, (0, messages_media_1.downloadContentFromMessage)(download, mediaType, options)];
                    case 1:
                        stream = _e.sent();
                        if (!(type === 'buffer')) return [3 /*break*/, 14];
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
                    case 14: return [2 /*return*/, stream];
                }
            });
        });
    }
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, downloadMsg().catch(function (error) { return __awaiter(void 0, void 0, void 0, function () {
                    var result_1;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!(ctx &&
                                    axios_1.default.isAxiosError(error) && // check if the message requires a reupload
                                    REUPLOAD_REQUIRED_STATUS.includes((_a = error.response) === null || _a === void 0 ? void 0 : _a.status))) return [3 /*break*/, 3];
                                ctx.logger.info({ key: message.key }, 'sending reupload media request...');
                                return [4 /*yield*/, ctx.reuploadRequest(message)];
                            case 1:
                                // request reupload
                                message = _b.sent();
                                return [4 /*yield*/, downloadMsg()];
                            case 2:
                                result_1 = _b.sent();
                                return [2 /*return*/, result_1];
                            case 3: throw error;
                        }
                    });
                }); })];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
exports.downloadMediaMessage = downloadMediaMessage;
/** Checks whether the given message is a media message; if it is returns the inner content */
var assertMediaContent = function (content) {
    content = (0, exports.extractMessageContent)(content);
    var mediaContent = (content === null || content === void 0 ? void 0 : content.documentMessage) ||
        (content === null || content === void 0 ? void 0 : content.imageMessage) ||
        (content === null || content === void 0 ? void 0 : content.videoMessage) ||
        (content === null || content === void 0 ? void 0 : content.audioMessage) ||
        (content === null || content === void 0 ? void 0 : content.stickerMessage);
    if (!mediaContent) {
        throw new boom_1.Boom('given message is not a media message', { statusCode: 400, data: content });
    }
    return mediaContent;
};
exports.assertMediaContent = assertMediaContent;
//# sourceMappingURL=messages.js.map