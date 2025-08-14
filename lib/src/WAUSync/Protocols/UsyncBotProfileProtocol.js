"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncBotProfileProtocol = void 0;
var WABinary_1 = require("../../WABinary/index.js");
var USyncBotProfileProtocol = /** @class */ (function () {
    function USyncBotProfileProtocol() {
        this.name = 'bot';
    }
    USyncBotProfileProtocol.prototype.getQueryElement = function () {
        return {
            tag: 'bot',
            attrs: {},
            content: [{ tag: 'profile', attrs: { v: '1' } }]
        };
    };
    USyncBotProfileProtocol.prototype.getUserElement = function (user) {
        return {
            tag: 'bot',
            attrs: {},
            content: [{ tag: 'profile', attrs: { persona_id: user.personaId } }]
        };
    };
    USyncBotProfileProtocol.prototype.parser = function (node) {
        var botNode = (0, WABinary_1.getBinaryNodeChild)(node, 'bot');
        var profile = (0, WABinary_1.getBinaryNodeChild)(botNode, 'profile');
        var commandsNode = (0, WABinary_1.getBinaryNodeChild)(profile, 'commands');
        var promptsNode = (0, WABinary_1.getBinaryNodeChild)(profile, 'prompts');
        var commands = [];
        var prompts = [];
        for (var _i = 0, _a = (0, WABinary_1.getBinaryNodeChildren)(commandsNode, 'command'); _i < _a.length; _i++) {
            var command = _a[_i];
            commands.push({
                name: (0, WABinary_1.getBinaryNodeChildString)(command, 'name'),
                description: (0, WABinary_1.getBinaryNodeChildString)(command, 'description')
            });
        }
        for (var _b = 0, _c = (0, WABinary_1.getBinaryNodeChildren)(promptsNode, 'prompt'); _b < _c.length; _b++) {
            var prompt_1 = _c[_b];
            prompts.push("".concat((0, WABinary_1.getBinaryNodeChildString)(prompt_1, 'emoji'), " ").concat((0, WABinary_1.getBinaryNodeChildString)(prompt_1, 'text')));
        }
        return {
            isDefault: !!(0, WABinary_1.getBinaryNodeChild)(profile, 'default'),
            jid: node.attrs.jid,
            name: (0, WABinary_1.getBinaryNodeChildString)(profile, 'name'),
            attributes: (0, WABinary_1.getBinaryNodeChildString)(profile, 'attributes'),
            description: (0, WABinary_1.getBinaryNodeChildString)(profile, 'description'),
            category: (0, WABinary_1.getBinaryNodeChildString)(profile, 'category'),
            personaId: profile.attrs['persona_id'],
            commandsDescription: (0, WABinary_1.getBinaryNodeChildString)(commandsNode, 'description'),
            commands: commands,
            prompts: prompts
        };
    };
    return USyncBotProfileProtocol;
}());
exports.USyncBotProfileProtocol = USyncBotProfileProtocol;
//# sourceMappingURL=UsyncBotProfileProtocol.js.map