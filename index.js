var spawn = require('child_process').spawn;
var _ = require('lodash');
var Crawler = require('./lib/crawler');
var url = require('url');


function SPACrawler(options) {
    this.rndrOptions = options.rndr || {};
    _.defaults(this.rndrOptions, {
        port: 8001
    });

    this.crawlerOptions = options.crawler || {};
    _.defaults(this.crawlerOptions, {
        rndrPort: this.rndrOptions.port,
        appHost: 'localhost',
        appPort: 3005
    });
}

SPACrawler.prototype.start = function () {
    this.startRndr();
    this._crawler = new Crawler(this.crawlerOptions);
    _.delay(this.startCrawler.bind(this), 2000);
    return this;
};

SPACrawler.prototype.stop = function () {
    this.rndr.kill(0);
    process.exit(0);
};

SPACrawler.prototype.startRndr = function () {
    var args = ['./node_modules/rndr-me/server.js'];

    _.each(this.rndrOptions, function (val, key) {
        args.push('--' + key);
        args.push(val);
    });

    this.rndr = spawn('phantomjs', args, {cwd: __dirname});

    process.on("SIGINT", this.stop.bind(this));
    process.on("SIGTERM", this.stop.bind(this));
};

SPACrawler.prototype.emitURL = function (queueItem) {
    var spaUrl = url.format(url.parse(url.parse(queueItem.url, true).query.href));
    this._crawler.crawler.emit('spaurl', spaUrl);
};

SPACrawler.prototype.startCrawler = function () {
    this._crawler.crawler.on('queueadd', this.emitURL.bind(this));
    this._crawler.crawler.on('initialpath', this.emitURL.bind(this));
    this._crawler.start();
};

Object.defineProperty(SPACrawler.prototype, 'crawler', {
    get: function () {
        return this._crawler.crawler;
    }
});

module.exports = SPACrawler;
