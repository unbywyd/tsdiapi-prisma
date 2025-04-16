import type { AppPlugin, AppContext } from '@tsdiapi/server';
import { _createPrismaInstance } from './client.js';
export * from './events.js';
export * from './hooks.js';
import { FastifyInstance } from 'fastify';
let client: any = null;
declare module "fastify" {
    interface FastifyInstance {
        prisma: any;
    }
}

export type PluginOptions = {
    prismaOptions?: any;
    client: any;
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
    }
    async onInit(ctx: AppContext) {
        this.context = ctx;

        client = await _createPrismaInstance({
            prismaOptions: this.config.prismaOptions || defaultConfig.prismaOptions,
            customClient: this.config.client
        });
        ctx.fastify.decorate('prisma', client);
    }
}

export default (config?: PluginOptions) => new App(config);
export { client };

export function usePrisma<T = unknown>(): T {
    return client as T;
}