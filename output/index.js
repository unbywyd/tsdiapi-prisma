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
    }
};
class App {
    name = 'tsdiapi-prisma';
    config;
    context;
    constructor(config) {
        this.config = { ...config };
        _createPrismaInstance(this.config.prismaOptions || defaultConfig);
    }
    async onInit(ctx) {
        this.context = ctx;
        ctx.fastify.decorate('prisma', client);
    }
}
export default function (config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map