import type { Application, Request, Response } from 'express';
import { Container, Service } from 'typedi';
import type { AppPlugin, AppContext } from 'tsdiapi-server';
import { Prisma } from "@prisma/client";


@Service()
export class LibraryService {
    private value: string = 'Initial value from library';

    setValue(newValue: string): void {
        this.value = newValue;
    }

    getValue(): string {
        return this.value;
    }
}


export type PluginOptions = {
    prismaOptions: any,
}

const defaultConfig: Partial<PluginOptions> = {

}


class App implements AppPlugin {
    name = 'tsdiapi-prisma';
    config: PluginOptions;
    context: AppContext;

    constructor(config?: PluginOptions) {
        this.config = { ...config };
    }

    async onInit(ctx: AppContext) {
        this.context = ctx;
    }
    async beforeStart(ctx: AppContext) {

    }
}

export default function (config?: PluginOptions) {
    return new App(config);
}