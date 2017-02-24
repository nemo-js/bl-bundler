export declare module BlBundler {
    class Bundle {
        private files;
        name: string;
        urlPrefix: string;
        constructor(name: string, urlPrefix: string);
        addFile(type: string, path: string): void;
        addJs(relativePath: string): Bundle;
        addCss(relativePath: string): Bundle;
        compile(rootUrl: string, type: string): string;
        render(version: number, type: string, asBundle?: boolean): string;
        private getHtmlInclude(version, type, relPath);
        private getPathForType(type);
    }
    interface IBundlerOptions {
        rootPath: string;
        live?: boolean;
        enabled?: boolean;
        urlPrefix?: string;
        version?: number;
    }
    class Bundler {
        private options;
        private groups;
        private compiledBundles;
        constructor(options: IBundlerOptions);
        bundle(bundleName: string): Bundle;
        private render(type, groupName);
        renderJs(groupName: string): string;
        renderCss(groupName: string): string;
    }
    var init: (options: IBundlerOptions) => Bundler;
    var installOnExpress: (app: any) => void;
}
