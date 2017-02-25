export declare module BlBundler {
    class Bundle {
        private files;
        name: string;
        urlPrefix: string;
        constructor(name: string, urlPrefix: string);
        addFile(type: string, path: string): void;
        addJs(relativePath: string): Bundle;
        addCss(relativePath: string): Bundle;
        compile(rootUrl: string, type: string, minify: boolean): string;
        render(version: string, type: string, asBundle?: boolean): string;
        private getHtmlInclude(version, type, relPath);
        private getPathForType(type);
    }
    interface IBundlerOptions {
        rootPath: string;
        minify?: boolean;
        enabled?: boolean;
        urlPrefix?: string;
        version?: string;
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
