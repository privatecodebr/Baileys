"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    roots: ['<rootDir>/src'],
    testMatch: ['**.test.ts'],
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }]
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map