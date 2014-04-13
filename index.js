var spawn = require('child_process').spawn;
var _ = require('lodash');
var Crawler = require('./lib/crawler');


function SPACrawler(options) {
    this.rndrOptions = options.rndr || {};
    _.defaults(this.rndrOptions, {
        port: 8001
    });

    this.crawlerOptions = options.crawler || {};
    _.defaults(this.crawlerOptions, {
        rndrPort: this.rndrOptions.port,
        appHost: 'localhost',
        appPort: 3000
    });
}


SPACrawler.prototype.start = function () {
    this.startRndr();
    _.delay(this.startCrawler.bind(this), 2000);
};

SPACrawler.prototype.stop = function () {
    this.rndr.kill();
};

SPACrawler.prototype.startRndr = function () {
    var args = ['./node_modules/rndr-me/server.js'];

    _.each(this.rndrOptions, function (val, key) {
        args.push('--' + key);
        args.push(val);
    });

    this.rndr = spawn('phantomjs', args, {cwd: __dirname});
};

SPACrawler.prototype.startCrawler = function () {
    this.crawler = new Crawler(this.crawlerOptions);
    this.crawler.start();
};

module.exports = SPACrawler;
