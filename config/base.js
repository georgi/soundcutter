// imports
var fs = require('fs');
var os = require('os');
var config = require('config');

exports.file = config('file', {
    expires: -1,
    staticDir: 'app'
});

exports.http = config('http', {
    port: 9100,
    host: '0.0.0.0',
    defaultFile: '/index.html'
});

exports.apiProxy = config('proxy', {
    host: 'api.soundcloud.com',
    root: '/_api'
});

exports.routes = config('routes', {
    api: /^\/_api/,
    home: /^\/$/,
    static: /\.(?:js|png|json|css|ico|html|manifest|mp3|ttf|swf|wav)(?:\?.*)?$/,
    wildcard: /.*/
});