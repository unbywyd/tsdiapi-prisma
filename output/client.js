import { PrismaClient } from "@prisma/client";
import { prismaController, generateEventString, PrismaEventOperation } from "./events.js";
import { prismaHookRegistry } from "./hooks.js";
let client = null;
export const _createPrismaInstance = (prismaOptions) => {
    if (client) {
        return client;
    }
    const baseClient = new PrismaClient({
        transactionOptions: prismaOptions || {
            timeout: 10000,
        }
    });
    client = baseClient.$extends({
        query: {
            $allOperations: async ({ model, operation, args, query }) => {
                const payload = {
                    model,
                    args,
                    query,
                    operation,
                };
                const beforeEvent = generateEventString(model, operation, PrismaEventOperation.Before);
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
                    const afterEvent = generateEventString(model, operation, PrismaEventOperation.After);
                    prismaController.emit(afterEvent, afterPayload);
                }
                catch (e) {
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
};
export { client };
//# sourceMappingURL=client.js.map