var Moonboots = require('moonboots-express');
var express = require('express');
var app = express();
var _ = require('lodash');
var Crawler = require('..');
var port = 3010;
var timeout = 2000;


// Create our single page app crawler
var spaCrawler = new Crawler({
    // Passed directly to `rndr-me`
    rndr: {
        readyEvent: 'rendered'
    },
    // Passed to `url` for where to
    // start crawling our single page app
    app: {
        hostname: '127.0.0.1',
        pathname: '/',
        protocol: 'http:',
        port: port
    },
    // Passed directly to `simplecrawler`
    crawler: {
        maxConcurrency: 4
    }
});


// Create our app server for our single page app
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


// Start out crawler when our app is ready and listen for events
moonboots.on('ready', function () {
    // Stop our crawler if we dont have a url for timeout ms
    var dbStop = _.debounce(spaCrawler.stop.bind(spaCrawler), timeout);

    // Start the crawler and get the actual crawler that emits events
    var crawler = spaCrawler.start().crawler;

    // Start the stop timeout once we start
    crawler.on('crawlstart', dbStop);
    // On each `spaurl` event log the url
    crawler.on('spaurl', function (url) {
        console.log(url);
        dbStop();
    });
});
