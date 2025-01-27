import { PrismaClient } from "@prisma/client";
import Container from "typedi";
import { DbEventController, generateEventString, PrismaEventOperation, PrismaEventPayload } from "./events";
import { prismaHookRegistry } from "./hooks";
let client: PrismaClient | null = null;

export const _createPrismaInstance = (prismaOptions: any) => {
    if (client) {
        return client;
    }
    client = new PrismaClient({
        transactionOptions: prismaOptions || {
            timeout: 10000,
        }
    }).$extends({
        query: {
            $allOperations: async ({ model, operation, args, query }: any) => {
                const payload: PrismaEventPayload<any, any, any, any> = {
                    model,
                    args,
                    query,
                    operation,
                };
                const controller = Container.get(DbEventController);
                const beforeEvent = generateEventString(
                    model,
                    operation,
                    PrismaEventOperation.Before
                );

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

                    const afterEvent = generateEventString(
                        model,
                        operation,
                        PrismaEventOperation.After
                    );
                    controller.emit(afterEvent, afterPayload);
                } catch (e) {
                    throw Error(e.message);
                }
                return result;
            },
        },
    });

    process.on("SIGINT", () => {
        client.$disconnect().then(() => {
            console.log("Disconnect from database");
        }).finally(() => {
            process.exit();
        });
    });

    process.on("SIGTERM", () => {
        client.$disconnect().then(() => {
            console.log("Disconnect from database");
        }).finally(() => {
            process.exit();
        });
    });

    process.on("exit", async () => {
        client.$disconnect().then(() => {
            console.log("Disconnect from database");
        }).finally(() => {
            process.exit();
        });
    });
    return client;
}


export { client };