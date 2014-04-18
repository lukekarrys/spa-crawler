var Lab = require('lab');
var Moonboots = require('moonboots-express');
var express = require('express');
var Crawler = require('..');
var domain = require('domain');

function doneCount(expectCount, done) {
    var count = 0;
    return function (cb) {
        count++;
        if (count === expectCount) {
            cb && cb();
            done();
        }
    };
}

function moonbootsServer(port, main) {
    var app = express();
    var moonboots = new Moonboots({
        server: app,
        moonboots: {
            main: __dirname + '/../sample/clientapp/' + (main || 'app') + '.js',
            libraries: [__dirname + '/../node_modules/jquery/dist/jquery.js'],
            stylesheets: [__dirname + '/../sample/clientapp/styles.css'],
            developmentMode: true
        }
    });
    app.listen(port);
    return moonboots;
}

function createCrawler(options) {
    return new Crawler(options);
}

Lab.experiment('Crawler', function () {
    Lab.before(function (done) {
        var moonboots = moonbootsServer(3010);
        moonboots.on('ready', function () {
            var moonboots2 = moonbootsServer(3001);
            moonboots2.on('ready', function () {
                done();
            });
        });
    });

    Lab.test('Emits with a custom event and url', function (done) {
        var _done = doneCount(4, done);
        var c = createCrawler({
            app: 'http://localhost:3010/',
            rndr: {readyEvent: 'rendered'},
            crawler: {
                maxConcurrency: 1
            }
        });
        c.start().crawler.on('spaurl', function (url) {
            Lab.expect(url.indexOf('http://localhost:3010/')).to.equal(0);
            Lab.expect(c.crawler.maxConcurrency).to.equal(1);
            _done(function () {
                c.killRndr();
            });
        });
    });

    Lab.test('Emits with defaults', function (done) {
        var _done = doneCount(4, done);
        var c = createCrawler();
        c.start().crawler.on('spaurl', function (url) {
            Lab.expect(url.indexOf('http://127.0.0.1:3001/')).to.equal(0);
            Lab.expect(c.crawler.maxConcurrency).to.equal(5);
            _done(function () {
                c.killRndr();
            });
        });
    });

    Lab.test('Cant start rndr server on a used port', function (done) {
        var d = domain.create();
        var c;

        d.on('error', function (err) {
            Lab.expect(err instanceof Error).to.equal(true);
            Lab.expect(err.message).to.equal('rndr-me could not bind to port 3001\n');
            c.killRndr();
            done();
        });

        d.run(function () {
            c = createCrawler({
                app: 'http://127.0.0.1:3001/',
                rndr: {
                    port: 3001
                }
            }).start();
        });
    });

    Lab.test('Ignored keys will be ignored', function (done) {
        var c = createCrawler({
            rndr: {
                port: 8010
            },
            crawler: {
                maxConcurrency: 1,
                initialPort: 1
            }
        });
        Lab.expect(c.crawler.initialPort).to.equal(8010);
        done();
    });
});