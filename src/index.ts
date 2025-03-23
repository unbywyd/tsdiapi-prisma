import type { AppPlugin, AppContext } from '@tsdiapi/server';
import { _createPrismaInstance } from './client.js';
export * from './events.js';
export * from './hooks.js';
import { client } from './client.js';
export { client };
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

export type PluginOptions = {
    prismaOptions: any
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
        ctx.fastify.decorate('prisma', client);
    }
}

export default function (config?: PluginOptions) {
    return new App(config);
}