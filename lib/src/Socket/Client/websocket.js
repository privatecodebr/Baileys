"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.WebSocketClient = void 0;
var ws_1 = require("ws");
var Defaults_1 = require("../../Defaults/index.js");
var types_1 = require("./types.js");
var WebSocketClient = /** @class */ (function (_super) {
    __extends(WebSocketClient, _super);
    function WebSocketClient() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.socket = null;
        return _this;
    }
    Object.defineProperty(WebSocketClient.prototype, "isOpen", {
        get: function () {
            var _a;
            return ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.OPEN;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebSocketClient.prototype, "isClosed", {
        get: function () {
            var _a;
            return this.socket === null || ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.CLOSED;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebSocketClient.prototype, "isClosing", {
        get: function () {
            var _a;
            return this.socket === null || ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.CLOSING;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebSocketClient.prototype, "isConnecting", {
        get: function () {
            var _a;
            return ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.CONNECTING;
        },
        enumerable: false,
        configurable: true
    });
    WebSocketClient.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var events, _loop_1, this_1, _i, events_1, event_1;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                if (this.socket) {
                    return [2 /*return*/];
                }
                this.socket = new ws_1.default(this.url, {
                    origin: Defaults_1.DEFAULT_ORIGIN,
                    headers: (_a = this.config.options) === null || _a === void 0 ? void 0 : _a.headers,
                    handshakeTimeout: this.config.connectTimeoutMs,
                    timeout: this.config.connectTimeoutMs,
                    agent: this.config.agent
                });
                this.socket.setMaxListeners(0);
                events = ['close', 'error', 'upgrade', 'message', 'open', 'ping', 'pong', 'unexpected-response'];
                _loop_1 = function (event_1) {
                    (_b = this_1.socket) === null || _b === void 0 ? void 0 : _b.on(event_1, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return _this.emit.apply(_this, __spreadArray([event_1], args, false));
                    });
                };
                this_1 = this;
                for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                    event_1 = events_1[_i];
                    _loop_1(event_1);
                }
                return [2 /*return*/];
            });
        });
    };
    WebSocketClient.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.socket) {
                    return [2 /*return*/];
                }
                this.socket.close();
                this.socket = null;
                return [2 /*return*/];
            });
        });
    };
    WebSocketClient.prototype.send = function (str, cb) {
        var _a;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(str, cb);
        return Boolean(this.socket);
    };
    return WebSocketClient;
}(types_1.AbstractSocketClient));
exports.WebSocketClient = WebSocketClient;
//# sourceMappingURL=websocket.js.map