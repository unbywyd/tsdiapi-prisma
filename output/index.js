import { _createPrismaInstance } from './client.js';
export * from './events.js';
export * from './hooks.js';
let client = null;
const defaultConfig = {
    prismaOptions: {
        transactionOptions: {
            timeout: 10000,
        }
    }
};
class App {
    name = 'tsdiapi-prisma';
    config;
    context;
    constructor(config) {
        this.config = { ...config };
    }
    async onInit(ctx) {
        this.context = ctx;
        client = await _createPrismaInstance({
            prismaOptions: this.config.prismaOptions || defaultConfig.prismaOptions,
            customClient: this.config.client
        });
        ctx.fastify.decorate('prisma', client);
    }
}
export default (config) => new App(config);
export { client };
export function usePrisma() {
    return client;
}
//# sourceMappingURL=index.js.map