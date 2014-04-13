var SimpleCrawler = require('simplecrawler');
var url = require('url');
var path = require('path');


function Crawler(options) {
    // Rndr options
    this.rndrQueryKey = 'href';
    this.rndrHost = 'localhost';
    this.rndrPort = options.rndrPort;

    // App options
    this.appHost = options.appHost;
    this.appPort = options.appPort;
    this.appProtocol = options.appProtocol || 'http:';

    // Override simplecrawler a little
    this.configure();

    // Create our crawler
    this.crawler = new SimpleCrawler(this.rndrHost, this.initialPath(), this.rndrPort);
    this.crawler.maxConcurrency = 4;
}

Crawler.prototype.initialUrl = function () {
    return url.format({
        protocol: this.crawler.initialProtocol,
        hostname: this.crawler.host,
        port: this.crawler.initialPort,
        pathname: '/',
        search: this.initialSearch()
    });
};

Crawler.prototype.initialPath = function () {
    return '/' + this.initialSearch();
};

Crawler.prototype.initialSearch = function () {
    return '?' + this.rndrQueryKey + '=' + encodeURIComponent(url.format({
        protocol: this.appProtocol,
        hostname: this.appHost,
        port: this.appPort,
        pathname: '/'
    }));
};

Crawler.prototype.configure = function () {
    var self = this;

    SimpleCrawler.prototype.queueLinkedItems = function (resourceData, queueItem) {
        var crawler = this;
        var resources = crawler.discoverResources(resourceData, queueItem);

        resources = resources.map(function (r) {
            var resource = url.parse(r, true);
            var ext = path.extname(resource.pathname);
            var queryResource = resource.query[self.rndrQueryKey];

            if (queryResource) {
                queryResource = url.parse(queryResource);

                if (
                    queryResource.hostname === self.appHost && queryResource.port == self.appPort &&
                    resource.hostname === self.rndrHost && resource.port == self.rndrPort
                ) {
                    if (ext === '.html' || ext === '') {
                        delete resource.search;
                        resource.query[self.rndrQueryKey] = url.format({
                            protocol: queryResource.protocol,
                            hostname: self.appHost,
                            port: self.appPort,
                            pathname: resource.pathname
                        });
                        resource.pathname = '/';

                    } else {
                        return '';
                    }
                }
            }

            return url.format(resource);
        });

        resources.forEach(function (_url) { crawler.queueURL(_url, queueItem); });

        return crawler;
    };
};

Crawler.prototype.start = function () {
    this.crawler.emit('initialpath', { url: this.initialUrl() });
    this.crawler.start();
};

module.exports = Crawler;