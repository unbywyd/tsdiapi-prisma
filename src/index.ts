import type { AppPlugin, AppContext } from '@tsdiapi/server';
import { _createPrismaInstance } from './client.js';
export * from './events.js';
export * from './hooks.js';
import { client } from './client.js';
export { client };

export type PluginOptions = {
    prismaOptions: any,
    autoloadGlobPath: string;
}

const defaultConfig: Partial<PluginOptions> = {
    prismaOptions: {
        transactionOptions: {
            timeout: 10000,
        }
    },
    autoloadGlobPath: "*.prisma{.ts,.js}"
}

class App implements AppPlugin {
    name = 'tsdiapi-prisma';
    config: PluginOptions;
    context: AppContext;
    bootstrapFilesGlobPath: string;
    constructor(config?: PluginOptions) {
        this.config = { ...config };
        this.bootstrapFilesGlobPath = this.config.autoloadGlobPath || defaultConfig.autoloadGlobPath;
        _createPrismaInstance(this.config.prismaOptions || defaultConfig);
    }
    async onInit(ctx: AppContext) {
        this.context = ctx;
    }
}

export default function (config?: PluginOptions) {
    return new App(config);
}