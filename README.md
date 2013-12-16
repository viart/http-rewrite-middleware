# http-rewrite-middleware v0.1.0 [![Build Status](https://travis-ci.org/viart/http-rewrite-middleware.png?branch=master)](https://travis-ci.org/viart/http-rewrite-middleware)

> This module makes it possible to redirect (rewrite internally or redirect using HTTP codes) User to the specific URL based on RegExp Rules.
> The designated successor of [grunt-connect-rewrite](https://github.com/viart/grunt-connect-rewrite).

## Getting Started
* Install the middleware by running:

    ```shell
    npm install http-rewrite-middleware --save
    ```

* Include the module:

    ```js
    var rewriteModule = require('http-rewrite-middleware');
    ```

* Define your rules like:

    ```js
    var rewriteMiddleware = rewriteModule.getMiddleware([
        // Internal rewrite
        {from: '^/index_dev.html$', to: '/src/index.html'},
        // Internal rewrite
        {from: '^/js/(.*)$', to: '/src/js/$1'},
        // 301 Redirect
        {from: '^/old-stuff/(.*)$', to: '/new-cool-stuff/$1', redirect: 'permanent'},
        // 302 Redirect
        {from: '^/stuff/(.*)$', to: '/temporary-stuff/$1', redirect: 'temporary'}
    ]);
    ```

* See examples of integration with Connect / Express / Grunt bellow.

### Options

##### Rule's format:

`{from: '__from__', to: '__to__'[, redirect: 'permanent'|'temporary']}`

Where:
* `__from__` - RegExp string to match.
* `__to__` - String that replaces matched URL.
* `redirect` - Optional parameter:
    * When it is omitted then the Rule will be dispatched as an internal rewrite (aka proxified).
    * If the value is set then Browser will receive HTTP `Location` Header with value of parsed `__to__` (`permanent` value will give `HTTP 301`, any other value will give `HTTP 302`).

### Example of usage with Connect

```js
var connect = require('connect'),
    http = require('http'),
    rewriteModule = require('http-rewrite-middleware');

var app = connect()
    .use(rewriteModule.getMiddleware([
        // ... list of rules here
    ])
    .use(connect.static('public'));

http.createServer(app).listen(3000);
```

### Example of usage with Express

```js
var express = require('express'),
    app = express(),
    rewriteModule = require('http-rewrite-middleware');

app.use(rewriteModule.getMiddleware([
    // ... list of rules here
]);

//...
app.listen(3000);
```

### Example of usage with Grunt ([grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect))

```js
var rewriteModule = require('http-rewrite-middleware');

grunt.initConfig({
    connect: {
        options: {
            port: 9000,
            hostname: 'localhost'
        },
        development: {
            options: {
                middleware: function (connect, options) {
                    return [
                        // RewriteRules support
                        rewriteModule.getMiddleware([
                            // ... list of rules here
                        ], grunt), // <-- passing `grunt` is optional and is used for native Grunt logging

                        // mount filesystem
                        connect.static(require('path').resolve(options.base))

                        // ... any other middleware
                    ];
                }
            }
        }
    }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History
* 2013.12.17 `v0.1.0` Initial Release

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/viart/http-rewrite-middleware/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
