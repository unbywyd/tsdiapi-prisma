import { prismaController, generateEventString, PrismaEventOperation, PrismaEventPayload } from "./events.js";
import { prismaHookRegistry } from "./hooks.js";

export const _createPrismaInstance = async (options: {
    prismaOptions?: any;
    customClient: any;
}) => {
    let client: any = null;

    const { prismaOptions, customClient } = options;

    if (customClient) {
        if (typeof customClient === 'function' && customClient.prototype) {
            client = new customClient({
                transactionOptions: prismaOptions || {
                    timeout: 10000,
                }
            });
        } else {
            client = customClient;
        }
    } else {
        // Fallback to @prisma/client for backward compatibility
        const { PrismaClient } = await import('@prisma/client');
        client = new PrismaClient({
            transactionOptions: prismaOptions || {
                timeout: 10000,
            }
        });
    }

    client = client.$extends({
        query: {
            $allOperations: async ({ model, operation, args, query }: any) => {
                const payload: PrismaEventPayload<any, any, any, any> = {
                    model,
                    args,
                    query,
                    operation,
                };
                const beforeEvent = generateEventString(
                    model,
                    operation,
                    PrismaEventOperation.Before
                );

                prismaController.emit(beforeEvent, payload);

                let result = null;
                try {
                    const Args = await prismaHookRegistry.applyAll({
                        args,
                        operation,
                        model,
                        query
                    });

                    result = await query(Args);
                    const afterPayload = {
                        model,
                        args,
                        query,
                        operation,
                        result,
                    };
                    const afterEvent = generateEventString(
                        model,
                        operation,
                        PrismaEventOperation.After
                    );
                    prismaController.emit(afterEvent, afterPayload);
                } catch (e) {
                    throw Error(e.message);
                }
                return result;
            },
        },
    });

    process.on("SIGINT", () => {
        client.$disconnect().then(() => {
        }).finally(() => {
            process.exit();
        });
    });

    process.on("SIGTERM", () => {
        client.$disconnect().then(() => {
        }).finally(() => {
            process.exit();
        });
    });

    process.on("exit", async () => {
        client.$disconnect().then(() => {
        }).finally(() => {
            process.exit();
        });
    });
    return client;
}
