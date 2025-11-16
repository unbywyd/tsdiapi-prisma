import { getRequest } from "./context.js";
class PrismaHookRegistry {
    hooks = [];
    globalHooks = [];
    registerHook(model, operation, handler) {
        this.hooks.push({ model, operation, handler });
    }
    registerGlobalHook(operation, handler) {
        this.globalHooks.push({ operation, handler });
    }
    async applyAll(data) {
        let { args, operation, model } = data;
        const request = getRequest();
        // Apply global hooks first
        for (const hook of this.globalHooks) {
            if (hook.operation === '*' || hook.operation === operation) {
                try {
                    args = await hook.handler(args, model, operation, request);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        // Then apply model-specific hooks
        for (const hook of this.hooks) {
            if (hook.operation === operation && hook.model === model) {
                try {
                    args = await hook.handler(args, request);
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
// Implementation
export function usePrismaHook(model, operation, handler) {
    prismaHookRegistry.registerHook(model, operation, handler);
}
// Implementation
export function usePrismaHookForAll(operation, handler) {
    prismaHookRegistry.registerGlobalHook(operation, handler);
}
//# sourceMappingURL=hooks.js.map