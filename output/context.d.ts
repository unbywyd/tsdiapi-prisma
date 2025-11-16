import { AsyncLocalStorage } from 'async_hooks';
import type { FastifyRequest } from 'fastify';
/**
 * AsyncLocalStorage for storing Fastify request context.
 * Context is automatically cleaned up after request completion.
 */
export declare const requestContext: AsyncLocalStorage<FastifyRequest<import("fastify").RouteGenericInterface, import("fastify").RawServerDefault, import("http").IncomingMessage, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown, import("fastify").FastifyBaseLogger, import("fastify/types/type-provider.js").ResolveFastifyRequestType<import("fastify").FastifyTypeProviderDefault, import("fastify").FastifySchema, import("fastify").RouteGenericInterface>>>;
/**
 * Get current Fastify request from context.
 * @returns FastifyRequest or undefined if not in request context
 */
export declare function getRequest(): FastifyRequest | undefined;
//# sourceMappingURL=context.d.ts.map