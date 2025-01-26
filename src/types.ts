import "reflect-metadata";
import { Service, Container } from "typedi";

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

export type PrismaHookPayload<
    M extends string,
    O extends PrismaOperation,
    Args
> = {
    operation: O;
    args: Args;
    model: M;
};

@Service()
export class DbEventController {
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

export function DbBeforeListener<
    M extends string,
    O extends PrismaOperation,
    Args
>(model: M, operation: O) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const eventName = generateEventString(model, operation, PrismaEventOperation.Before);

        Container.get(DbEventController).on(eventName, (payload: PrismaEventPayload<M, O, Args, any>) => {
            const instance = Container.get(target.constructor);
            return originalMethod.call(instance, payload);
        });
    };
}

export function DbAfterListener<
    M extends string,
    O extends PrismaOperation,
    Args,
    Result
>(model: M, operation: O) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const eventName = generateEventString(model, operation, PrismaEventOperation.After);

        Container.get(DbEventController).on(eventName, (payload: PrismaEventPayload<M, O, Args, Result>) => {
            const instance = Container.get(target.constructor);
            return originalMethod.call(instance, payload);
        });
    };
}
