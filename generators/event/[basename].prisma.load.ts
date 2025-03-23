import { PrismaOperation, onAfterHook, onBeforeHook } from "@tsdiapi/prisma";
import { Prisma } from "@prisma/client";


onAfterHook(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}}, (payload) => {
    console.log(`After {{operation}} on {{modelName}}:`, payload);
});

onBeforeHook(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}}, (payload) => {
    console.log(`Before {{operation}} on {{modelName}}:`, payload);
});

