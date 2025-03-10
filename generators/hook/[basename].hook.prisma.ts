import { Operation, PrismaOperation } from "@tsdiapi/prisma";
import { Service } from "typedi";
import type { PrismaOperationArgs } from "@base/prisma.types.js";
import { Prisma } from "@prisma/client";

@Service()
export class {{className}}Hooks {

    @Operation(PrismaOperation.{{operation}}, Prisma.ModelName['{{modelName}}'])
    public modify{{className}}{{operation}}(args: PrismaOperationArgs<"{{modelName}}", PrismaOperation.{{operation}}>) {
        console.log(`Modifying {{operation}} on {{modelName}}:`, args);
        // Modify query args dynamically
        return args;
    }
}
