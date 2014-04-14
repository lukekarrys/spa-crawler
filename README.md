spa-crawler
===========

[![NPM](https://nodei.co/npm/spa-crawler.png)](https://nodei.co/npm/spa-crawler/)
[![Build Status](https://travis-ci.org/lukekarrys/spa-crawler.png?branch=master)](https://travis-ci.org/lukekarrys/spa-crawler)

**Crawl 100% JS single page apps with phantomjs and node.**

## Install

1. [Install PhantomJS](http://phantomjs.org/download.html)
2. `npm install spa-crawler --save`


## Why?

Single page apps are great (at a lot of things), but not so great at others. One of those not-so-great things is that they aren't easily crawlable. This is a module that uses `phantomjs` and node to crawl single page apps.

*Note: if you find that you really badly need to crawl your single page app, a single page app might not be the best solution to whatever problem you are trying to solve.*

That being said, I think the fact that this is possible is just really cool and that's why I built it.


## Usage

Here's an example to use this in conjunction with [`moonboots-express`](https://github.com/lukekarrys/moonboots-express) which is a module that streamlines single page app development in Express. You can run this example with `npm start`.

```js
// For the single page app
var Moonboots = require('moonboots-express');
var express = require('express');
var app = express();

// The crawler
var Crawler = require('..');

// Create a server for the single page app
var moonboots = new Moonboots({
    server: app,
    moonboots: {
        main: __dirname + '/clientapp/app.js',
        libraries: [__dirname + '/../node_modules/jquery/dist/jquery.js'],
        stylesheets: [__dirname + '/clientapp/styles.css']
    }
});
app.listen(3010);

// Configure the crawler
var spaCrawler = new Crawler({
    // Passed directly to `rndr-me`
    rndr: {
        // The single page app should emit this event
        // when it is done rendering each page
        readyEvent: 'rendered'
    },
    // The initial url of the single page app
    app: 'http://127.0.0.1:3010/'
});


// Start out crawler when our app is ready and listen for urls
moonboots.on('ready', function () {
    spaCrawler.start().crawler
        // Log each url
        .on('spaurl', console.log)
        // When the crawler is done, stop and kill the process
        .on('complete', spaCrawler.stop.bind(spaCrawler, true));
});
```

The above code will output:

```
$ npm start

http://127.0.0.1:3010/
http://127.0.0.1:3010/page1
http://127.0.0.1:3010/page3
http://127.0.0.1:3010/page2
```

The single page app in the example above is in `sample/clientapp`. Check out the code or run `npm run sample-server` and go to [http://127.0.0.1:3010](http://127.0.0.1:3010) to see what the rendered HTML looks like. Also check out the source to see that it's just a `<script>` tag.


## API

### Options

- `app` (required): This is the url of the initial page of the single page app that you wish to crawl.
- `rndr` (default `{}`): This object is passed directly to [`rndr-me`](https://github.com/jed/rndr.me). You can use all the [options](https://github.com/jed/rndr.me#api) that are available in its documentation.
- `crawler` (default: `{}`): This object is passed directly to [`simplecrawler`](https://github.com/cgiffard/node-simplecrawler). You can use all the [options](https://github.com/cgiffard/node-simplecrawler#configuring-the-crawler) that are available in its documentation, **except** `host`, `initialPath`, `initialPort`, and `initialProtocol`. You should use the `app` option to specify these.

### Events

Each instance of `spa-crawler` will have a `crawler` property. This property will emit all the same [events](https://github.com/cgiffard/node-simplecrawler#events) as `simplecrawler`. There is also one additional event:

- `spaurl` (url): Fired for each unique `url` found within the single page app.

### Methods

- `start`: Starts the `rndr-me` server and the crawler.
- `stop` (kill): Stops (and kills) the `rndr-me` spawned process. Also optionally `kill`s the parent process.


## Test

Run `npm test` (yeah...sorry, this is coming soon).


## Sample

Run `npm start` to see the sample crawler run. Or run `npm run sample-server` to examine the sample single page app at [http://127.0.0.1:3010](http://127.0.0.1:3010).


#License

MIT