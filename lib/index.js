'use strict'

var spawn = require('child_process').spawn
var _ = require('lodash')
var Crawler = require('./crawler')
var phantomjs = require('phantomjs')
var path = require('path')

class SPACrawler {
  constructor (options) {
    this.rndrOptions = _.defaults(options.rndr, require('./rndr-options'))

    this._crawler = new Crawler({
      port: this.rndrOptions.port,
      app: options.app,
      crawler: _.defaults(options.crawler, {
        decodeResponses: true,
        respectRobotsTxt: false,
        downloadUnsupported: false,
        parseScriptTags: false,
        parseHTMLComments: false,
        allowedProtocols: [
          /^http(s)?$/i
        ],
        supportedMimeTypes: [
          /^text\/(html|xhtml)/i,
          /^application\/(html|xhtml)/i
        ],
        discoverRegex: [
          /\s(?:href)\s?=\s?(["']).*?\1/ig,
          /\s(?:href)\s?=\s?[^"'\s][^\s>]+/ig,
          /https?:\/\/[^?\s><'"]+/ig
        ]
      })
    })
  }

  start () {
    this.startRndr()
    return this
  }

  startRndr () {
    var args = [path.join(__dirname, 'rndr.js')]

    // Make args like `--key value` for spawned process
    Object.keys(this.rndrOptions).forEach((key) => {
      args.push('--' + key)
      args.push(this.rndrOptions[key])
    })

    this.rndr = spawn(phantomjs.path, args)
    this.rndr.stdout.on('data', (data) => this.logRndr(data))
    this.rndr.stderr.on('data', (data) => this.logRndr(data))

    /* $lab:coverage:off$ */
    process.on('exit', () => this.close())
    /* $lab:coverage:on$ */
  }

  logRndr (data, type) {
    var dataStr = data.toString().trim().replace(/^\s+|\s+$/g, '')

    if (dataStr === 'server:ready') {
      this._crawler.start()
    } else {
      console.log(`[rndr] ${dataStr}`)
    }

    return dataStr
  }

  close () {
    this.rndr.kill()
  }

  get crawler () {
    return this._crawler.crawler
  }
}

module.exports = SPACrawler
