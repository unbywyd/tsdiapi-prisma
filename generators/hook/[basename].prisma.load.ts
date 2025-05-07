import { PrismaOperation, usePrismaHook } from "@tsdiapi/prisma";
import { Prisma } from "@generated/prisma/client.js";


usePrismaHook(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}}, async (payload) => {
    console.log(`Hook {{modelName}}:`, payload);
    return payload;
});
