class PrismaHookRegistry {
    hooks = [];
    registerHook(model, operation, handler) {
        this.hooks.push({ model, operation, handler });
    }
    async applyAll(data) {
        let { args, operation, model } = data;
        for (const hook of this.hooks) {
            if (hook.operation === operation && hook.model === model) {
                try {
                    args = await hook.handler(args);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        return args;
    }
}
export const prismaHookRegistry = new PrismaHookRegistry();
export function usePrismaHook(model, operation, handler) {
    prismaHookRegistry.registerHook(model, operation, handler);
}
//# sourceMappingURL=hooks.js.map