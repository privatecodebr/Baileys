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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusCodeForMediaRetry = exports.decryptMediaRetryData = exports.decodeMediaRetryNode = exports.encryptMediaRetryRequest = exports.getWAUploadToServer = exports.downloadEncryptedContent = exports.downloadContentFromMessage = exports.getUrlFromDirectPath = exports.encryptedStream = exports.getHttpStream = exports.getStream = exports.toBuffer = exports.toReadable = exports.mediaMessageSHA256B64 = exports.generateProfilePicture = exports.encodeBase64EncodedStringForUpload = exports.extractImageThumb = exports.getRawMediaUploadData = exports.hkdfInfoKey = void 0;
exports.getMediaKeys = getMediaKeys;
exports.getAudioDuration = getAudioDuration;
exports.getAudioWaveform = getAudioWaveform;
exports.generateThumbnail = generateThumbnail;
exports.extensionForMediaMessage = extensionForMediaMessage;
var boom_1 = require("@hapi/boom");
var axios_1 = require("axios");
var child_process_1 = require("child_process");
var Crypto = require("crypto");
var events_1 = require("events");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var stream_1 = require("stream");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var WABinary_1 = require("../WABinary/index.js");
var crypto_1 = require("./crypto.js");
var generics_1 = require("./generics.js");
var getTmpFilesDirectory = function () { return (0, os_1.tmpdir)(); };
var getImageProcessingLibrary = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, jimp, sharp;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([Promise.resolve().then(function () { return require('jimp'); }).catch(function () { }), Promise.resolve().then(function () { return require('sharp'); }).catch(function () { })])];
            case 1:
                _a = _b.sent(), jimp = _a[0], sharp = _a[1];
                if (sharp) {
                    return [2 /*return*/, { sharp: sharp }];
                }
                if (jimp) {
                    return [2 /*return*/, { jimp: jimp }];
                }
                throw new boom_1.Boom('No image processing library available');
        }
    });
}); };
var hkdfInfoKey = function (type) {
    var hkdfInfo = Defaults_1.MEDIA_HKDF_KEY_MAPPING[type];
    return "WhatsApp ".concat(hkdfInfo, " Keys");
};
exports.hkdfInfoKey = hkdfInfoKey;
var getRawMediaUploadData = function (media, mediaType, logger) { return __awaiter(void 0, void 0, void 0, function () {
    var stream, hasher, filePath, fileWriteStream, fileLength, _a, stream_2, stream_2_1, data, e_1_1, fileSha256, error_1, _b;
    var _c, e_1, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, (0, exports.getStream)(media)];
            case 1:
                stream = (_f.sent()).stream;
                logger === null || logger === void 0 ? void 0 : logger.debug('got stream for raw upload');
                hasher = Crypto.createHash('sha256');
                filePath = (0, path_1.join)((0, os_1.tmpdir)(), mediaType + (0, generics_1.generateMessageIDV2)());
                fileWriteStream = (0, fs_1.createWriteStream)(filePath);
                fileLength = 0;
                _f.label = 2;
            case 2:
                _f.trys.push([2, 17, , 22]);
                _f.label = 3;
            case 3:
                _f.trys.push([3, 9, 10, 15]);
                _a = true, stream_2 = __asyncValues(stream);
                _f.label = 4;
            case 4: return [4 /*yield*/, stream_2.next()];
            case 5:
                if (!(stream_2_1 = _f.sent(), _c = stream_2_1.done, !_c)) return [3 /*break*/, 8];
                _e = stream_2_1.value;
                _a = false;
                data = _e;
                fileLength += data.length;
                hasher.update(data);
                if (!!fileWriteStream.write(data)) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, events_1.once)(fileWriteStream, 'drain')];
            case 6:
                _f.sent();
                _f.label = 7;
            case 7:
                _a = true;
                return [3 /*break*/, 4];
            case 8: return [3 /*break*/, 15];
            case 9:
                e_1_1 = _f.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 15];
            case 10:
                _f.trys.push([10, , 13, 14]);
                if (!(!_a && !_c && (_d = stream_2.return))) return [3 /*break*/, 12];
                return [4 /*yield*/, _d.call(stream_2)];
            case 11:
                _f.sent();
                _f.label = 12;
            case 12: return [3 /*break*/, 14];
            case 13:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 14: return [7 /*endfinally*/];
            case 15:
                fileWriteStream.end();
                return [4 /*yield*/, (0, events_1.once)(fileWriteStream, 'finish')];
            case 16:
                _f.sent();
                stream.destroy();
                fileSha256 = hasher.digest();
                logger === null || logger === void 0 ? void 0 : logger.debug('hashed data for raw upload');
                return [2 /*return*/, {
                        filePath: filePath,
                        fileSha256: fileSha256,
                        fileLength: fileLength
                    }];
            case 17:
                error_1 = _f.sent();
                fileWriteStream.destroy();
                stream.destroy();
                _f.label = 18;
            case 18:
                _f.trys.push([18, 20, , 21]);
                return [4 /*yield*/, fs_1.promises.unlink(filePath)];
            case 19:
                _f.sent();
                return [3 /*break*/, 21];
            case 20:
                _b = _f.sent();
                return [3 /*break*/, 21];
            case 21: throw error_1;
            case 22: return [2 /*return*/];
        }
    });
}); };
exports.getRawMediaUploadData = getRawMediaUploadData;
/** generates all the keys required to encrypt/decrypt & sign a media message */
function getMediaKeys(buffer, mediaType) {
    return __awaiter(this, void 0, void 0, function () {
        var expandedMediaKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!buffer) {
                        throw new boom_1.Boom('Cannot derive from empty media key');
                    }
                    if (typeof buffer === 'string') {
                        buffer = Buffer.from(buffer.replace('data:;base64,', ''), 'base64');
                    }
                    return [4 /*yield*/, (0, crypto_1.hkdf)(buffer, 112, { info: (0, exports.hkdfInfoKey)(mediaType) })];
                case 1:
                    expandedMediaKey = _a.sent();
                    return [2 /*return*/, {
                            iv: expandedMediaKey.slice(0, 16),
                            cipherKey: expandedMediaKey.slice(16, 48),
                            macKey: expandedMediaKey.slice(48, 80)
                        }];
            }
        });
    });
}
/** Extracts video thumb using FFMPEG */
var extractVideoThumb = function (path, destPath, time, size) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var cmd = "ffmpeg -ss ".concat(time, " -i ").concat(path, " -y -vf scale=").concat(size.width, ":-1 -vframes 1 -f image2 ").concat(destPath);
                (0, child_process_1.exec)(cmd, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            })];
    });
}); };
var extractImageThumb = function (bufferOrFilePath_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([bufferOrFilePath_1], args_1, true), void 0, function (bufferOrFilePath, width) {
        var lib, img, dimensions, buffer, jimp, dimensions, buffer;
        var _a, _b;
        if (width === void 0) { width = 32; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(bufferOrFilePath instanceof stream_1.Readable)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.toBuffer)(bufferOrFilePath)];
                case 1:
                    bufferOrFilePath = _c.sent();
                    _c.label = 2;
                case 2: return [4 /*yield*/, getImageProcessingLibrary()];
                case 3:
                    lib = _c.sent();
                    if (!('sharp' in lib && typeof ((_a = lib.sharp) === null || _a === void 0 ? void 0 : _a.default) === 'function')) return [3 /*break*/, 6];
                    img = lib.sharp.default(bufferOrFilePath);
                    return [4 /*yield*/, img.metadata()];
                case 4:
                    dimensions = _c.sent();
                    return [4 /*yield*/, img.resize(width).jpeg({ quality: 50 }).toBuffer()];
                case 5:
                    buffer = _c.sent();
                    return [2 /*return*/, {
                            buffer: buffer,
                            original: {
                                width: dimensions.width,
                                height: dimensions.height
                            }
                        }];
                case 6:
                    if (!('jimp' in lib && typeof ((_b = lib.jimp) === null || _b === void 0 ? void 0 : _b.Jimp) === 'object')) return [3 /*break*/, 9];
                    return [4 /*yield*/, lib.jimp.Jimp.read(bufferOrFilePath)];
                case 7:
                    jimp = _c.sent();
                    dimensions = {
                        width: jimp.width,
                        height: jimp.height
                    };
                    return [4 /*yield*/, jimp
                            .resize({ w: width, mode: lib.jimp.ResizeStrategy.BILINEAR })
                            .getBuffer('image/jpeg', { quality: 50 })];
                case 8:
                    buffer = _c.sent();
                    return [2 /*return*/, {
                            buffer: buffer,
                            original: dimensions
                        }];
                case 9: throw new boom_1.Boom('No image processing library available');
            }
        });
    });
};
exports.extractImageThumb = extractImageThumb;
var encodeBase64EncodedStringForUpload = function (b64) {
    return encodeURIComponent(b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, ''));
};
exports.encodeBase64EncodedStringForUpload = encodeBase64EncodedStringForUpload;
var generateProfilePicture = function (mediaUpload, dimensions) { return __awaiter(void 0, void 0, void 0, function () {
    var buffer, _a, _b, w, _c, h, stream, lib, img, jimp, min, cropped;
    var _d;
    var _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _a = dimensions || {}, _b = _a.width, w = _b === void 0 ? 640 : _b, _c = _a.height, h = _c === void 0 ? 640 : _c;
                if (!Buffer.isBuffer(mediaUpload)) return [3 /*break*/, 1];
                buffer = mediaUpload;
                return [3 /*break*/, 4];
            case 1: return [4 /*yield*/, (0, exports.getStream)(mediaUpload)
                // Convert the resulting stream to a buffer
            ];
            case 2:
                stream = (_g.sent()).stream;
                return [4 /*yield*/, (0, exports.toBuffer)(stream)];
            case 3:
                // Convert the resulting stream to a buffer
                buffer = _g.sent();
                _g.label = 4;
            case 4: return [4 /*yield*/, getImageProcessingLibrary()];
            case 5:
                lib = _g.sent();
                if (!('sharp' in lib && typeof ((_e = lib.sharp) === null || _e === void 0 ? void 0 : _e.default) === 'function')) return [3 /*break*/, 6];
                img = lib.sharp
                    .default(buffer)
                    .resize(w, h)
                    .jpeg({
                    quality: 50
                })
                    .toBuffer();
                return [3 /*break*/, 9];
            case 6:
                if (!('jimp' in lib && typeof ((_f = lib.jimp) === null || _f === void 0 ? void 0 : _f.Jimp) === 'object')) return [3 /*break*/, 8];
                return [4 /*yield*/, lib.jimp.Jimp.read(buffer)];
            case 7:
                jimp = _g.sent();
                min = Math.min(jimp.width, jimp.height);
                cropped = jimp.crop({ x: 0, y: 0, w: min, h: min });
                img = cropped.resize({ w: w, h: h, mode: lib.jimp.ResizeStrategy.BILINEAR }).getBuffer('image/jpeg', { quality: 50 });
                return [3 /*break*/, 9];
            case 8: throw new boom_1.Boom('No image processing library available');
            case 9:
                _d = {};
                return [4 /*yield*/, img];
            case 10: return [2 /*return*/, (_d.img = _g.sent(),
                    _d)];
        }
    });
}); };
exports.generateProfilePicture = generateProfilePicture;
/** gets the SHA256 of the given media message */
var mediaMessageSHA256B64 = function (message) {
    var media = Object.values(message)[0];
    return (media === null || media === void 0 ? void 0 : media.fileSha256) && Buffer.from(media.fileSha256).toString('base64');
};
exports.mediaMessageSHA256B64 = mediaMessageSHA256B64;
function getAudioDuration(buffer) {
    return __awaiter(this, void 0, void 0, function () {
        var musicMetadata, metadata, options;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('music-metadata'); })];
                case 1:
                    musicMetadata = _a.sent();
                    options = {
                        duration: true
                    };
                    if (!Buffer.isBuffer(buffer)) return [3 /*break*/, 3];
                    return [4 /*yield*/, musicMetadata.parseBuffer(buffer, undefined, options)];
                case 2:
                    metadata = _a.sent();
                    return [3 /*break*/, 7];
                case 3:
                    if (!(typeof buffer === 'string')) return [3 /*break*/, 5];
                    return [4 /*yield*/, musicMetadata.parseFile(buffer, options)];
                case 4:
                    metadata = _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, musicMetadata.parseStream(buffer, undefined, options)];
                case 6:
                    metadata = _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, metadata.format.duration];
            }
        });
    });
}
/**
  referenced from and modifying https://github.com/wppconnect-team/wa-js/blob/main/src/chat/functions/prepareAudioWaveform.ts
 */
function getAudioWaveform(buffer, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var decoder, audioData, rStream, audioBuffer, rawData, samples, blockSize, filteredData, i, blockStart, sum, j, multiplier_1, normalizedData, waveform, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('audio-decode'); })];
                case 1:
                    decoder = (_a.sent()).default;
                    audioData = void 0;
                    if (!Buffer.isBuffer(buffer)) return [3 /*break*/, 2];
                    audioData = buffer;
                    return [3 /*break*/, 6];
                case 2:
                    if (!(typeof buffer === 'string')) return [3 /*break*/, 4];
                    rStream = (0, fs_1.createReadStream)(buffer);
                    return [4 /*yield*/, (0, exports.toBuffer)(rStream)];
                case 3:
                    audioData = _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, exports.toBuffer)(buffer)];
                case 5:
                    audioData = _a.sent();
                    _a.label = 6;
                case 6: return [4 /*yield*/, decoder(audioData)];
                case 7:
                    audioBuffer = _a.sent();
                    rawData = audioBuffer.getChannelData(0) // We only need to work with one channel of data
                    ;
                    samples = 64 // Number of samples we want to have in our final data set
                    ;
                    blockSize = Math.floor(rawData.length / samples) // the number of samples in each subdivision
                    ;
                    filteredData = [];
                    for (i = 0; i < samples; i++) {
                        blockStart = blockSize * i // the location of the first sample in the block
                        ;
                        sum = 0;
                        for (j = 0; j < blockSize; j++) {
                            sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
                        }
                        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
                    }
                    multiplier_1 = Math.pow(Math.max.apply(Math, filteredData), -1);
                    normalizedData = filteredData.map(function (n) { return n * multiplier_1; });
                    waveform = new Uint8Array(normalizedData.map(function (n) { return Math.floor(100 * n); }));
                    return [2 /*return*/, waveform];
                case 8:
                    e_2 = _a.sent();
                    logger === null || logger === void 0 ? void 0 : logger.debug('Failed to generate waveform: ' + e_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
var toReadable = function (buffer) {
    var readable = new stream_1.Readable({ read: function () { } });
    readable.push(buffer);
    readable.push(null);
    return readable;
};
exports.toReadable = toReadable;
var toBuffer = function (stream) { return __awaiter(void 0, void 0, void 0, function () {
    var chunks, chunk, e_3_1;
    var _a, stream_3, stream_3_1;
    var _b, e_3, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                chunks = [];
                _e.label = 1;
            case 1:
                _e.trys.push([1, 6, 7, 12]);
                _a = true, stream_3 = __asyncValues(stream);
                _e.label = 2;
            case 2: return [4 /*yield*/, stream_3.next()];
            case 3:
                if (!(stream_3_1 = _e.sent(), _b = stream_3_1.done, !_b)) return [3 /*break*/, 5];
                _d = stream_3_1.value;
                _a = false;
                chunk = _d;
                chunks.push(chunk);
                _e.label = 4;
            case 4:
                _a = true;
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 12];
            case 6:
                e_3_1 = _e.sent();
                e_3 = { error: e_3_1 };
                return [3 /*break*/, 12];
            case 7:
                _e.trys.push([7, , 10, 11]);
                if (!(!_a && !_b && (_c = stream_3.return))) return [3 /*break*/, 9];
                return [4 /*yield*/, _c.call(stream_3)];
            case 8:
                _e.sent();
                _e.label = 9;
            case 9: return [3 /*break*/, 11];
            case 10:
                if (e_3) throw e_3.error;
                return [7 /*endfinally*/];
            case 11: return [7 /*endfinally*/];
            case 12:
                stream.destroy();
                return [2 /*return*/, Buffer.concat(chunks)];
        }
    });
}); };
exports.toBuffer = toBuffer;
var getStream = function (item, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var urlStr, buffer;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (Buffer.isBuffer(item)) {
                    return [2 /*return*/, { stream: (0, exports.toReadable)(item), type: 'buffer' }];
                }
                if ('stream' in item) {
                    return [2 /*return*/, { stream: item.stream, type: 'readable' }];
                }
                urlStr = item.url.toString();
                if (urlStr.startsWith('data:')) {
                    buffer = Buffer.from(urlStr.split(',')[1], 'base64');
                    return [2 /*return*/, { stream: (0, exports.toReadable)(buffer), type: 'buffer' }];
                }
                if (!(urlStr.startsWith('http://') || urlStr.startsWith('https://'))) return [3 /*break*/, 2];
                _a = {};
                return [4 /*yield*/, (0, exports.getHttpStream)(item.url, opts)];
            case 1: return [2 /*return*/, (_a.stream = _b.sent(), _a.type = 'remote', _a)];
            case 2: return [2 /*return*/, { stream: (0, fs_1.createReadStream)(item.url), type: 'file' }];
        }
    });
}); };
exports.getStream = getStream;
/** generates a thumbnail for a given media, if required */
function generateThumbnail(file, mediaType, options) {
    return __awaiter(this, void 0, void 0, function () {
        var thumbnail, originalImageDimensions, _a, buffer, original, imgFilename, buff, err_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(mediaType === 'image')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.extractImageThumb)(file)];
                case 1:
                    _a = _c.sent(), buffer = _a.buffer, original = _a.original;
                    thumbnail = buffer.toString('base64');
                    if (original.width && original.height) {
                        originalImageDimensions = {
                            width: original.width,
                            height: original.height
                        };
                    }
                    return [3 /*break*/, 8];
                case 2:
                    if (!(mediaType === 'video')) return [3 /*break*/, 8];
                    imgFilename = (0, path_1.join)(getTmpFilesDirectory(), (0, generics_1.generateMessageIDV2)() + '.jpg');
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 7, , 8]);
                    return [4 /*yield*/, extractVideoThumb(file, imgFilename, '00:00:00', { width: 32, height: 32 })];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, fs_1.promises.readFile(imgFilename)];
                case 5:
                    buff = _c.sent();
                    thumbnail = buff.toString('base64');
                    return [4 /*yield*/, fs_1.promises.unlink(imgFilename)];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _c.sent();
                    (_b = options.logger) === null || _b === void 0 ? void 0 : _b.debug('could not generate video thumb: ' + err_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, {
                        thumbnail: thumbnail,
                        originalImageDimensions: originalImageDimensions
                    }];
            }
        });
    });
}
var getHttpStream = function (url_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1], args_1, true), void 0, function (url, options) {
        var fetched;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(url.toString(), __assign(__assign({}, options), { responseType: 'stream' }))];
                case 1:
                    fetched = _a.sent();
                    return [2 /*return*/, fetched.data];
            }
        });
    });
};
exports.getHttpStream = getHttpStream;
var encryptedStream = function (media_1, mediaType_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([media_1, mediaType_1], args_1, true), void 0, function (media, mediaType, _a) {
        var _b, stream, type, mediaKey, _c, cipherKey, iv, macKey, encFilePath, encFileWriteStream, originalFileStream, originalFilePath, fileLength, aes, hmac, sha256Plain, sha256Enc, onChunk, _d, stream_4, stream_4_1, data, e_4_1, mac, fileSha256, fileEncSha256, error_2, err_2;
        var _e, e_4, _f, _g;
        var _h, _j;
        var _k = _a === void 0 ? {} : _a, logger = _k.logger, saveOriginalFileIfRequired = _k.saveOriginalFileIfRequired, opts = _k.opts;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0: return [4 /*yield*/, (0, exports.getStream)(media, opts)];
                case 1:
                    _b = _l.sent(), stream = _b.stream, type = _b.type;
                    logger === null || logger === void 0 ? void 0 : logger.debug('fetched media stream');
                    mediaKey = Crypto.randomBytes(32);
                    return [4 /*yield*/, getMediaKeys(mediaKey, mediaType)];
                case 2:
                    _c = _l.sent(), cipherKey = _c.cipherKey, iv = _c.iv, macKey = _c.macKey;
                    encFilePath = (0, path_1.join)(getTmpFilesDirectory(), mediaType + (0, generics_1.generateMessageIDV2)() + '-enc');
                    encFileWriteStream = (0, fs_1.createWriteStream)(encFilePath);
                    if (saveOriginalFileIfRequired) {
                        originalFilePath = (0, path_1.join)(getTmpFilesDirectory(), mediaType + (0, generics_1.generateMessageIDV2)() + '-original');
                        originalFileStream = (0, fs_1.createWriteStream)(originalFilePath);
                    }
                    fileLength = 0;
                    aes = Crypto.createCipheriv('aes-256-cbc', cipherKey, iv);
                    hmac = Crypto.createHmac('sha256', macKey).update(iv);
                    sha256Plain = Crypto.createHash('sha256');
                    sha256Enc = Crypto.createHash('sha256');
                    onChunk = function (buff) {
                        sha256Enc.update(buff);
                        hmac.update(buff);
                        encFileWriteStream.write(buff);
                    };
                    _l.label = 3;
                case 3:
                    _l.trys.push([3, 18, , 25]);
                    _l.label = 4;
                case 4:
                    _l.trys.push([4, 11, 12, 17]);
                    _d = true, stream_4 = __asyncValues(stream);
                    _l.label = 5;
                case 5: return [4 /*yield*/, stream_4.next()];
                case 6:
                    if (!(stream_4_1 = _l.sent(), _e = stream_4_1.done, !_e)) return [3 /*break*/, 10];
                    _g = stream_4_1.value;
                    _d = false;
                    data = _g;
                    fileLength += data.length;
                    if (type === 'remote' && (opts === null || opts === void 0 ? void 0 : opts.maxContentLength) && fileLength + data.length > opts.maxContentLength) {
                        throw new boom_1.Boom("content length exceeded when encrypting \"".concat(type, "\""), {
                            data: { media: media, type: type }
                        });
                    }
                    if (!originalFileStream) return [3 /*break*/, 8];
                    if (!!originalFileStream.write(data)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, events_1.once)(originalFileStream, 'drain')];
                case 7:
                    _l.sent();
                    _l.label = 8;
                case 8:
                    sha256Plain.update(data);
                    onChunk(aes.update(data));
                    _l.label = 9;
                case 9:
                    _d = true;
                    return [3 /*break*/, 5];
                case 10: return [3 /*break*/, 17];
                case 11:
                    e_4_1 = _l.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 17];
                case 12:
                    _l.trys.push([12, , 15, 16]);
                    if (!(!_d && !_e && (_f = stream_4.return))) return [3 /*break*/, 14];
                    return [4 /*yield*/, _f.call(stream_4)];
                case 13:
                    _l.sent();
                    _l.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    if (e_4) throw e_4.error;
                    return [7 /*endfinally*/];
                case 16: return [7 /*endfinally*/];
                case 17:
                    onChunk(aes.final());
                    mac = hmac.digest().slice(0, 10);
                    sha256Enc.update(mac);
                    fileSha256 = sha256Plain.digest();
                    fileEncSha256 = sha256Enc.digest();
                    encFileWriteStream.write(mac);
                    encFileWriteStream.end();
                    (_h = originalFileStream === null || originalFileStream === void 0 ? void 0 : originalFileStream.end) === null || _h === void 0 ? void 0 : _h.call(originalFileStream);
                    stream.destroy();
                    logger === null || logger === void 0 ? void 0 : logger.debug('encrypted data successfully');
                    return [2 /*return*/, {
                            mediaKey: mediaKey,
                            originalFilePath: originalFilePath,
                            encFilePath: encFilePath,
                            mac: mac,
                            fileEncSha256: fileEncSha256,
                            fileSha256: fileSha256,
                            fileLength: fileLength
                        }];
                case 18:
                    error_2 = _l.sent();
                    // destroy all streams with error
                    encFileWriteStream.destroy();
                    (_j = originalFileStream === null || originalFileStream === void 0 ? void 0 : originalFileStream.destroy) === null || _j === void 0 ? void 0 : _j.call(originalFileStream);
                    aes.destroy();
                    hmac.destroy();
                    sha256Plain.destroy();
                    sha256Enc.destroy();
                    stream.destroy();
                    _l.label = 19;
                case 19:
                    _l.trys.push([19, 23, , 24]);
                    return [4 /*yield*/, fs_1.promises.unlink(encFilePath)];
                case 20:
                    _l.sent();
                    if (!originalFilePath) return [3 /*break*/, 22];
                    return [4 /*yield*/, fs_1.promises.unlink(originalFilePath)];
                case 21:
                    _l.sent();
                    _l.label = 22;
                case 22: return [3 /*break*/, 24];
                case 23:
                    err_2 = _l.sent();
                    logger === null || logger === void 0 ? void 0 : logger.error({ err: err_2 }, 'failed deleting tmp files');
                    return [3 /*break*/, 24];
                case 24: throw error_2;
                case 25: return [2 /*return*/];
            }
        });
    });
};
exports.encryptedStream = encryptedStream;
var DEF_HOST = 'mmg.whatsapp.net';
var AES_CHUNK_SIZE = 16;
var toSmallestChunkSize = function (num) {
    return Math.floor(num / AES_CHUNK_SIZE) * AES_CHUNK_SIZE;
};
var getUrlFromDirectPath = function (directPath) { return "https://".concat(DEF_HOST).concat(directPath); };
exports.getUrlFromDirectPath = getUrlFromDirectPath;
var downloadContentFromMessage = function (_a, type_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([_a, type_1], args_1, true), void 0, function (_b, type, opts) {
        var isValidMediaUrl, downloadUrl, keys;
        var mediaKey = _b.mediaKey, directPath = _b.directPath, url = _b.url;
        if (opts === void 0) { opts = {}; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    isValidMediaUrl = url === null || url === void 0 ? void 0 : url.startsWith('https://mmg.whatsapp.net/');
                    downloadUrl = isValidMediaUrl ? url : (0, exports.getUrlFromDirectPath)(directPath);
                    if (!downloadUrl) {
                        throw new boom_1.Boom('No valid media URL or directPath present in message', { statusCode: 400 });
                    }
                    return [4 /*yield*/, getMediaKeys(mediaKey, type)];
                case 1:
                    keys = _c.sent();
                    return [2 /*return*/, (0, exports.downloadEncryptedContent)(downloadUrl, keys, opts)];
            }
        });
    });
};
exports.downloadContentFromMessage = downloadContentFromMessage;
/**
 * Decrypts and downloads an AES256-CBC encrypted file given the keys.
 * Assumes the SHA256 of the plaintext is appended to the end of the ciphertext
 * */
var downloadEncryptedContent = function (downloadUrl_1, _a) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([downloadUrl_1, _a], args_1, true), void 0, function (downloadUrl, _b, _c) {
        var bytesFetched, startChunk, firstBlockIsIV, chunk, endChunk, headers, fetched, remainingBytes, aes, pushBytes, output;
        var cipherKey = _b.cipherKey, iv = _b.iv;
        var _d = _c === void 0 ? {} : _c, startByte = _d.startByte, endByte = _d.endByte, options = _d.options;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    bytesFetched = 0;
                    startChunk = 0;
                    firstBlockIsIV = false;
                    // if a start byte is specified -- then we need to fetch the previous chunk as that will form the IV
                    if (startByte) {
                        chunk = toSmallestChunkSize(startByte || 0);
                        if (chunk) {
                            startChunk = chunk - AES_CHUNK_SIZE;
                            bytesFetched = chunk;
                            firstBlockIsIV = true;
                        }
                    }
                    endChunk = endByte ? toSmallestChunkSize(endByte || 0) + AES_CHUNK_SIZE : undefined;
                    headers = __assign(__assign({}, ((options === null || options === void 0 ? void 0 : options.headers) || {})), { Origin: Defaults_1.DEFAULT_ORIGIN });
                    if (startChunk || endChunk) {
                        headers.Range = "bytes=".concat(startChunk, "-");
                        if (endChunk) {
                            headers.Range += endChunk;
                        }
                    }
                    return [4 /*yield*/, (0, exports.getHttpStream)(downloadUrl, __assign(__assign({}, (options || {})), { headers: headers, maxBodyLength: Infinity, maxContentLength: Infinity }))];
                case 1:
                    fetched = _e.sent();
                    remainingBytes = Buffer.from([]);
                    pushBytes = function (bytes, push) {
                        if (startByte || endByte) {
                            var start = bytesFetched >= startByte ? undefined : Math.max(startByte - bytesFetched, 0);
                            var end = bytesFetched + bytes.length < endByte ? undefined : Math.max(endByte - bytesFetched, 0);
                            push(bytes.slice(start, end));
                            bytesFetched += bytes.length;
                        }
                        else {
                            push(bytes);
                        }
                    };
                    output = new stream_1.Transform({
                        transform: function (chunk, _, callback) {
                            var _this = this;
                            var data = Buffer.concat([remainingBytes, chunk]);
                            var decryptLength = toSmallestChunkSize(data.length);
                            remainingBytes = data.slice(decryptLength);
                            data = data.slice(0, decryptLength);
                            if (!aes) {
                                var ivValue = iv;
                                if (firstBlockIsIV) {
                                    ivValue = data.slice(0, AES_CHUNK_SIZE);
                                    data = data.slice(AES_CHUNK_SIZE);
                                }
                                aes = Crypto.createDecipheriv('aes-256-cbc', cipherKey, ivValue);
                                // if an end byte that is not EOF is specified
                                // stop auto padding (PKCS7) -- otherwise throws an error for decryption
                                if (endByte) {
                                    aes.setAutoPadding(false);
                                }
                            }
                            try {
                                pushBytes(aes.update(data), function (b) { return _this.push(b); });
                                callback();
                            }
                            catch (error) {
                                callback(error);
                            }
                        },
                        final: function (callback) {
                            var _this = this;
                            try {
                                pushBytes(aes.final(), function (b) { return _this.push(b); });
                                callback();
                            }
                            catch (error) {
                                callback(error);
                            }
                        }
                    });
                    return [2 /*return*/, fetched.pipe(output, { end: true })];
            }
        });
    });
};
exports.downloadEncryptedContent = downloadEncryptedContent;
function extensionForMediaMessage(message) {
    var getExtension = function (mimetype) { var _a; return (_a = mimetype.split(';')[0]) === null || _a === void 0 ? void 0 : _a.split('/')[1]; };
    var type = Object.keys(message)[0];
    var extension;
    if (type === 'locationMessage' || type === 'liveLocationMessage' || type === 'productMessage') {
        extension = '.jpeg';
    }
    else {
        var messageContent = message[type];
        extension = getExtension(messageContent.mimetype);
    }
    return extension;
}
var getWAUploadToServer = function (_a, refreshMediaConn) {
    var customUploadHosts = _a.customUploadHosts, fetchAgent = _a.fetchAgent, logger = _a.logger, options = _a.options;
    return function (filePath_1, _a) { return __awaiter(void 0, [filePath_1, _a], void 0, function (filePath, _b) {
        var uploadInfo, urls, hosts, _i, hosts_1, hostname, auth, url, result, body, error_3, isLast;
        var _c, _d;
        var mediaType = _b.mediaType, fileEncSha256B64 = _b.fileEncSha256B64, timeoutMs = _b.timeoutMs;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, refreshMediaConn(false)];
                case 1:
                    uploadInfo = _e.sent();
                    hosts = __spreadArray(__spreadArray([], customUploadHosts, true), uploadInfo.hosts, true);
                    fileEncSha256B64 = (0, exports.encodeBase64EncodedStringForUpload)(fileEncSha256B64);
                    _i = 0, hosts_1 = hosts;
                    _e.label = 2;
                case 2:
                    if (!(_i < hosts_1.length)) return [3 /*break*/, 10];
                    hostname = hosts_1[_i].hostname;
                    logger.debug("uploading to \"".concat(hostname, "\""));
                    auth = encodeURIComponent(uploadInfo.auth) // the auth token
                    ;
                    url = "https://".concat(hostname).concat(Defaults_1.MEDIA_PATH_MAP[mediaType], "/").concat(fileEncSha256B64, "?auth=").concat(auth, "&token=").concat(fileEncSha256B64);
                    result = void 0;
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 8, , 9]);
                    return [4 /*yield*/, axios_1.default.post(url, (0, fs_1.createReadStream)(filePath), __assign(__assign({}, options), { maxRedirects: 0, headers: __assign(__assign({}, (options.headers || {})), { 'Content-Type': 'application/octet-stream', Origin: Defaults_1.DEFAULT_ORIGIN }), httpsAgent: fetchAgent, timeout: timeoutMs, responseType: 'json', maxBodyLength: Infinity, maxContentLength: Infinity }))];
                case 4:
                    body = _e.sent();
                    result = body.data;
                    if (!((result === null || result === void 0 ? void 0 : result.url) || (result === null || result === void 0 ? void 0 : result.directPath))) return [3 /*break*/, 5];
                    urls = {
                        mediaUrl: result.url,
                        directPath: result.direct_path
                    };
                    return [3 /*break*/, 10];
                case 5: return [4 /*yield*/, refreshMediaConn(true)];
                case 6:
                    uploadInfo = _e.sent();
                    throw new Error("upload failed, reason: ".concat(JSON.stringify(result)));
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_3 = _e.sent();
                    if (axios_1.default.isAxiosError(error_3)) {
                        result = (_c = error_3.response) === null || _c === void 0 ? void 0 : _c.data;
                    }
                    isLast = hostname === ((_d = hosts[uploadInfo.hosts.length - 1]) === null || _d === void 0 ? void 0 : _d.hostname);
                    logger.warn({ trace: error_3.stack, uploadResult: result }, "Error in uploading to ".concat(hostname, " ").concat(isLast ? '' : ', retrying...'));
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10:
                    if (!urls) {
                        throw new boom_1.Boom('Media upload failed on all hosts', { statusCode: 500 });
                    }
                    return [2 /*return*/, urls];
            }
        });
    }); };
};
exports.getWAUploadToServer = getWAUploadToServer;
var getMediaRetryKey = function (mediaKey) {
    return (0, crypto_1.hkdf)(mediaKey, 32, { info: 'WhatsApp Media Retry Notification' });
};
/**
 * Generate a binary node that will request the phone to re-upload the media & return the newly uploaded URL
 */
var encryptMediaRetryRequest = function (key, mediaKey, meId) { return __awaiter(void 0, void 0, void 0, function () {
    var recp, recpBuffer, iv, retryKey, ciphertext, req;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                recp = { stanzaId: key.id };
                recpBuffer = index_js_1.proto.ServerErrorReceipt.encode(recp).finish();
                iv = Crypto.randomBytes(12);
                return [4 /*yield*/, getMediaRetryKey(mediaKey)];
            case 1:
                retryKey = _a.sent();
                ciphertext = (0, crypto_1.aesEncryptGCM)(recpBuffer, retryKey, iv, Buffer.from(key.id));
                req = {
                    tag: 'receipt',
                    attrs: {
                        id: key.id,
                        to: (0, WABinary_1.jidNormalizedUser)(meId),
                        type: 'server-error'
                    },
                    content: [
                        // this encrypt node is actually pretty useless
                        // the media is returned even without this node
                        // keeping it here to maintain parity with WA Web
                        {
                            tag: 'encrypt',
                            attrs: {},
                            content: [
                                { tag: 'enc_p', attrs: {}, content: ciphertext },
                                { tag: 'enc_iv', attrs: {}, content: iv }
                            ]
                        },
                        {
                            tag: 'rmr',
                            attrs: {
                                jid: key.remoteJid,
                                from_me: (!!key.fromMe).toString(),
                                // @ts-ignore
                                participant: key.participant || undefined
                            }
                        }
                    ]
                };
                return [2 /*return*/, req];
        }
    });
}); };
exports.encryptMediaRetryRequest = encryptMediaRetryRequest;
var decodeMediaRetryNode = function (node) {
    var rmrNode = (0, WABinary_1.getBinaryNodeChild)(node, 'rmr');
    var event = {
        key: {
            id: node.attrs.id,
            remoteJid: rmrNode.attrs.jid,
            fromMe: rmrNode.attrs.from_me === 'true',
            participant: rmrNode.attrs.participant
        }
    };
    var errorNode = (0, WABinary_1.getBinaryNodeChild)(node, 'error');
    if (errorNode) {
        var errorCode = +errorNode.attrs.code;
        event.error = new boom_1.Boom("Failed to re-upload media (".concat(errorCode, ")"), {
            data: errorNode.attrs,
            statusCode: (0, exports.getStatusCodeForMediaRetry)(errorCode)
        });
    }
    else {
        var encryptedInfoNode = (0, WABinary_1.getBinaryNodeChild)(node, 'encrypt');
        var ciphertext = (0, WABinary_1.getBinaryNodeChildBuffer)(encryptedInfoNode, 'enc_p');
        var iv = (0, WABinary_1.getBinaryNodeChildBuffer)(encryptedInfoNode, 'enc_iv');
        if (ciphertext && iv) {
            event.media = { ciphertext: ciphertext, iv: iv };
        }
        else {
            event.error = new boom_1.Boom('Failed to re-upload media (missing ciphertext)', { statusCode: 404 });
        }
    }
    return event;
};
exports.decodeMediaRetryNode = decodeMediaRetryNode;
var decryptMediaRetryData = function (_a, mediaKey_1, msgId_1) { return __awaiter(void 0, [_a, mediaKey_1, msgId_1], void 0, function (_b, mediaKey, msgId) {
    var retryKey, plaintext;
    var ciphertext = _b.ciphertext, iv = _b.iv;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, getMediaRetryKey(mediaKey)];
            case 1:
                retryKey = _c.sent();
                plaintext = (0, crypto_1.aesDecryptGCM)(ciphertext, retryKey, iv, Buffer.from(msgId));
                return [2 /*return*/, index_js_1.proto.MediaRetryNotification.decode(plaintext)];
        }
    });
}); };
exports.decryptMediaRetryData = decryptMediaRetryData;
var getStatusCodeForMediaRetry = function (code) {
    return MEDIA_RETRY_STATUS_MAP[code];
};
exports.getStatusCodeForMediaRetry = getStatusCodeForMediaRetry;
var MEDIA_RETRY_STATUS_MAP = (_a = {},
    _a[index_js_1.proto.MediaRetryNotification.ResultType.SUCCESS] = 200,
    _a[index_js_1.proto.MediaRetryNotification.ResultType.DECRYPTION_ERROR] = 412,
    _a[index_js_1.proto.MediaRetryNotification.ResultType.NOT_FOUND] = 404,
    _a[index_js_1.proto.MediaRetryNotification.ResultType.GENERAL_ERROR] = 418,
    _a);
//# sourceMappingURL=messages-media.js.map