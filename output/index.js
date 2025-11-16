import { _createPrismaInstance } from './client.js';
export * from './events.js';
export * from './hooks.js';
export * from './context.js';
import { requestContext } from './context.js';
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
        // Set up request context for Prisma hooks
        // AsyncLocalStorage automatically isolates contexts between concurrent requests
        // Each request has its own async context that is cleaned up automatically
        ctx.fastify.addHook('onRequest', async (request, reply) => {
            // Store request in AsyncLocalStorage for current async context
            // Context is automatically cleaned when async operations complete
            // No manual cleanup needed - prevents conflicts between concurrent requests
            requestContext.enterWith(request);
        });
    }
}
export default (config) => new App(config);
export { client };
export function usePrisma() {
    return client;
}
//# sourceMappingURL=index.js.map