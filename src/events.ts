/** Possible Prisma operations */
export enum PrismaOperation {
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
    Count = "count",
}

/** Distinguishes hooks before and after query execution */
export enum PrismaEventOperation {
    Before = "before",
    After = "after",
}

/** Generates an event string for dispatching listeners */
export function generateEventString<
    Model extends string,
    Operation extends PrismaOperation
>(
    modelName: Model,
    operation: Operation,
    eventOperation: PrismaEventOperation
): string {
    return `db_${eventOperation}_${operation}_${modelName}`;
}

export type PrismaEventPayload<
    M extends string,
    O extends PrismaOperation,
    Args,
    Result
> = {
    operation: O;
    args: Args;
    query: any;
    model: M;
    result?: Result;
};

class PrismaEventController {
    private listeners: Map<string, Function[]> = new Map();

    public on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    public emit(event: string, payload: any): void {
        if (!this.listeners.has(event)) return;
        for (const callback of this.listeners.get(event)!) {
            callback(payload);
        }
    }
}

export const prismaController = new PrismaEventController();

export function onBeforeHook<
    M extends string,
    O extends PrismaOperation,
    Args
>(
    model: M,
    operation: O,
    handler: (payload: PrismaEventPayload<M, O, Args, any>) => void | Promise<void>
) {
    const eventName = generateEventString(model, operation, PrismaEventOperation.Before);
    prismaController.on(eventName, handler);
}

export function onAfterHook<
    M extends string,
    O extends PrismaOperation,
    Args,
    Result
>(
    model: M,
    operation: O,
    handler: (payload: PrismaEventPayload<M, O, Args, Result>) => void | Promise<void>
) {
    const eventName = generateEventString(model, operation, PrismaEventOperation.After);
    prismaController.on(eventName, handler);
}