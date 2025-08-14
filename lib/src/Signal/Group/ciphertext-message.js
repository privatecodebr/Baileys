"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CiphertextMessage = void 0;
var CiphertextMessage = /** @class */ (function () {
    function CiphertextMessage() {
        this.UNSUPPORTED_VERSION = 1;
        this.CURRENT_VERSION = 3;
        this.WHISPER_TYPE = 2;
        this.PREKEY_TYPE = 3;
        this.SENDERKEY_TYPE = 4;
        this.SENDERKEY_DISTRIBUTION_TYPE = 5;
        this.ENCRYPTED_MESSAGE_OVERHEAD = 53;
    }
    return CiphertextMessage;
}());
exports.CiphertextMessage = CiphertextMessage;
//# sourceMappingURL=ciphertext-message.js.map