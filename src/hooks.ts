import { PrismaOperation } from "./events.js";
import { Prisma } from "@prisma/client";
// @ts-ignore
export type PrismaModelNames = keyof typeof Prisma.ModelName;
// @ts-ignore
export type PrismaOperationArgs<Model extends PrismaModelNames, Operation extends PrismaOperation> = Prisma.TypeMap["model"][Model]["operations"][Operation]["args"];
// @ts-ignore
export type PrismaOperationResults<Model extends PrismaModelNames, Operation extends PrismaOperation> = Prisma.TypeMap["model"][Model]["operations"][Operation]["result"];
// @ts-ignore
export type PrismaHookPayload<M extends PrismaModelNames, O extends PrismaOperation> = { operation: PrismaOperation; args: PrismaOperationArgs<M, O>; query: any; model: Prisma.ModelName; result?: PrismaOperationResults<M, O>; }
class PrismaHookRegistry {
    private hooks: Array<{ model: PrismaModelNames; operation: PrismaOperation; handler: Function }> = [];

    public registerHook<M extends PrismaModelNames, O extends PrismaOperation>(
        model: M,
        operation: O,
        handler: (args: PrismaOperationArgs<M, O>) => Promise<PrismaOperationArgs<M, O>>
    ) {
        this.hooks.push({ model, operation, handler });
    }

    public async applyAll<M extends PrismaModelNames, O extends PrismaOperation>(
        data: PrismaHookPayload<M, O>
    ): Promise<PrismaOperationArgs<M, O>> {
        let { args, operation, model } = data;

        for (const hook of this.hooks) {
            if (hook.operation === operation && hook.model === model) {
                try {
                    args = await hook.handler(args);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        return args;
    }
}

export const prismaHookRegistry = new PrismaHookRegistry();

export function usePrismaHook<
    M extends PrismaModelNames,
    O extends PrismaOperation
>(
    model: M,
    operation: O,
    handler: (args: PrismaOperationArgs<M, O>) => Promise<PrismaOperationArgs<M, O>> | PrismaOperationArgs<M, O>
) {
    prismaHookRegistry.registerHook(model, operation, handler);
}

