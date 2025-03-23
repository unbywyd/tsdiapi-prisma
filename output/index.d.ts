import type { AppPlugin, AppContext } from '@tsdiapi/server';
export * from './events.js';
export * from './hooks.js';
import { client } from './client.js';
export { client };
import { PrismaClient } from '@prisma/client';
declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}
export type PluginOptions = {
    prismaOptions: any;
};
declare class App implements AppPlugin {
    name: string;
    config: PluginOptions;
    context: AppContext;
    constructor(config?: PluginOptions);
    onInit(ctx: AppContext): Promise<void>;
}
export default function (config?: PluginOptions): App;
//# sourceMappingURL=index.d.ts.map