"use strict";
const fs = require("fs");
const path = require("path");
const compressor = require("node-minify");
var BlBundler;
(function (BlBundler) {
    class Bundle {
        constructor(name, urlPrefix) {
            this.files = {};
            this.name = name;
            this.urlPrefix = urlPrefix;
        }
        addFile(type, path) {
            if (this.files[type] == null) {
                this.files[type] = [];
            }
            this.files[type].push(path);
        }
        addJs(relativePath) {
            this.addFile("js", relativePath);
            return this;
        }
        addCss(relativePath) {
            this.addFile("css", relativePath);
            return this;
        }
        compile(rootUrl, type) {
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
        render(version, type, asBundle = true) {
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
        getHtmlInclude(version, type, relPath) {
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
        getPathForType(type) {
            return `/_bundled/${type}/${this.name}_bundle.${type}`;
        }
    }
    BlBundler.Bundle = Bundle;
    class Bundler {
        constructor(options) {
            this.groups = {};
            this.compiledBundles = [];
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
        bundle(bundleName) {
            if (this.groups[bundleName] == null) {
                this.groups[bundleName] = new Bundle(bundleName, this.options.urlPrefix);
            }
            return this.groups[bundleName];
        }
        render(type, groupName) {
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
        renderJs(groupName) {
            return this.render('js', groupName);
        }
        renderCss(groupName) {
            return this.render('css', groupName);
        }
    }
    BlBundler.Bundler = Bundler;
    var bundler = null;
    BlBundler.init = function (options) {
        if (bundler == null) {
            bundler = new Bundler(options);
        }
        return bundler;
    };
    BlBundler.installOnExpress = function (app) {
        app.use(function (req, res, next) {
            res.locals.renderJs = (groupName) => {
                return bundler.renderJs(groupName);
            };
            res.locals.renderCss = (groupName) => {
                return bundler.renderCss(groupName);
            };
            next();
        });
    };
})(BlBundler = exports.BlBundler || (exports.BlBundler = {}));
//# sourceMappingURL=index.js.map