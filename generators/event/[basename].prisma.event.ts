import { DbAfterListener, DbBeforeListener, PrismaOperation } from "@tsdiapi/prisma";
import { Service } from "typedi";
import { PrismaEventPayload } from "@base/prisma.types";
import { Prisma } from "@prisma/client";

@Service()
export class {{classname}}Events {
  
    @DbBeforeListener(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}})
    public before{{classname}}{{operation}}(payload: PrismaEventPayload<"{{modelName}}", PrismaOperation.{{operation}}>) {
        console.log(`Before {{operation}} on {{modelName}}:`, payload.args);
    }

    @DbAfterListener(Prisma.ModelName['{{modelName}}'], PrismaOperation.{{operation}})
    public after{{classname}}{{operation}}(payload: PrismaEventPayload<"{{modelName}}", PrismaOperation.{{operation}}>) {
        console.log(`After {{operation}} on {{modelName}}:`, payload.result);
    }
}
