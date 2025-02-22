import { Operation, PrismaOperation } from "@tsdiapi/prisma";
import { Prisma } from "@prisma/client";

export type PrismaModelNames = keyof typeof Prisma.ModelName;
export type PrismaOperationArgs<
    Model extends PrismaModelNames,
    Operation extends PrismaOperation
> = Prisma.TypeMap["model"][Model]["operations"][Operation]["args"];

export type PrismaOperationResults<
    Model extends PrismaModelNames,
    Operation extends PrismaOperation
> = Prisma.TypeMap["model"][Model]["operations"][Operation]["result"];

export type PrismaEventPayload<
    M extends PrismaModelNames,
    O extends PrismaOperation
> = {
    operation: PrismaOperation;
    args: PrismaOperationArgs<M, O>;
    query: any;
    model: Prisma.ModelName;
    result?: PrismaOperationResults<M, O>;
}