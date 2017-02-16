'use strict'

var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Crawler = require('../lib/index')
var clientServer = require('../sample/client-server')

var port = 3000

lab.experiment('Crawler', () => {
  var client
  var crawler

  lab.before((done) => clientServer(port, (app) => {
    client = app
    done()
  }))

  lab.after((done) => {
    client.close()
    crawler.close()
    done()
  })

  lab.test('Emits with a custom event and url', (done) => {
    var urls = []
    var host = `http://localhost:${port}`
    var expectedUrls = ['/', '/page1', '/page2', '/page3']

    crawler = new Crawler({
      app: host,
      rndr: { readyEvent: 'rendered' }
    })

    crawler.start().crawler
      .on('spaurl', (url) => urls.push(url))
      .on('complete', () => {
        Code.expect(urls.sort()).to.equal(expectedUrls.map((url) => host + url))
        done()
      })
  })

  lab.test('Errors without a port', (done) => {
    var host = `http://localhost:${port}`

    class ErrorCrawler extends Crawler {
      logRndr (data, type) {
        data = super.logRndr(data, type)
        Code.expect(data).to.equal('Could not bind to port null')
        done()
      }
    }

    crawler = new ErrorCrawler({
      app: host,
      rndr: { port: null }
    })

    crawler.start()
  })
})
