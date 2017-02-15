/* eslint-env phantomjs */

var webserver = require('webserver')
var webpage = require('webpage')
var url = require('url')

var argv = require('minimist')(require('system').args.slice(1), {
  alias: {
    'maxTime': 'max_time',
    'maxBytes': 'max_bytes',
    'readyEvent': 'ready_event',
    'loadImages': 'load_images'
  }
})

var config = require('./rndr-options')

for (var a in argv) {
  if (argv[a] === 'true' || argv[a] === 'false') {
    config[a] = argv[a] === 'true'
  } else {
    config[a] = argv[a]
  }
}

if (!config.port) {
  console.error('No port specified')
  phantom.exit(1)
}

var server = webserver.create()
var listening = server.listen(config.port, onRequest)

if (!listening) {
  console.error('Could not bind to port ' + config.port)
  phantom.exit(1)
} else {
  console.log('server:ready')
}

function onRequest (req, res) {
  var page = webpage.create()
  var bytesConsumed = 0

  if (req.method !== 'GET') {
    return send(405, toHTML('Method not accepted.'))
  }

  var contentType = req.headers['X-SPA-Crawler-Content-Type'] || 'text/html'
  var href = url.parse(req.url).pathname.slice(1)

  if (!href) {
    return send(400, toHTML('`href` parameter is missing.'))
  }

  var maxTime = config.maxTime
  var maxBytes = config.maxBytes
  var readyEvent = config.readyEvent
  var loadImages = config.loadImages

  page.settings.loadImages = loadImages

  page.onError = function (err) {
    console.error(err)
  }

  page.onInitialized = function () {
    page.evaluate(onInit, readyEvent)

    function onInit (readyEvent) {
      window.addEventListener(readyEvent, function () {
        setTimeout(window.callPhantom, 0)
      })
    }
  }

  page.onResourceReceived = function (resource) {
    if (resource.bodySize) bytesConsumed += resource.bodySize

    if (bytesConsumed > maxBytes) {
      send(502, toHTML('More than ' + maxBytes + 'consumed.'))
    }
  }

  page.onCallback = function () {
    send(200, page.content)
  }

  var timeout = setTimeout(page.onCallback, maxTime)

  page.open(href)

  function send (statusCode, data) {
    clearTimeout(timeout)

    res.statusCode = statusCode

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', byteLength(data))
    res.setHeader('X-Rndrme-Bytes-Consumed', bytesConsumed.toString())

    res.write(data)
    res.close()

    page.close()
  }
}

function byteLength (str) {
  return encodeURIComponent(str).match(/%..|./g).length
}

function toHTML (message) {
  return '<!DOCTYPE html><body>' + message + '</body>\n'
}
