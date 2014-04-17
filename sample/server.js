// For the single page app
var Moonboots = require('moonboots-express');
var express = require('express');
var app = express();

// The crawler
var Crawler = require('..');

// Create a server for the single page app
var moonboots = new Moonboots({
    server: app,
    moonboots: {
        main: __dirname + '/clientapp/app.js',
        libraries: [__dirname + '/../node_modules/jquery/dist/jquery.js'],
        stylesheets: [__dirname + '/clientapp/styles.css'],
        developmentMode: true
    }
});
app.listen(3010);

if (process.argv.join(' ').indexOf('--server-only') > -1) return;

// Configure the crawler
var spaCrawler = new Crawler({
    // Passed directly to `rndr-me`
    rndr: {
        // The single page app will emit this event
        // when it is done rendering each page
        readyEvent: 'rendered'
    },
    // The url of the single page app
    app: 'http://127.0.0.1:3010/'
});


// Start out crawler when our app is ready and listen for urls
moonboots.on('ready', function () {
    spaCrawler.start().crawler
        .on('spaurl', console.log)
        .on('complete', spaCrawler.stop.bind(spaCrawler, true));
});
