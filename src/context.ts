import { AsyncLocalStorage } from 'async_hooks';
import type { FastifyRequest } from 'fastify';

/**
 * AsyncLocalStorage for storing Fastify request context.
 * Context is automatically cleaned up after request completion.
 */
export const requestContext = new AsyncLocalStorage<FastifyRequest>();

/**
 * Get current Fastify request from context.
 * @returns FastifyRequest or undefined if not in request context
 */
export function getRequest(): FastifyRequest | undefined {
    return requestContext.getStore();
}

