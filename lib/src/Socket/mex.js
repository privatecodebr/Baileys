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
exports.executeWMexQuery = void 0;
var boom_1 = require("@hapi/boom");
var WABinary_1 = require("../WABinary/index.js");
var wMexQuery = function (variables, queryId, query, generateMessageTag) {
    return query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type: 'get',
            to: WABinary_1.S_WHATSAPP_NET,
            xmlns: 'w:mex'
        },
        content: [
            {
                tag: 'query',
                attrs: { query_id: queryId },
                content: Buffer.from(JSON.stringify({ variables: variables }), 'utf-8')
            }
        ]
    });
};
var executeWMexQuery = function (variables, queryId, dataPath, query, generateMessageTag) { return __awaiter(void 0, void 0, void 0, function () {
    var result, child, data, errorMessages, firstError, errorCode, response, action;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, wMexQuery(variables, queryId, query, generateMessageTag)];
            case 1:
                result = _c.sent();
                child = (0, WABinary_1.getBinaryNodeChild)(result, 'result');
                if (child === null || child === void 0 ? void 0 : child.content) {
                    data = JSON.parse(child.content.toString());
                    if (data.errors && data.errors.length > 0) {
                        errorMessages = data.errors.map(function (err) { return err.message || 'Unknown error'; }).join(', ');
                        firstError = data.errors[0];
                        errorCode = ((_a = firstError.extensions) === null || _a === void 0 ? void 0 : _a.error_code) || 400;
                        throw new boom_1.Boom("GraphQL server error: ".concat(errorMessages), { statusCode: errorCode, data: firstError });
                    }
                    response = dataPath ? (_b = data === null || data === void 0 ? void 0 : data.data) === null || _b === void 0 ? void 0 : _b[dataPath] : data === null || data === void 0 ? void 0 : data.data;
                    if (typeof response !== 'undefined') {
                        return [2 /*return*/, response];
                    }
                }
                action = (dataPath || '').startsWith('xwa2_')
                    ? dataPath.substring(5).replace(/_/g, ' ')
                    : dataPath === null || dataPath === void 0 ? void 0 : dataPath.replace(/_/g, ' ');
                throw new boom_1.Boom("Failed to ".concat(action, ", unexpected response structure."), { statusCode: 400, data: result });
        }
    });
}); };
exports.executeWMexQuery = executeWMexQuery;
//# sourceMappingURL=mex.js.map