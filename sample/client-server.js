var Moonboots = require('moonboots-express')
var express = require('express')
var path = require('path')
var app = express()

var env = process.env.NODE_ENV

function runMoonboots (port, cb) {
  var moonboots = new Moonboots({
    server: app,
    moonboots: {
      main: path.join(__dirname, 'client-app.js'),
      stylesheets: [path.join(__dirname, 'styles.css')],
      developmentMode: env !== 'production' && env !== 'test'
    }
  })

  var listener = app.listen(port)

  return moonboots.on('ready', () => cb(listener))
}

if (require.main === module) {
  runMoonboots(3010)
} else {
  module.exports = runMoonboots
}
