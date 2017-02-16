var Moonboots = require('moonboots-express')
var express = require('express')
var path = require('path')
var app = express()

function runMoonboots (port, cb) {
  var moonboots = new Moonboots({
    server: app,
    moonboots: {
      main: path.join(__dirname, 'client-app.js'),
      stylesheets: [path.join(__dirname, 'styles.css')],
      developmentMode: false
    }
  })

  var listener = app.listen(port)

  return moonboots.on('ready', () => cb(listener))
}

module.exports = runMoonboots
