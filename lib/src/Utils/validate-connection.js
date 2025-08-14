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
exports.encodeSignedDeviceIdentity = exports.configureSuccessfulPairing = exports.generateRegistrationNode = exports.generateLoginNode = void 0;
var boom_1 = require("@hapi/boom");
var crypto_1 = require("crypto");
var index_js_1 = require("../../WAProto/index.js");
var Defaults_1 = require("../Defaults/index.js");
var WABinary_1 = require("../WABinary/index.js");
var crypto_2 = require("./crypto.js");
var generics_1 = require("./generics.js");
var signal_1 = require("./signal.js");
var getUserAgent = function (config) {
    return {
        appVersion: {
            primary: config.version[0],
            secondary: config.version[1],
            tertiary: config.version[2]
        },
        platform: index_js_1.proto.ClientPayload.UserAgent.Platform.WEB,
        releaseChannel: index_js_1.proto.ClientPayload.UserAgent.ReleaseChannel.RELEASE,
        osVersion: '0.1',
        device: 'Desktop',
        osBuildNumber: '0.1',
        localeLanguageIso6391: 'en',
        mnc: '000',
        mcc: '000',
        localeCountryIso31661Alpha2: config.countryCode
    };
};
var PLATFORM_MAP = {
    'Mac OS': index_js_1.proto.ClientPayload.WebInfo.WebSubPlatform.DARWIN,
    Windows: index_js_1.proto.ClientPayload.WebInfo.WebSubPlatform.WIN32
};
var getWebInfo = function (config) {
    var webSubPlatform = index_js_1.proto.ClientPayload.WebInfo.WebSubPlatform.WEB_BROWSER;
    if (config.syncFullHistory && PLATFORM_MAP[config.browser[0]]) {
        webSubPlatform = PLATFORM_MAP[config.browser[0]];
    }
    return { webSubPlatform: webSubPlatform };
};
var getClientPayload = function (config) {
    var payload = {
        connectType: index_js_1.proto.ClientPayload.ConnectType.WIFI_UNKNOWN,
        connectReason: index_js_1.proto.ClientPayload.ConnectReason.USER_ACTIVATED,
        userAgent: getUserAgent(config)
    };
    payload.webInfo = getWebInfo(config);
    return payload;
};
var generateLoginNode = function (userJid, config) {
    var _a = (0, WABinary_1.jidDecode)(userJid), user = _a.user, device = _a.device;
    var payload = __assign(__assign({}, getClientPayload(config)), { passive: false, pull: true, username: +user, device: device });
    return index_js_1.proto.ClientPayload.fromObject(payload);
};
exports.generateLoginNode = generateLoginNode;
var getPlatformType = function (platform) {
    var platformType = platform.toUpperCase();
    return (index_js_1.proto.DeviceProps.PlatformType[platformType] ||
        index_js_1.proto.DeviceProps.PlatformType.DESKTOP);
};
var generateRegistrationNode = function (_a, config) {
    var registrationId = _a.registrationId, signedPreKey = _a.signedPreKey, signedIdentityKey = _a.signedIdentityKey;
    // the app version needs to be md5 hashed
    // and passed in
    var appVersionBuf = (0, crypto_1.createHash)('md5')
        .update(config.version.join('.')) // join as string
        .digest();
    var companion = {
        os: config.browser[0],
        platformType: getPlatformType(config.browser[1]),
        requireFullSync: config.syncFullHistory
    };
    var companionProto = index_js_1.proto.DeviceProps.encode(companion).finish();
    var registerPayload = __assign(__assign({}, getClientPayload(config)), { passive: false, pull: false, devicePairingData: {
            buildHash: appVersionBuf,
            deviceProps: companionProto,
            eRegid: (0, generics_1.encodeBigEndian)(registrationId),
            eKeytype: Defaults_1.KEY_BUNDLE_TYPE,
            eIdent: signedIdentityKey.public,
            eSkeyId: (0, generics_1.encodeBigEndian)(signedPreKey.keyId, 3),
            eSkeyVal: signedPreKey.keyPair.public,
            eSkeySig: signedPreKey.signature
        } });
    return index_js_1.proto.ClientPayload.fromObject(registerPayload);
};
exports.generateRegistrationNode = generateRegistrationNode;
var configureSuccessfulPairing = function (stanza, _a) {
    var advSecretKey = _a.advSecretKey, signedIdentityKey = _a.signedIdentityKey, signalIdentities = _a.signalIdentities;
    var msgId = stanza.attrs.id;
    var pairSuccessNode = (0, WABinary_1.getBinaryNodeChild)(stanza, 'pair-success');
    var deviceIdentityNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'device-identity');
    var platformNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'platform');
    var deviceNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'device');
    var businessNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'biz');
    if (!deviceIdentityNode || !deviceNode) {
        throw new boom_1.Boom('Missing device-identity or device in pair success node', { data: stanza });
    }
    var bizName = businessNode === null || businessNode === void 0 ? void 0 : businessNode.attrs.name;
    var jid = deviceNode.attrs.jid;
    var _b = index_js_1.proto.ADVSignedDeviceIdentityHMAC.decode(deviceIdentityNode.content), details = _b.details, hmac = _b.hmac, accountType = _b.accountType;
    var isHostedAccount = accountType !== undefined && accountType === index_js_1.proto.ADVEncryptionType.HOSTED;
    var hmacPrefix = isHostedAccount ? Buffer.from([6, 5]) : Buffer.alloc(0);
    var advSign = (0, crypto_2.hmacSign)(Buffer.concat([hmacPrefix, details]), Buffer.from(advSecretKey, 'base64'));
    if (Buffer.compare(hmac, advSign) !== 0) {
        throw new boom_1.Boom('Invalid account signature');
    }
    var account = index_js_1.proto.ADVSignedDeviceIdentity.decode(details);
    var accountSignatureKey = account.accountSignatureKey, accountSignature = account.accountSignature, deviceDetails = account.details;
    var accountMsg = Buffer.concat([Buffer.from([6, 0]), deviceDetails, signedIdentityKey.public]);
    if (!crypto_2.Curve.verify(accountSignatureKey, accountMsg, accountSignature)) {
        throw new boom_1.Boom('Failed to verify account signature');
    }
    var devicePrefix = isHostedAccount ? Buffer.from([6, 6]) : Buffer.from([6, 1]);
    var deviceMsg = Buffer.concat([devicePrefix, deviceDetails, signedIdentityKey.public, accountSignatureKey]);
    account.deviceSignature = crypto_2.Curve.sign(signedIdentityKey.private, deviceMsg);
    var identity = (0, signal_1.createSignalIdentity)(jid, accountSignatureKey);
    var accountEnc = (0, exports.encodeSignedDeviceIdentity)(account, false);
    var deviceIdentity = index_js_1.proto.ADVDeviceIdentity.decode(account.details);
    var reply = {
        tag: 'iq',
        attrs: {
            to: WABinary_1.S_WHATSAPP_NET,
            type: 'result',
            id: msgId
        },
        content: [
            {
                tag: 'pair-device-sign',
                attrs: {},
                content: [
                    {
                        tag: 'device-identity',
                        attrs: { 'key-index': deviceIdentity.keyIndex.toString() },
                        content: accountEnc
                    }
                ]
            }
        ]
    };
    var authUpdate = {
        account: account,
        me: { id: jid, name: bizName },
        signalIdentities: __spreadArray(__spreadArray([], (signalIdentities || []), true), [identity], false),
        platform: platformNode === null || platformNode === void 0 ? void 0 : platformNode.attrs.name
    };
    return {
        creds: authUpdate,
        reply: reply
    };
};
exports.configureSuccessfulPairing = configureSuccessfulPairing;
var encodeSignedDeviceIdentity = function (account, includeSignatureKey) {
    var _a;
    account = __assign({}, account);
    // set to null if we are not to include the signature key
    // or if we are including the signature key but it is empty
    if (!includeSignatureKey || !((_a = account.accountSignatureKey) === null || _a === void 0 ? void 0 : _a.length)) {
        account.accountSignatureKey = null;
    }
    return index_js_1.proto.ADVSignedDeviceIdentity.encode(account).finish();
};
exports.encodeSignedDeviceIdentity = encodeSignedDeviceIdentity;
//# sourceMappingURL=validate-connection.js.map