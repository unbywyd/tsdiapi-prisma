import type { AppPlugin, AppContext } from '@tsdiapi/server';
export * from './events.js';
export * from './hooks.js';
export * from './context.js';
declare let client: any;
declare module "fastify" {
    interface FastifyInstance {
        prisma: any;
    }
}
export type PluginOptions = {
    prismaOptions?: any;
    client: any;
};
declare class App implements AppPlugin {
    name: string;
    config: PluginOptions;
    context: AppContext;
    constructor(config?: PluginOptions);
    onInit(ctx: AppContext): Promise<void>;
}
declare const _default: (config?: PluginOptions) => App;
export default _default;
export { client };
export declare function usePrisma<T = unknown>(): T;
//# sourceMappingURL=index.d.ts.map