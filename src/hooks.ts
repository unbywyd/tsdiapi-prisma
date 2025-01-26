import "reflect-metadata";
import Container, { Service } from "typedi";
import { PrismaHookPayload, PrismaOperation } from "./events";

const PRISMA_HOOKS_METADATA = Symbol("PRISMA_HOOKS_METADATA");
const OPERATION_METADATA = Symbol("OPERATION_METADATA");

@Service()
class PrismaHookRegistry {
    private hooks: any[] = [];

    public register(instance: any): void {
        if (isPrismaHookInstance(instance)) {
            this.hooks.push(instance);
        }
    }

    public async applyAll<
        M extends string,
        O extends PrismaOperation,
        Args
    >(
        data: PrismaHookPayload<M, O, Args>
    ): Promise<Args> {
        let { args, operation, model } = data;

        for (let hookInstance of this.hooks) {
            const methods = Object.getOwnPropertyNames(
                Object.getPrototypeOf(hookInstance)
            );

            for (let method of methods) {
                const operationMetadata = getOperationMetadata(hookInstance, method);

                if (operationMetadata) {
                    const [operationType, modelName] = [
                        operationMetadata.operation,
                        operationMetadata.model,
                    ];
                    if (
                        operationType === operation &&
                        (!modelName || modelName === model)
                    ) {
                        args = await hookInstance[method].call(hookInstance, args);
                    }
                }
            }
        }

        return args;
    }
}

export const prismaHookRegistry = new PrismaHookRegistry();

export function PrismaHooks(): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(PRISMA_HOOKS_METADATA, true, target);
        const instance = Container.get(target);
        prismaHookRegistry.register(instance);
    };
}

export function Operation<
    O extends PrismaOperation,
    M extends string,
>(
    operation: O,
    model?: M
): MethodDecorator {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(
            OPERATION_METADATA,
            { model, operation },
            target,
            propertyKey
        );
    };
}

function isPrismaHookInstance(obj: any): obj is object {
    return Reflect.getMetadata(PRISMA_HOOKS_METADATA, obj.constructor);
}

function getOperationMetadata<
    M extends string,
    O extends PrismaOperation
>(
    instance: any,
    propertyKey: string | symbol
): {
    model: M;
    operation: O;
} | null {
    return Reflect.getMetadata(OPERATION_METADATA, instance, propertyKey) as {
        model: M;
        operation: O;
    } | null;
}
