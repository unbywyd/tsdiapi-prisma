import { Operation, PrismaOperation } from "@tsdiapi/prisma";
import { Service } from "typedi";
import { PrismaOperationArgs } from "@base/prisma.types";
import { Prisma } from "@prisma/client";

@Service()
export class {{classname}}Hooks {

    @Operation(PrismaOperation.{{operation}}, Prisma.ModelName['{{modelName}}'])
    public modify{{classname}}{{operation}}(args: PrismaOperationArgs<"{{modelName}}", PrismaOperation.{{operation}}>) {
        console.log(`Modifying {{operation}} on {{modelName}}:`, args);
        // Modify query args dynamically
        return args;
    }
}
