# bl-bundler

## Install

```sh
$ npm install bl-bundler
```

## Introduction

This module lets you create bundles of css and js files. Bundles are groups
of files combined in one file in order to reduce requests to server. It can
also minify the files for reduced payload.
Bl-bundler is written in Typescript and it is 100% MIT licensed.

Here is an example on how to use it:

```js
var BlBundler = require("bl-bundler").BlBundler;

var bundler = BlBundler.init({
  rootPath: path.join(__dirname, "/public"),
  enabled: areWeInProductionMode,
  minify: areWeInProductionMode,
  allowCORS: true
});

bundler
    .bundle("controller")
    .addCss("/stylesheets/third-party/bootstrap/css/bootstrap.css")
    .addCss("/stylesheets/controllers/common/controller.css")
    .addCss("/javascripts/third-party/swal/sweetalert2.css")
    .addJs("/javascripts/third-party/jquery.min.js")
    .addJs("/javascripts/third-party/nosleep.js")
    .addJs("/javascripts/third-party/knockout.js")
    .addJs("/javascripts/third-party/knockout.mapping-latest.js")
    .addJs("/javascripts/third-party/swal/sweetalert2.min.js")
    .addJs("/javascripts/lib/lib.js")
    .addJs("/javascripts/controllers/common/lib.js")
    .addJs("/javascripts/controllers/common/controller.js");

bundler
    .bundle("main")
    .addJs("/javascripts/third-party/jquery.min.js")
    .addJs("/javascripts/third-party/isMobile.js")
    .addJs("/javascripts/lib/lib.js");
```

You can later use bundles in your views like this:

```js
  bundler.renderJs("controller");  //returns <script src="/_bundled/js/controller_bundle.js"></script>
  bundler.renderCss("controller");  //returns <link type="text/css" rel="stylesheet" href="/_bundled/css/controller_bundle.css">
```

## Options

* `rootPath`: The root location of your scripts/css (`required`)
* `minify`:  (default: `true`)
* `enabled`: (default: `true`)
* `urlPrefix`: in case you have a cdn server, you can enter its url here (default: `""`)
* `version`: appends ?v={version} to the script/link to prevent caching
  when a new version is deployed (default: `""`)

## Integration with express.js

Bl-bundler can be integrated with express.js and be used directly inside views (jade, pug etc)

```js
  var app = express();
  BlBundler.installOnExpress(app);
```

```jade
doctype html
html
  head
    title= title
      meta(name="viewport", content="width=device-width, initial-scale=1")
      script(src="/socket.io/socket.io.js")
      !{renderJs("controller")}
      !{renderCss("controller")}
```
