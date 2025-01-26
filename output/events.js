"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbEventController = exports.PrismaEventOperation = exports.PrismaOperation = void 0;
exports.generateEventString = generateEventString;
exports.DbBeforeListener = DbBeforeListener;
exports.DbAfterListener = DbAfterListener;
const typedi_1 = require("typedi");
/** Possible Prisma operations */
var PrismaOperation;
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
})(PrismaOperation || (exports.PrismaOperation = PrismaOperation = {}));
/** Distinguishes hooks before and after query execution */
var PrismaEventOperation;
(function (PrismaEventOperation) {
    PrismaEventOperation["Before"] = "before";
    PrismaEventOperation["After"] = "after";
})(PrismaEventOperation || (exports.PrismaEventOperation = PrismaEventOperation = {}));
/** Generates an event string for dispatching listeners */
function generateEventString(modelName, operation, eventOperation) {
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
exports.DbEventController = DbEventController;
exports.DbEventController = DbEventController = __decorate([
    (0, typedi_1.Service)()
], DbEventController);
function DbBeforeListener(model, operation) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const eventName = generateEventString(model, operation, PrismaEventOperation.Before);
        typedi_1.Container.get(DbEventController).on(eventName, (payload) => {
            const instance = typedi_1.Container.get(target.constructor);
            return originalMethod.call(instance, payload);
        });
    };
}
function DbAfterListener(model, operation) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const eventName = generateEventString(model, operation, PrismaEventOperation.After);
        typedi_1.Container.get(DbEventController).on(eventName, (payload) => {
            const instance = typedi_1.Container.get(target.constructor);
            return originalMethod.call(instance, payload);
        });
    };
}
//# sourceMappingURL=events.js.map