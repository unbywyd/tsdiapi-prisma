import { AsyncLocalStorage } from 'async_hooks';
/**
 * AsyncLocalStorage for storing Fastify request context.
 * Context is automatically cleaned up after request completion.
 */
export const requestContext = new AsyncLocalStorage();
/**
 * Get current Fastify request from context.
 * @returns FastifyRequest or undefined if not in request context
 */
export function getRequest() {
    return requestContext.getStore();
}
//# sourceMappingURL=context.js.map