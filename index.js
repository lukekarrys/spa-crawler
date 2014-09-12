var spawn = require('child_process').spawn;
var _ = require('lodash');
var Crawler = require('./lib/crawler');
var url = require('url');
var phantomjs = require('phantomjs');


function SPACrawler(options) {
    options || (options = {});

    this.rndrOptions = options.rndr || {};
    _.defaults(this.rndrOptions, {
        port: 8001,
        readyEvent: 'rendered'
    });

    this.appOptions = options.app && url.parse(options.app);
    this.crawlerOptions = options.crawler;

    this.createCrawler();
}

SPACrawler.prototype.start = function () {
    this.startRndr();
    // Wait to start crawler until rndr server is ready
    // It should be ready in 2 seconds but doesn't emit
    // any events to know for sure
    _.delay(this.startCrawler.bind(this), 2000);
    return this;
};

SPACrawler.prototype.startRndr = function () {
    var args = ['./node_modules/rndr-me/server.js'];

    // Make args like `--key value` for spawned process
    _.each(this.rndrOptions, function (val, key) {
        args.push('--' + key);
        args.push(val);
    });

    this.rndr = spawn(phantomjs.path, args);
    this.rndr.stdout.on('data', this.logRndr.bind(this));
    process.on('exit', this.killRndr.bind(this));
};

SPACrawler.prototype.logRndr = function (data) {
    var msg = data.toString().toLowerCase();
    // rndr-me only logs anything for errors
    throw new Error('rndr-me ' + msg);
};

SPACrawler.prototype.killRndr = function () {
    this.rndr.kill();
};

SPACrawler.prototype.emitURL = function (queueItem) {
    this._crawler.crawler.emit('spaurl', this._crawler.parseQueueItem(queueItem));
};

SPACrawler.prototype.createCrawler = function () {
    this._crawler = new Crawler({
        port: this.rndrOptions.port,
        app: this.appOptions,
        crawler: this.crawlerOptions
    });
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
