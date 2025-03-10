var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import "reflect-metadata";
import { Service, Container } from "typedi";
const PRISMA_HOOKS_METADATA = Symbol("PRISMA_HOOKS_METADATA");
const OPERATION_METADATA = Symbol("OPERATION_METADATA");
let PrismaHookRegistry = class PrismaHookRegistry {
    hooks = [];
    register(instance) {
        if (isPrismaHookInstance(instance)) {
            this.hooks.push(instance);
        }
    }
    async applyAll(data) {
        let { args, operation, model } = data;
        for (let hookInstance of this.hooks) {
            const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(hookInstance));
            for (let method of methods) {
                const operationMetadata = getOperationMetadata(hookInstance, method);
                if (operationMetadata) {
                    const [operationType, modelName] = [
                        operationMetadata.operation,
                        operationMetadata.model,
                    ];
                    if (operationType === operation &&
                        (!modelName || modelName === model)) {
                        args = await hookInstance[method].call(hookInstance, args);
                    }
                }
            }
        }
        return args;
    }
};
PrismaHookRegistry = __decorate([
    Service()
], PrismaHookRegistry);
export const prismaHookRegistry = new PrismaHookRegistry();
export function PrismaHooks() {
    return (target) => {
        Reflect.defineMetadata(PRISMA_HOOKS_METADATA, true, target);
        const instance = Container.get(target);
        prismaHookRegistry.register(instance);
    };
}
export function Operation(operation, model) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(OPERATION_METADATA, { model, operation }, target, propertyKey);
    };
}
function isPrismaHookInstance(obj) {
    return Reflect.getMetadata(PRISMA_HOOKS_METADATA, obj.constructor);
}
function getOperationMetadata(instance, propertyKey) {
    return Reflect.getMetadata(OPERATION_METADATA, instance, propertyKey);
}
//# sourceMappingURL=hooks.js.map