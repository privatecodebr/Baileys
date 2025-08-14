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
var Defaults_1 = require("../Defaults/index.js");
var communities_1 = require("./communities.js");
// export the last socket layer
var makeWASocket = function (config) {
    var newConfig = __assign(__assign({}, Defaults_1.DEFAULT_CONNECTION_CONFIG), config);
    // If the user hasn't provided their own history sync function,
    // let's create a default one that respects the syncFullHistory flag.
    if (config.shouldSyncHistoryMessage === undefined) {
        newConfig.shouldSyncHistoryMessage = function () { return !!newConfig.syncFullHistory; };
    }
    return (0, communities_1.makeCommunitiesSocket)(newConfig);
};
exports.default = makeWASocket;
//# sourceMappingURL=index.js.map