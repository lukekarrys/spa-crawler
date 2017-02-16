'use strict'

// The crawler
var Crawler = require('../lib/index')

// Create a server for the single page app
var client = require('./client-server')

// Configure the crawler
var crawler = new Crawler({
  app: 'http://localhost:3000/',
  rndr: { readyEvent: 'rendered' }
})

var start = Date.now()

// Start out crawler when our app is ready and listen for urls
client(3000, (app) => crawler.start().crawler
  .on('spaurl', (url) => console.log(url))
  .on('complete', () => {
    console.log(`Completed in ${(Date.now() - start) / 1000}`)
    crawler.close()
    app.close()
  })
)
