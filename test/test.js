var Lab = require('lab');
var Moonboots = require('moonboots-express');
var express = require('express');
var Crawler = require('..');
var domain = require('domain');

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

var expectedUrls = ['/', '/page1', '/page2', '/page3'];

function appendDomain(d) {
    return function (u) {
        return d + u;
    };
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
        var host = 'http://localhost:3010';
        var c = createCrawler({
            app: host + '/',
            delayStart: 2200,
            rndr: {readyEvent: 'rendered'},
            crawler: {
                maxConcurrency: 1
            }
        });
        var urls = [];
        var count = 0;
        c.start().crawler.on('spaurl', function (url) {
            urls.push(url);
            count++;
            Lab.expect(c.crawler.maxConcurrency).to.equal(1);
            if (count === 4) {
                urls.sort();
                console.log(JSON.stringify(urls, null, 2));
                Lab.expect(
                    urls.join()
                ).to.equal(
                    expectedUrls.map(appendDomain(host)).join()
                );
                c.killRndr();
                done();
            }
        });
    });

    Lab.test('Emits with defaults', function (done) {
        var host = 'http://127.0.0.1:3001';
        var c = createCrawler();
        var urls = [];
        var count = 0;
        c.start().crawler.on('spaurl', function (url) {
            urls.push(url);
            count++;
            Lab.expect(c.crawler.maxConcurrency).to.equal(5);
            if (count === 4) {
                urls.sort();
                console.log(JSON.stringify(urls, null, 2));
                Lab.expect(
                    urls.join()
                ).to.equal(
                    expectedUrls.map(appendDomain(host)).join()
                );
                c.killRndr();
                done();
            }
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
        Lab.expect(c.crawler.maxConcurrency).to.equal(1);
        done();
    });
});