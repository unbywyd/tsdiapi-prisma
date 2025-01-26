/** Possible Prisma operations */
export declare enum PrismaOperation {
    FindUnique = "findUnique",
    FindUniqueOrThrow = "findUniqueOrThrow",
    FindFirst = "findFirst",
    FindFirstOrThrow = "findFirstOrThrow",
    FindMany = "findMany",
    Create = "create",
    CreateMany = "createMany",
    Delete = "delete",
    Update = "update",
    DeleteMany = "deleteMany",
    UpdateMany = "updateMany",
    Upsert = "upsert",
    Aggregate = "aggregate",
    GroupBy = "groupBy",
    Count = "count"
}
/** Distinguishes hooks before and after query execution */
export declare enum PrismaEventOperation {
    Before = "before",
    After = "after"
}
/** Generates an event string for dispatching listeners */
export declare function generateEventString<Model extends string, Operation extends PrismaOperation>(modelName: Model, operation: Operation, eventOperation: PrismaEventOperation): string;
export type PrismaEventPayload<M extends string, O extends PrismaOperation, Args, Result> = {
    operation: O;
    args: Args;
    query: any;
    model: M;
    result?: Result;
};
export type PrismaHookPayload<M extends string, O extends PrismaOperation, Args> = {
    operation: O;
    args: Args;
    model: M;
};
export declare class DbEventController {
    private listeners;
    on(event: string, callback: Function): void;
    emit(event: string, payload: any): void;
}
export declare function DbBeforeListener<M extends string, O extends PrismaOperation, Args>(model: M, operation: O): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function DbAfterListener<M extends string, O extends PrismaOperation, Args, Result>(model: M, operation: O): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=types.d.ts.map