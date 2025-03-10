import { _createPrismaInstance } from './client.js';
export * from './events.js';
export * from './hooks.js';
import { client } from './client.js';
export { client };
const defaultConfig = {
    prismaOptions: {
        transactionOptions: {
            timeout: 10000,
        }
    },
    autoloadGlobPath: "*.prisma{.ts,.js}"
};
class App {
    name = 'tsdiapi-prisma';
    config;
    context;
    bootstrapFilesGlobPath;
    constructor(config) {
        this.config = { ...config };
        this.bootstrapFilesGlobPath = this.config.autoloadGlobPath || defaultConfig.autoloadGlobPath;
        _createPrismaInstance(this.config.prismaOptions || defaultConfig);
    }
    async onInit(ctx) {
        this.context = ctx;
    }
}
export default function (config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map