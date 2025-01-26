import type { AppPlugin, AppContext } from 'tsdiapi-server';
import { _createPrismaInstance } from './client';

export * from './types';
export * from './hooks';

import client from './client';
export { client };

export type PluginOptions = {
    prismaOptions: any,
}

const defaultConfig: Partial<PluginOptions> = {
    prismaOptions: {
        transactionOptions: {
            timeout: 10000,
        }
    }
}

class App implements AppPlugin {
    name = 'tsdiapi-prisma';
    config: PluginOptions;
    context: AppContext;

    constructor(config?: PluginOptions) {
        this.config = { ...config };
        _createPrismaInstance(this.config.prismaOptions || defaultConfig);
    }

    async onInit(ctx: AppContext) {
        this.context = ctx;
    }
}

export default function (config?: PluginOptions) {
    return new App(config);
}