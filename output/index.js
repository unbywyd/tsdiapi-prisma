"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.default = default_1;
const client_1 = require("./client");
__exportStar(require("./events"), exports);
__exportStar(require("./hooks"), exports);
const client_2 = require("./client");
Object.defineProperty(exports, "client", { enumerable: true, get: function () { return client_2.client; } });
const defaultConfig = {
    prismaOptions: {
        transactionOptions: {
            timeout: 10000,
        }
    },
    globPrismaPath: "*.prisma{.ts,.js}"
};
class App {
    name = 'tsdiapi-prisma';
    config;
    context;
    bootstrapFilesGlobPath;
    constructor(config) {
        this.config = { ...config };
        this.bootstrapFilesGlobPath = this.config.globPrismaPath || defaultConfig.globPrismaPath;
        (0, client_1._createPrismaInstance)(this.config.prismaOptions || defaultConfig);
    }
    async onInit(ctx) {
        this.context = ctx;
    }
}
function default_1(config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map