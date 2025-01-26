import type { AppPlugin, AppContext } from 'tsdiapi-server';
export declare class LibraryService {
    private value;
    setValue(newValue: string): void;
    getValue(): string;
}
export type PluginOptions = {
    prismaOptions: any;
};
declare class App implements AppPlugin {
    name: string;
    config: PluginOptions;
    context: AppContext;
    constructor(config?: PluginOptions);
    onInit(ctx: AppContext): Promise<void>;
    beforeStart(ctx: AppContext): Promise<void>;
}
export default function (config?: PluginOptions): App;
export {};
//# sourceMappingURL=index.d.ts.map