var Moonboots = require('moonboots-express');
var express = require('express');
var app = express();
var Crawler = require('..');
var port = 3000;
var crawler = new Crawler({
    rndr: {},
    crawler: {
        appPort: port
    }
});

var moonboots = new Moonboots({
    server: app,
    moonboots: {
        main: __dirname + '/clientapp/app.js',
        libraries: [
            __dirname + '/../node_modules/jquery/dist/jquery.js'
        ]
    }
});

moonboots.on('ready', function () {
    crawler.start();
});

app.listen(port);