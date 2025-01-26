import type { AppPlugin, AppContext } from 'tsdiapi-server';
import { _createPrismaInstance } from './client';

export * from './types';
export * from './hooks';
import { client } from './client';
export { client };

export type PluginOptions = {
    prismaOptions: any,
    globHooksPath: string;
}

const defaultConfig: Partial<PluginOptions> = {
    prismaOptions: {
        transactionOptions: {
            timeout: 10000,
        }
    },
    globHooksPath: "*.prisma{.ts,.js}"
}

class App implements AppPlugin {
    name = 'tsdiapi-prisma';
    config: PluginOptions;
    context: AppContext;
    bootstrapFilesGlobPath: string;
    constructor(config?: PluginOptions) {
        this.config = { ...config };
        this.bootstrapFilesGlobPath = this.config.globHooksPath || defaultConfig.globHooksPath;
        _createPrismaInstance(this.config.prismaOptions || defaultConfig);
    }

    async onInit(ctx: AppContext) {
        this.context = ctx;
    }
}

export default function (config?: PluginOptions) {
    return new App(config);
}