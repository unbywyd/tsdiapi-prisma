import "reflect-metadata";
import { PrismaHookPayload, PrismaOperation } from "./types";
declare class PrismaHookRegistry {
    private hooks;
    register(instance: any): void;
    applyAll<M extends string, O extends PrismaOperation, Args>(data: PrismaHookPayload<M, O, Args>): Promise<Args>;
}
export declare const prismaHookRegistry: PrismaHookRegistry;
export declare function PrismaHooks(): ClassDecorator;
export declare function Operation<O extends PrismaOperation, M extends string>(operation: O, model?: M): MethodDecorator;
export {};
//# sourceMappingURL=hooks.d.ts.map