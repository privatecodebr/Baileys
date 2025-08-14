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
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncQuery = void 0;
var WABinary_1 = require("../WABinary/index.js");
var UsyncBotProfileProtocol_1 = require("./Protocols/UsyncBotProfileProtocol.js");
var UsyncLIDProtocol_1 = require("./Protocols/UsyncLIDProtocol.js");
var Protocols_1 = require("./Protocols/index.js");
var USyncQuery = /** @class */ (function () {
    function USyncQuery() {
        this.protocols = [];
        this.users = [];
        this.context = 'interactive';
        this.mode = 'query';
    }
    USyncQuery.prototype.withMode = function (mode) {
        this.mode = mode;
        return this;
    };
    USyncQuery.prototype.withContext = function (context) {
        this.context = context;
        return this;
    };
    USyncQuery.prototype.withUser = function (user) {
        this.users.push(user);
        return this;
    };
    USyncQuery.prototype.parseUSyncQueryResult = function (result) {
        if (result.attrs.type !== 'result') {
            return;
        }
        var protocolMap = Object.fromEntries(this.protocols.map(function (protocol) {
            return [protocol.name, protocol.parser];
        }));
        var queryResult = {
            // TODO: implement errors etc.
            list: [],
            sideList: []
        };
        var usyncNode = (0, WABinary_1.getBinaryNodeChild)(result, 'usync');
        //TODO: implement error backoff, refresh etc.
        //TODO: see if there are any errors in the result node
        //const resultNode = getBinaryNodeChild(usyncNode, 'result')
        var listNode = (0, WABinary_1.getBinaryNodeChild)(usyncNode, 'list');
        if (Array.isArray(listNode === null || listNode === void 0 ? void 0 : listNode.content) && typeof listNode !== 'undefined') {
            queryResult.list = listNode.content.map(function (node) {
                var id = node === null || node === void 0 ? void 0 : node.attrs.jid;
                var data = Array.isArray(node === null || node === void 0 ? void 0 : node.content)
                    ? Object.fromEntries(node.content
                        .map(function (content) {
                        var protocol = content.tag;
                        var parser = protocolMap[protocol];
                        if (parser) {
                            return [protocol, parser(content)];
                        }
                        else {
                            return [protocol, null];
                        }
                    })
                        .filter(function (_a) {
                        var b = _a[1];
                        return b !== null;
                    }))
                    : {};
                return __assign(__assign({}, data), { id: id });
            });
        }
        //TODO: implement side list
        //const sideListNode = getBinaryNodeChild(usyncNode, 'side_list')
        return queryResult;
    };
    USyncQuery.prototype.withDeviceProtocol = function () {
        this.protocols.push(new Protocols_1.USyncDeviceProtocol());
        return this;
    };
    USyncQuery.prototype.withContactProtocol = function () {
        this.protocols.push(new Protocols_1.USyncContactProtocol());
        return this;
    };
    USyncQuery.prototype.withStatusProtocol = function () {
        this.protocols.push(new Protocols_1.USyncStatusProtocol());
        return this;
    };
    USyncQuery.prototype.withDisappearingModeProtocol = function () {
        this.protocols.push(new Protocols_1.USyncDisappearingModeProtocol());
        return this;
    };
    USyncQuery.prototype.withBotProfileProtocol = function () {
        this.protocols.push(new UsyncBotProfileProtocol_1.USyncBotProfileProtocol());
        return this;
    };
    USyncQuery.prototype.withLIDProtocol = function () {
        this.protocols.push(new UsyncLIDProtocol_1.USyncLIDProtocol());
        return this;
    };
    return USyncQuery;
}());
exports.USyncQuery = USyncQuery;
//# sourceMappingURL=USyncQuery.js.map