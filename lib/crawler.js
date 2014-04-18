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
        hostname: '127.0.0.1',
        pathname: '/',
        protocol: 'http:',
        port: '3001'
    });

    // Configurable options for the crawler
    this.crawlerOptions = options.crawler || {};

    // Override simplecrawler a little
    this.patchSimpleCrawler();

    // These crawler options are explicity set to match the rndr server
    var ignoreKeys = [
        'host',
        'initialPath',
        'initialProtocol',
        'initialPort'
    ];

    // Create our crawler
    this.crawler = new SimpleCrawler();
    this.crawler.host = this.rndrHost;
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
    return '?' + this.rndrQueryKey + '=' + encodeURIComponent(this.initialAppUrl());
};

Crawler.prototype.initialAppUrl = function () {
    return url.format(this.appOptions);
};

Crawler.prototype.patchSimpleCrawler = function () {
    var self = this;

    SimpleCrawler.prototype.queueLinkedItems = function (resourceData, queueItem) {
        var crawler = this;
        var resources = crawler.discoverResources(resourceData, queueItem)

        // Strip the `?href=appUrl` from each path we want to crawl
        // Every app url gets the query string because of how
        // simplecrawler uses URI.absoluteTo(queueItem.url)
        .map(function (r) {
            var resource = url.parse(r, true);
            var hrefQuery = resource.query[self.rndrQueryKey];
            if (hrefQuery && hrefQuery.indexOf(self.initialAppUrl()) === 0) {
                delete resource.search; // Delete search or it will supersede query
                delete resource.query[self.rndrQueryKey];
                return url.format(resource);
            }
            return r;
        })

        // Now a url that goes to our rndr server has the app pathname
        .map(function (r) {
            var resource = url.parse(r, true);
            var ext = path.extname(resource.pathname);

            // Point the crawler from http://rndrServer/appPath to http://rndrServer?href=appPath
            // Only do this for paths without an extension like `/page1`
            if (
                resource.hostname === self.rndrHost &&
                comparePorts(resource.port, self.rndrPort) &&
                ext === ''
            ) {
                delete resource.search;
                resource.query[self.rndrQueryKey] = url.format({
                    protocol: self.appOptions.protocol,
                    hostname: self.appOptions.hostname,
                    port: self.appOptions.port,
                    pathname: resource.pathname
                });
                resource.pathname = '/';
                r = url.format(resource);
            } else {
                // Nothing else gets crawled
                r = null;
            }
            return r;
        });

        _.compact(resources).forEach(function (_url) { crawler.queueURL(_url, queueItem); });

        return crawler;
    };
};

Crawler.prototype.start = function () {
    this.crawler.emit('initialpath', { url: this.initialUrl() });
    this.crawler.start();
};

Crawler.prototype.parseQueueItem = function (queueItem) {
    return url.parse(queueItem.url, true).query[this.rndrQueryKey];
};

module.exports = Crawler;