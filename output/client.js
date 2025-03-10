import { PrismaClient } from "@prisma/client";
import { Container } from "typedi";
import { DbEventController, generateEventString, PrismaEventOperation } from "./events.js";
import { prismaHookRegistry } from "./hooks.js";
let client = null;
export const _createPrismaInstance = (prismaOptions) => {
    if (client) {
        return client;
    }
    client = new PrismaClient({
        transactionOptions: prismaOptions || {
            timeout: 10000,
        }
    }).$extends({
        query: {
            $allOperations: async ({ model, operation, args, query }) => {
                const payload = {
                    model,
                    args,
                    query,
                    operation,
                };
                const controller = Container.get(DbEventController);
                const beforeEvent = generateEventString(model, operation, PrismaEventOperation.Before);
                controller.emit(beforeEvent, payload);
                let result = null;
                try {
                    const Args = await prismaHookRegistry.applyAll({
                        args,
                        operation,
                        model,
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
                    controller.emit(afterEvent, afterPayload);
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