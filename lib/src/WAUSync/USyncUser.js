"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USyncUser = void 0;
var USyncUser = /** @class */ (function () {
    function USyncUser() {
    }
    USyncUser.prototype.withId = function (id) {
        this.id = id;
        return this;
    };
    USyncUser.prototype.withLid = function (lid) {
        this.lid = lid;
        return this;
    };
    USyncUser.prototype.withPhone = function (phone) {
        this.phone = phone;
        return this;
    };
    USyncUser.prototype.withType = function (type) {
        this.type = type;
        return this;
    };
    USyncUser.prototype.withPersonaId = function (personaId) {
        this.personaId = personaId;
        return this;
    };
    return USyncUser;
}());
exports.USyncUser = USyncUser;
//# sourceMappingURL=USyncUser.js.map