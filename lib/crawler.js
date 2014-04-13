var SimpleCrawler = require('simplecrawler');
var url = require('url');
var path = require('path');


function Crawler(options) {
    // Rndr options
    this.rndrQueryKey = 'href';
    this.rndrHost = 'localhost';
    this.rndrPort = options.rndrPort || 8001;

    // App options
    this.appHost = options.appHost || 'localhost';
    this.appPort = options.appPort || 3000;

    // Override simplecrawler a little
    this.configure();

    // The initial crawl path is our app index page as a query param
    var initialPath = '/?' + this.rndrQueryKey + '=' + encodeURIComponent(url.format({
        protocol: 'http:',
        key: this.rndrQueryKey,
        hostname: this.appHpst,
        port: this.appPort,
        pathname: '/'
    }));

    // Create our crawler
    this.crawler = new SimpleCrawler(this.rndrHost, initialPath, this.rndrPort);
    this.crawler.maxConcurrency = 4;

    return this.crawler;
}

Crawler.prototype.configure = function () {
    var self = this;

    SimpleCrawler.prototype.queueLinkedItems = function (resourceData, queueItem) {
        var crawler = this,
            resources = [];

        resources = crawler.discoverResources(resourceData, queueItem).map(function (r) {
            var parsed = url.parse(r, true);
            var ext = path.extname(parsed.pathname);
            var parsedQueryKey;

            if (parsed.query[self.rndrQueryKey]) {
                parsedQueryKey = url.parse(parsed.query[self.rndrQueryKey]);

                if (
                    parsedQueryKey.hostname === self.appHost && parsedQueryKey.port === self.appPort &&
                    parsed.hostname === self.rndrHost && parsed.port === self.rndrPort
                ) {
                    if (ext === '.html' || ext === '') {
                        delete parsed.search;
                        parsed.query[self.rndrQueryKey] = url.format({
                            protocol: parsed.protocol,
                            key: self.rndrQueryKey,
                            hostname: parsed.hostname,
                            port: self.appPort,
                            pathname: parsed.pathname
                        });
                        parsed.pathname = '/';
                    } else {
                        return '';
                    }
                }
            }

            return url.format(parsed);
        });

        resources.forEach(function (_url) { crawler.queueURL(_url, queueItem); });

        return crawler;
    };
};

module.exports = Crawler;