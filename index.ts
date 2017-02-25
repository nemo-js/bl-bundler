import fs = require("fs");
import path = require("path");
import compressor = require("node-minify");

export module BlBundler {

    export class Bundle {
        private files: { [type: string]: string[] } = {};
        public name: string;
        public urlPrefix: string;

        constructor(name: string, urlPrefix: string) {
            this.name = name;
            this.urlPrefix = urlPrefix;
        }

        addFile(type: string, path: string) {
            if (this.files[type] == null) {
                this.files[type] = [];
            }

            this.files[type].push(path);
        }

        public addJs(relativePath: string): Bundle {
            this.addFile("js", relativePath);
            return this;
        }

        public addCss(relativePath: string): Bundle {
            this.addFile("css", relativePath);
            return this;
        }

        compile(rootUrl: string, type: string) {
            if (!fs.existsSync(path.join(rootUrl, "_bundled"))) {
                fs.mkdirSync(path.join(rootUrl, "_bundled"));
            }
            if (!fs.existsSync(path.join(rootUrl, "_bundled", type))) {
                fs.mkdirSync(path.join(rootUrl, "_bundled", type));
            }

            const files = this.files[type];
            if (files == null) {
                return "";
            }

            var totalCode = "";
            for (let i = 0; i < files.length; i++) {
                const fullPath = path.join(rootUrl, files[i]);
                totalCode += "\n/*bundled file ->" + files[i] + "*/\n";
                totalCode += fs.readFileSync(fullPath);
            }

            var fullPath = path.join(rootUrl, this.getPathForType(type));
            fs.writeFileSync(fullPath, totalCode);

            compressor.minify({
                compressor: 'uglifyjs',
                input: fullPath,
                output: fullPath
            }).then(() => {
            });
        }

        render(version: string, type: string, asBundle: boolean = true): string {
            if (asBundle === true) {
                return this.getHtmlInclude(version, type, this.getPathForType(type));
            }

            var allIncludes = "";
            const files = this.files[type];
            for (let i = 0; i < files.length; i++) {
                allIncludes += this.getHtmlInclude(version, type, files[i]);
            }
            return allIncludes;
        }

        private getHtmlInclude(version: string, type: string, relPath: string) {
            if (this.urlPrefix != null && this.urlPrefix != "") {
                relPath = this.urlPrefix + relPath;
            }

            if (version == null || version == "") {
                relPath += "?_v=" + version;
            }
        
            switch (type) {
                case "js":
                    return `<script src="${relPath}"></script>`;
                case "css":
                    return `<link type="text/css" rel="stylesheet" href="${relPath}">`;
            }
        }
        
        private getPathForType(type: string) {
            return `/_bundled/${type}/${this.name}_bundle.${type}`;
        }
    }

    export interface IBundlerOptions {
        rootPath: string;
        minify?: boolean;
        enabled?: boolean;
        urlPrefix?: string;
        version?: string;
    }

    export class Bundler {
        private options: IBundlerOptions;
        private groups: { [name: string]: Bundle } = {};
        private compiledBundles: string[] = [];

        constructor(options: IBundlerOptions) {
            this.options = options || { rootPath: "" };
            if (this.options.minify == null) {
                this.options.minify = true;
            }
            if (this.options.enabled == null) {
                this.options.enabled = true;
            }
            if (this.options.rootPath == null) {
                this.options.rootPath = "";
            }
        }

        public bundle(bundleName: string) {
            if (this.groups[bundleName] == null) {
                this.groups[bundleName] = new Bundle(bundleName, this.options.urlPrefix);
            }

            return this.groups[bundleName];
        }

        private render(type: string, groupName: string): string {
            const group = this.groups[groupName];
            if (group == null) {
                throw new Error(`Bundle group '${groupName}' does not exist`);
            }

            if (this.options.enabled === false) {
                return group.render(this.options.version, type, false);
            }

            const alreadyCompiled = this.compiledBundles.indexOf(groupName + type) !== -1;
            if (!alreadyCompiled || this.options.minify === true) {
                group.compile(this.options.rootPath, type);
                if (!alreadyCompiled) {
                    this.compiledBundles.push(groupName + type);
                }
            }

            return group.render(this.options.version, type);
        }

        public renderJs(groupName: string): string {
            return this.render('js', groupName);
        }

        public renderCss(groupName: string): string {
            return this.render('css', groupName);
        }
    }

    var bundler: Bundler = null;

    export var init = function (options: IBundlerOptions): Bundler {
        if (bundler == null) {
            bundler = new Bundler(options);
        }
        
        return bundler;
    }

    export var installOnExpress = function (app: any) {
        app.use(function (req: any, res: any, next: any) {
            res.locals.renderJs = (groupName: string) => {
                return bundler.renderJs(groupName);
            };
            res.locals.renderCss = (groupName: string) => {
                return bundler.renderCss(groupName);
            }
            next();
        });
    }
}