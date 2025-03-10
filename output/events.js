var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Service, Container } from "typedi";
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
let DbEventController = class DbEventController {
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
};
DbEventController = __decorate([
    Service()
], DbEventController);
export { DbEventController };
export function DbBeforeListener(model, operation) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const eventName = generateEventString(model, operation, PrismaEventOperation.Before);
        Container.get(DbEventController).on(eventName, (payload) => {
            const instance = Container.get(target.constructor);
            return originalMethod.call(instance, payload);
        });
    };
}
export function DbAfterListener(model, operation) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const eventName = generateEventString(model, operation, PrismaEventOperation.After);
        Container.get(DbEventController).on(eventName, (payload) => {
            const instance = Container.get(target.constructor);
            return originalMethod.call(instance, payload);
        });
    };
}
//# sourceMappingURL=events.js.map