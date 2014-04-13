var Moonboots = require('moonboots-express');
var express = require('express');
var app = express();
var _ = require('lodash');
var Crawler = require('..');
var port = 3000;

// Create our spa crawler
var spaCrawler = new Crawler({
    rndr: {
        readyEvent: 'rendered',
        port: 8001
    },
    crawler: {
        appPort: port,
        appHost: '127.0.0.1'
    }
});

// Create our client server
var moonboots = new Moonboots({
    server: app,
    moonboots: {
        main: __dirname + '/clientapp/app.js',
        developmentMode: true,
        libraries: [
            __dirname + '/../node_modules/jquery/dist/jquery.js'
        ]
    }
});
app.listen(port);

moonboots.on('ready', function () {
    // Stop our crawler if we dont have a url for 2 seconds
    var stop = _.debounce(function () {
        spaCrawler.stop();
    }, 2000);

    // Start the crawler and get the actual crawler that emits events
    var crawlerEvents = spaCrawler.start().crawler;

    // On each `spaurl` event log the url and call stop
    crawlerEvents.on('spaurl', function (url) {
        console.log(url);
        stop();
    });
});

