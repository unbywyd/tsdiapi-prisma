import { PrismaOperation, usePrismaHook } from "@tsdiapi/prisma";
import { Prisma } from "@prisma/client";


usePrismaHook(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}}, async (payload) => {
    console.log(`Hook {{modelName}}:`, payload);
    return payload;
});
