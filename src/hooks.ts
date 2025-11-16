import { PrismaOperation } from "./events.js";
import { Prisma } from "@prisma/client";
import type { FastifyRequest } from "fastify";
import { getRequest } from "./context.js";
// @ts-ignore
export type PrismaModelNames = keyof typeof Prisma.ModelName;
// @ts-ignore
export type PrismaOperationArgs<Model extends PrismaModelNames, Operation extends PrismaOperation> = Prisma.TypeMap["model"][Model]["operations"][Operation]["args"];
// @ts-ignore
export type PrismaOperationResults<Model extends PrismaModelNames, Operation extends PrismaOperation> = Prisma.TypeMap["model"][Model]["operations"][Operation]["result"];
// @ts-ignore
export type PrismaHookPayload<M extends PrismaModelNames, O extends PrismaOperation> = { operation: PrismaOperation; args: PrismaOperationArgs<M, O>; query: any; model: Prisma.ModelName; result?: PrismaOperationResults<M, O>; request?: FastifyRequest; }

// Type for global hook handler that works for all models
export type GlobalPrismaHookHandler = (
    args: any,
    model: PrismaModelNames,
    operation: PrismaOperation,
    request?: FastifyRequest
) => Promise<any> | any;

class PrismaHookRegistry {
    private hooks: Array<{ model: PrismaModelNames; operation: PrismaOperation; handler: Function }> = [];
    private globalHooks: Array<{ operation: PrismaOperation | '*'; handler: GlobalPrismaHookHandler }> = [];

    public registerHook<M extends PrismaModelNames, O extends PrismaOperation>(
        model: M,
        operation: O,
        handler: (args: PrismaOperationArgs<M, O>, request?: FastifyRequest) => Promise<PrismaOperationArgs<M, O>> | PrismaOperationArgs<M, O>
    ) {
        this.hooks.push({ model, operation, handler });
    }

    public registerGlobalHook(
        operation: PrismaOperation | '*',
        handler: GlobalPrismaHookHandler
    ) {
        this.globalHooks.push({ operation, handler });
    }

    public async applyAll<M extends PrismaModelNames, O extends PrismaOperation>(
        data: PrismaHookPayload<M, O>
    ): Promise<PrismaOperationArgs<M, O>> {
        let { args, operation, model } = data;
        const request = getRequest();

        // Apply global hooks first
        for (const hook of this.globalHooks) {
            if (hook.operation === '*' || hook.operation === operation) {
                try {
                    args = await hook.handler(args, model, operation, request);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        // Then apply model-specific hooks
        for (const hook of this.hooks) {
            if (hook.operation === operation && hook.model === model) {
                try {
                    args = await hook.handler(args, request);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        return args;
    }
}

export const prismaHookRegistry = new PrismaHookRegistry();

// Overload for backward compatibility - hooks without request parameter
export function usePrismaHook<
    M extends PrismaModelNames,
    O extends PrismaOperation
>(
    model: M,
    operation: O,
    handler: (args: PrismaOperationArgs<M, O>) => Promise<PrismaOperationArgs<M, O>> | PrismaOperationArgs<M, O>
): void;
// Overload for new hooks with request parameter
export function usePrismaHook<
    M extends PrismaModelNames,
    O extends PrismaOperation
>(
    model: M,
    operation: O,
    handler: (args: PrismaOperationArgs<M, O>, request?: FastifyRequest) => Promise<PrismaOperationArgs<M, O>> | PrismaOperationArgs<M, O>
): void;
// Implementation
export function usePrismaHook<
    M extends PrismaModelNames,
    O extends PrismaOperation
>(
    model: M,
    operation: O,
    handler: (args: PrismaOperationArgs<M, O>, request?: FastifyRequest) => Promise<PrismaOperationArgs<M, O>> | PrismaOperationArgs<M, O>
) {
    prismaHookRegistry.registerHook(model, operation, handler);
}

// Global hook for specific operation across all models
export function usePrismaHookForAll(
    operation: PrismaOperation,
    handler: GlobalPrismaHookHandler
): void;
// Global hook for all operations across all models
export function usePrismaHookForAll(
    operation: '*',
    handler: GlobalPrismaHookHandler
): void;
// Implementation
export function usePrismaHookForAll(
    operation: PrismaOperation | '*',
    handler: GlobalPrismaHookHandler
) {
    prismaHookRegistry.registerGlobalHook(operation, handler);
}

