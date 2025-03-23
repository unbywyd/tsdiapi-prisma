import { PrismaOperation } from "./events.js";
import { Prisma } from "@prisma/client";
export type PrismaModelNames = keyof typeof Prisma.ModelName;
export type PrismaOperationArgs<Model extends PrismaModelNames, Operation extends PrismaOperation> = Prisma.TypeMap["model"][Model]["operations"][Operation]["args"];
export type PrismaOperationResults<Model extends PrismaModelNames, Operation extends PrismaOperation> = Prisma.TypeMap["model"][Model]["operations"][Operation]["result"];
export type PrismaHookPayload<M extends PrismaModelNames, O extends PrismaOperation> = {
    operation: PrismaOperation;
    args: PrismaOperationArgs<M, O>;
    query: any;
    model: Prisma.ModelName;
    result?: PrismaOperationResults<M, O>;
};
declare class PrismaHookRegistry {
    private hooks;
    registerHook<M extends PrismaModelNames, O extends PrismaOperation>(model: M, operation: O, handler: (args: PrismaOperationArgs<M, O>) => Promise<PrismaOperationArgs<M, O>>): void;
    applyAll<M extends PrismaModelNames, O extends PrismaOperation>(data: PrismaHookPayload<M, O>): Promise<PrismaOperationArgs<M, O>>;
}
export declare const prismaHookRegistry: PrismaHookRegistry;
export declare function usePrismaHook<M extends PrismaModelNames, O extends PrismaOperation>(model: M, operation: O, handler: (args: PrismaOperationArgs<M, O>) => Promise<PrismaOperationArgs<M, O>> | PrismaOperationArgs<M, O>): void;
export {};
//# sourceMappingURL=hooks.d.ts.map