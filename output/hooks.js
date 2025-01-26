"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaHookRegistry = void 0;
exports.PrismaHooks = PrismaHooks;
exports.Operation = Operation;
require("reflect-metadata");
const typedi_1 = __importStar(require("typedi"));
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
    (0, typedi_1.Service)()
], PrismaHookRegistry);
exports.prismaHookRegistry = new PrismaHookRegistry();
function PrismaHooks() {
    return (target) => {
        Reflect.defineMetadata(PRISMA_HOOKS_METADATA, true, target);
        const instance = typedi_1.default.get(target);
        exports.prismaHookRegistry.register(instance);
    };
}
function Operation(operation, model) {
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