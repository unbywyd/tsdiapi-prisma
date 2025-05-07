import { PrismaOperation, onAfterHook, onBeforeHook } from "@tsdiapi/prisma";
import { Prisma } from "@generated/prisma/client.js";


onAfterHook(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}}, (payload) => {
    console.log(`After {{operation}} on {{modelName}}:`, payload);
});

onBeforeHook(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}}, (payload) => {
    console.log(`Before {{operation}} on {{modelName}}:`, payload);
});

