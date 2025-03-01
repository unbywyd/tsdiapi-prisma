"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports._createPrismaInstance = void 0;
const client_1 = require("@prisma/client");
const typedi_1 = __importDefault(require("typedi"));
const events_1 = require("./events");
const hooks_1 = require("./hooks");
let client = null;
exports.client = client;
const _createPrismaInstance = (prismaOptions) => {
    if (client) {
        return client;
    }
    exports.client = client = new client_1.PrismaClient({
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
                const controller = typedi_1.default.get(events_1.DbEventController);
                const beforeEvent = (0, events_1.generateEventString)(model, operation, events_1.PrismaEventOperation.Before);
                controller.emit(beforeEvent, payload);
                let result = null;
                try {
                    const Args = await hooks_1.prismaHookRegistry.applyAll({
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
                    const afterEvent = (0, events_1.generateEventString)(model, operation, events_1.PrismaEventOperation.After);
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
exports._createPrismaInstance = _createPrismaInstance;
//# sourceMappingURL=client.js.map