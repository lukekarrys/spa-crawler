var spawn = require('child_process').spawn;
var _ = require('lodash');
var Crawler = require('./lib/crawler');
var url = require('url');

function parseQueueItem(queueItem) {
    return url.parse(queueItem.url, true).query.href;
}


function SPACrawler(options) {
    this.rndrOptions = options.rndr || {};
    _.defaults(this.rndrOptions, {
        port: 8001
    });

    this.appOptions = options.app || {};
    this.crawlerOptions = options.crawler || {};
}

SPACrawler.prototype.start = function () {
    this.startRndr();
    this.createCrawler();
    return this;
};

SPACrawler.prototype.stop = function () {
    this.rndr.kill(0);
    process.exit(0);
};

SPACrawler.prototype.startRndr = function () {
    var args = ['./node_modules/rndr-me/server.js'];

    // Make args like `--key value` for spawned process
    _.each(this.rndrOptions, function (val, key) {
        args.push('--' + key);
        args.push(val);
    });

    this.rndr = spawn('phantomjs', args, {cwd: __dirname});

    process.on("SIGINT", this.stop.bind(this));
    process.on("SIGTERM", this.stop.bind(this));
};

SPACrawler.prototype.emitURL = function (queueItem) {
    this._crawler.crawler.emit('spaurl', parseQueueItem(queueItem));
};

SPACrawler.prototype.createCrawler = function () {
    this._crawler = new Crawler({
        port: this.rndrOptions.port,
        app: this.appOptions,
        crawler: this.crawlerOptions
    });
    // Wait to start crawler until rndr server is ready
    // It should be ready in 2 seconds but doesn't emit
    // any events to know for sure
    _.delay(this.startCrawler.bind(this), 2000);
};

SPACrawler.prototype.startCrawler = function () {
    // Listen to events to get all the urls in the app
    this._crawler.crawler.on('queueadd', this.emitURL.bind(this));
    this._crawler.crawler.on('initialpath', this.emitURL.bind(this));
    this._crawler.start();
};

// Make our crawler easily accessible
Object.defineProperty(SPACrawler.prototype, 'crawler', {
    get: function () {
        return this._crawler.crawler;
    }
});

module.exports = SPACrawler;
