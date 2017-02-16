var SimpleCrawler = require('simplecrawler')
var url = require('url')
var path = require('path')
var mime = require('mime-types')

var overrideMethods = [
  'getRequestOptions'
]

class Crawler {
  constructor (options) {
    this.rndrHost = 'localhost'
    this.rndrPort = options.port

    // Override how urls are processed
    overrideMethods.forEach((method) => {
      this[`_SC_${method}`] = SimpleCrawler.prototype[method]
      SimpleCrawler.prototype[method] = this[overrideMethods].bind(this)
    })

    // Create our crawler
    this.crawler = new SimpleCrawler(options.app)
    Object.assign(this.crawler, options.crawler)

    // For examining urls later
    this.app = url.parse(options.app)
  }

  start () {
    this.crawler.on('fetchcomplete', ({ url }) => this.crawler.emit('spaurl', url))
    this.crawler.start()
  }

  getRequestOptions (queueItem) {
    var requestOptions = this._SC_getRequestOptions.call(this.crawler, queueItem)

    if (requestOptions.port === this.app.port && requestOptions.host === this.app.hostname) {
      requestOptions.path = `/http://${requestOptions.host}:${requestOptions.port}${requestOptions.path}`
      requestOptions.host = this.rndrHost
      requestOptions.port = this.rndrPort

      // Pass mime type to the rndr server since it cant use mime-types module in phantom
      var mimeType = mime.lookup(path.extname(queueItem.path))
      if (mimeType) {
        requestOptions.headers['X-SPA-Crawler-Content-Type'] = mimeType
      }
    }

    return requestOptions
  }
}

module.exports = Crawler
