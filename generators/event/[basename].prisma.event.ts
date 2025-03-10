import { DbAfterListener, DbBeforeListener, PrismaOperation } from "@tsdiapi/prisma";
import { Service } from "typedi";
import type { PrismaEventPayload } from "@base/prisma.types.js";
import { Prisma } from "@prisma/client";

@Service()
export class {{className}}Events {
  
    @DbBeforeListener(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}})
    public before{{className}}{{operation}}(payload: PrismaEventPayload<"{{modelName}}", PrismaOperation.{{operation}}>) {
        console.log(`Before {{operation}} on {{modelName}}:`, payload.args);
    }

    @DbAfterListener(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}})
    public after{{className}}{{operation}}(payload: PrismaEventPayload<"{{modelName}}", PrismaOperation.{{operation}}>) {
        console.log(`After {{operation}} on {{modelName}}:`, payload.result);
    }
}
