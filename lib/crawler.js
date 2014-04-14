var SimpleCrawler = require('simplecrawler');
var url = require('url');
var path = require('path');
var _ = require('lodash');

function comparePorts(port1, port2) {
    return (port1 + '') === (port2 + '');
}


function Crawler(options) {
    // Hardcoded rndr options
    this.rndrQueryKey = 'href';
    this.rndrHost = 'localhost';

    // The port of the rndr server
    this.rndrPort = options.port;

    this.appOptions = options.app || {};
    _.defaults(this.appOptions, {
        hostname: 'localhost',
        pathname: '/',
        protocol: 'http:',
        initialPort: 3005
    });

    // Configurable options for the crawler
    this.crawlerOptions = options.crawler || {};

    // Override simplecrawler a little
    this.patchSimpleCrawler();

    // These crawler options are explicity set to match the rndr server
    var ignoreKeys = [
        'initialPath',
        'initialProtocol',
        'initialPort'
    ];

    // Create our crawler
    this.crawler = new SimpleCrawler(this.rndrHost);
    this.crawler.initialProtocol = 'http:';
    this.crawler.initialPort = this.rndrPort;
    this.crawler.initialPath = '/' + this.initialSearch();

    _.each(this.crawlerOptions, function (value, key) {
        if (_.contains(ignoreKeys, key)) return;
        this.crawler[key] = value;
    }, this);
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

Crawler.prototype.initialSearch = function () {
    return '?' + this.rndrQueryKey + '=' + encodeURIComponent(url.format(this.appOptions));
};

Crawler.prototype.patchSimpleCrawler = function () {
    var self = this;

    SimpleCrawler.prototype.queueLinkedItems = function (resourceData, queueItem) {
        var crawler = this;
        var resources = crawler.discoverResources(resourceData, queueItem) || [];

        resources = resources.map(function (r) {
            var resource = url.parse(r, true);
            var ext = path.extname(resource.pathname);
            var queryResource = resource.query[self.rndrQueryKey];

            if (queryResource) {
                queryResource = url.parse(queryResource);

                if (
                    queryResource.hostname === self.appOptions.hostname &&
                    comparePorts(queryResource.port, self.appOptions.port) &&
                    resource.hostname === self.rndrHost &&
                    comparePorts(resource.port, self.rndrPort)
                ) {
                    if (ext === '.html' || ext === '') {
                        delete resource.search;
                        resource.query[self.rndrQueryKey] = url.format({
                            protocol: queryResource.protocol,
                            hostname: self.appOptions.hostname,
                            port: self.appOptions.port,
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