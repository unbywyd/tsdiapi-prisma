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

// Type for global event handler that works for all models
export type GlobalPrismaEventHandler<Args = any, Result = any> = (
    payload: PrismaEventPayload<string, PrismaOperation, Args, Result>
) => void | Promise<void>;

class PrismaEventController {
    private listeners: Map<string, Function[]> = new Map();
    private globalListeners: Map<string, Function[]> = new Map();

    public on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    public onGlobal(operation: PrismaOperation | '*', eventType: PrismaEventOperation, callback: Function): void {
        const key = `${eventType}_${operation}`;
        if (!this.globalListeners.has(key)) {
            this.globalListeners.set(key, []);
        }
        this.globalListeners.get(key)!.push(callback);
    }

    public emit(event: string, payload: any): void {
        // Emit global listeners first
        const { operation, model } = payload;
        const eventType = event.includes('_before_') ? PrismaEventOperation.Before : PrismaEventOperation.After;
        
        // Emit to wildcard global listeners
        const wildcardKey = `${eventType}_*`;
        if (this.globalListeners.has(wildcardKey)) {
            for (const callback of this.globalListeners.get(wildcardKey)!) {
                callback(payload);
            }
        }
        
        // Emit to operation-specific global listeners
        const operationKey = `${eventType}_${operation}`;
        if (this.globalListeners.has(operationKey)) {
            for (const callback of this.globalListeners.get(operationKey)!) {
                callback(payload);
            }
        }
        
        // Emit to model-specific listeners
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

// Global event listeners for all models - specific operation
export function onBeforeHookForAll<Args = any>(
    operation: PrismaOperation,
    handler: GlobalPrismaEventHandler<Args, any>
): void;
// Global event listeners for all models - all operations
export function onBeforeHookForAll<Args = any>(
    operation: '*',
    handler: GlobalPrismaEventHandler<Args, any>
): void;
// Implementation
export function onBeforeHookForAll<Args = any>(
    operation: PrismaOperation | '*',
    handler: GlobalPrismaEventHandler<Args, any>
) {
    prismaController.onGlobal(operation, PrismaEventOperation.Before, handler);
}

// Global event listeners for all models - specific operation
export function onAfterHookForAll<Args = any, Result = any>(
    operation: PrismaOperation,
    handler: GlobalPrismaEventHandler<Args, Result>
): void;
// Global event listeners for all models - all operations
export function onAfterHookForAll<Args = any, Result = any>(
    operation: '*',
    handler: GlobalPrismaEventHandler<Args, Result>
): void;
// Implementation
export function onAfterHookForAll<Args = any, Result = any>(
    operation: PrismaOperation | '*',
    handler: GlobalPrismaEventHandler<Args, Result>
) {
    prismaController.onGlobal(operation, PrismaEventOperation.After, handler);
}