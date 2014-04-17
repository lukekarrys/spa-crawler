var Lab = require('lab');
var Moonboots = require('moonboots-express');
var express = require('express');
var Crawler = require('..');

function doneCount(expectCount, done) {
    var count = 0;
    return function () {
        count++;
        if (count === expectCount) {
            done();
        }
    };
}

Lab.experiment('Init', function () {

    Lab.test('Init', function (done) {
        var app = express();
        var moonboots = new Moonboots({
            server: app,
            moonboots: {
                main: __dirname + '/../sample/clientapp/app.js',
                libraries: [__dirname + '/../node_modules/jquery/dist/jquery.js'],
                stylesheets: [__dirname + '/../sample/clientapp/styles.css']
            }
        });
        app.listen(3010);
        var _done = doneCount(4, done);

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
                .on('spaurl', _done)
                .on('complete', spaCrawler.stop.bind(spaCrawler, true));
        });
    });

});