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
exports.GroupSessionBuilder = void 0;
var keyhelper = require("./keyhelper.js");
var sender_key_distribution_message_1 = require("./sender-key-distribution-message.js");
var GroupSessionBuilder = /** @class */ (function () {
    function GroupSessionBuilder(senderKeyStore) {
        this.senderKeyStore = senderKeyStore;
    }
    GroupSessionBuilder.prototype.process = function (senderKeyName, senderKeyDistributionMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var senderKeyRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.senderKeyStore.loadSenderKey(senderKeyName)];
                    case 1:
                        senderKeyRecord = _a.sent();
                        senderKeyRecord.addSenderKeyState(senderKeyDistributionMessage.getId(), senderKeyDistributionMessage.getIteration(), senderKeyDistributionMessage.getChainKey(), senderKeyDistributionMessage.getSignatureKey());
                        return [4 /*yield*/, this.senderKeyStore.storeSenderKey(senderKeyName, senderKeyRecord)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GroupSessionBuilder.prototype.create = function (senderKeyName) {
        return __awaiter(this, void 0, void 0, function () {
            var senderKeyRecord, keyId, senderKey, signingKey, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.senderKeyStore.loadSenderKey(senderKeyName)];
                    case 1:
                        senderKeyRecord = _a.sent();
                        if (!senderKeyRecord.isEmpty()) return [3 /*break*/, 3];
                        keyId = keyhelper.generateSenderKeyId();
                        senderKey = keyhelper.generateSenderKey();
                        signingKey = keyhelper.generateSenderSigningKey();
                        senderKeyRecord.setSenderKeyState(keyId, 0, senderKey, signingKey);
                        return [4 /*yield*/, this.senderKeyStore.storeSenderKey(senderKeyName, senderKeyRecord)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        state = senderKeyRecord.getSenderKeyState();
                        if (!state) {
                            throw new Error('No session state available');
                        }
                        return [2 /*return*/, new sender_key_distribution_message_1.SenderKeyDistributionMessage(state.getKeyId(), state.getSenderChainKey().getIteration(), state.getSenderChainKey().getSeed(), state.getSigningKeyPublic())];
                }
            });
        });
    };
    return GroupSessionBuilder;
}());
exports.GroupSessionBuilder = GroupSessionBuilder;
//# sourceMappingURL=group-session-builder.js.map