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
exports.LT_HASH_ANTI_TAMPERING = void 0;
var crypto_1 = require("./crypto.js");
/**
 * LT Hash is a summation based hash algorithm that maintains the integrity of a piece of data
 * over a series of mutations. You can add/remove mutations and it'll return a hash equal to
 * if the same series of mutations was made sequentially.
 */
var o = 128;
var LTHash = /** @class */ (function () {
    function LTHash(e) {
        this.salt = e;
    }
    LTHash.prototype.add = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, t_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, t_1 = t;
                        _a.label = 1;
                    case 1:
                        if (!(_i < t_1.length)) return [3 /*break*/, 4];
                        item = t_1[_i];
                        return [4 /*yield*/, this._addSingle(e, item)];
                    case 2:
                        e = _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, e];
                }
            });
        });
    };
    LTHash.prototype.subtract = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, t_2, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, t_2 = t;
                        _a.label = 1;
                    case 1:
                        if (!(_i < t_2.length)) return [3 /*break*/, 4];
                        item = t_2[_i];
                        return [4 /*yield*/, this._subtractSingle(e, item)];
                    case 2:
                        e = _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, e];
                }
            });
        });
    };
    LTHash.prototype.subtractThenAdd = function (e, addList, subtractList) {
        return __awaiter(this, void 0, void 0, function () {
            var subtracted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.subtract(e, subtractList)];
                    case 1:
                        subtracted = _a.sent();
                        return [2 /*return*/, this.add(subtracted, addList)];
                }
            });
        });
    };
    LTHash.prototype._addSingle = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var derived, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Uint8Array.bind;
                        return [4 /*yield*/, (0, crypto_1.hkdf)(Buffer.from(t), o, { info: this.salt })];
                    case 1:
                        derived = new (_a.apply(Uint8Array, [void 0, _b.sent()]))().buffer;
                        return [2 /*return*/, this.performPointwiseWithOverflow(e, derived, function (a, b) { return a + b; })];
                }
            });
        });
    };
    LTHash.prototype._subtractSingle = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var derived, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Uint8Array.bind;
                        return [4 /*yield*/, (0, crypto_1.hkdf)(Buffer.from(t), o, { info: this.salt })];
                    case 1:
                        derived = new (_a.apply(Uint8Array, [void 0, _b.sent()]))().buffer;
                        return [2 /*return*/, this.performPointwiseWithOverflow(e, derived, function (a, b) { return a - b; })];
                }
            });
        });
    };
    LTHash.prototype.performPointwiseWithOverflow = function (e, t, op) {
        var n = new DataView(e);
        var i = new DataView(t);
        var out = new ArrayBuffer(n.byteLength);
        var s = new DataView(out);
        for (var offset = 0; offset < n.byteLength; offset += 2) {
            s.setUint16(offset, op(n.getUint16(offset, true), i.getUint16(offset, true)), true);
        }
        return out;
    };
    return LTHash;
}());
exports.LT_HASH_ANTI_TAMPERING = new LTHash('WhatsApp Patch Integrity');
//# sourceMappingURL=lt-hash.js.map