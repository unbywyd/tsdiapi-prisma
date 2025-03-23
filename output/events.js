/** Possible Prisma operations */
export var PrismaOperation;
(function (PrismaOperation) {
    PrismaOperation["FindUnique"] = "findUnique";
    PrismaOperation["FindUniqueOrThrow"] = "findUniqueOrThrow";
    PrismaOperation["FindFirst"] = "findFirst";
    PrismaOperation["FindFirstOrThrow"] = "findFirstOrThrow";
    PrismaOperation["FindMany"] = "findMany";
    PrismaOperation["Create"] = "create";
    PrismaOperation["CreateMany"] = "createMany";
    PrismaOperation["Delete"] = "delete";
    PrismaOperation["Update"] = "update";
    PrismaOperation["DeleteMany"] = "deleteMany";
    PrismaOperation["UpdateMany"] = "updateMany";
    PrismaOperation["Upsert"] = "upsert";
    PrismaOperation["Aggregate"] = "aggregate";
    PrismaOperation["GroupBy"] = "groupBy";
    PrismaOperation["Count"] = "count";
})(PrismaOperation || (PrismaOperation = {}));
/** Distinguishes hooks before and after query execution */
export var PrismaEventOperation;
(function (PrismaEventOperation) {
    PrismaEventOperation["Before"] = "before";
    PrismaEventOperation["After"] = "after";
})(PrismaEventOperation || (PrismaEventOperation = {}));
/** Generates an event string for dispatching listeners */
export function generateEventString(modelName, operation, eventOperation) {
    return `db_${eventOperation}_${operation}_${modelName}`;
}
class PrismaEventController {
    listeners = new Map();
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    emit(event, payload) {
        if (!this.listeners.has(event))
            return;
        for (const callback of this.listeners.get(event)) {
            callback(payload);
        }
    }
}
export const prismaController = new PrismaEventController();
export function onBeforeHook(model, operation, handler) {
    const eventName = generateEventString(model, operation, PrismaEventOperation.Before);
    prismaController.on(eventName, handler);
}
export function onAfterHook(model, operation, handler) {
    const eventName = generateEventString(model, operation, PrismaEventOperation.After);
    prismaController.on(eventName, handler);
}
//# sourceMappingURL=events.js.map