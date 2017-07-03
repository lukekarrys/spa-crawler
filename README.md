spa-crawler
===========

**Crawl 100% JS single page apps with phantomjs and node.**

[![NPM](https://nodei.co/npm/spa-crawler.png)](https://nodei.co/npm/spa-crawler/)
[![Build Status](https://travis-ci.org/lukekarrys/spa-crawler.png?branch=master)](https://travis-ci.org/lukekarrys/spa-crawler)
[![Greenkeeper badge](https://badges.greenkeeper.io/lukekarrys/spa-crawler.svg)](https://greenkeeper.io/)


## Install

`npm install spa-crawler --save`


## Why?

Single page apps are great (at a lot of things), but not so great at others. One of those not-so-great things is that they aren't easily crawlable. This is a module that uses `phantomjs` and node to crawl single page apps.

*Note: if you find that you really badly need to crawl your single page app, a single page app might not be the best solution to whatever problem you are trying to solve.*

That being said, I think the fact that this is possible is just really cool and that's why I built it.


## Usage

Here's an example of how you'd crawl a local single page app. You can check out the [`sample`](./sample) directory for an example that uses this in conjunction with [`moonboots-express`](https://github.com/lukekarrys/moonboots-express) which is a module that streamlines single page app development in Express. You can run this example with `npm start`.

```js
var Crawler = require('spa-crawler')

var crawler = new Crawler({
  rndr: {
    // The single page app should emit this event
    // when it is done rendering each page
    readyEvent: 'rendered'
  },
  // The initial url of the single page app
  app: 'http://localhost:3000'
})

// Start out crawler when your app is ready and listen for urls
crawler.start().crawler
  // Log each url
  .on('spaurl', console.log.bind(console))
  // When the crawler is done, kill the process
  .on('complete', () => process.exit(0))
```

The above code will output:

```
$ npm start

http://localhost:3000/
http://localhost:3000/page1
http://localhost:3000/page3
http://localhost:3000/page2
```

The single page app in the example above is in `sample/client-app`. Check out the code or run `npm run start:client` and go to [http://localhost:3000](http://localhost:3000) to see what the rendered HTML looks like. Also check out the source to see that it's just a `<script>` tag.


## API

### Options

- `app` (required): This is the url of the initial page of the single page app that you wish to crawl.
- `rndr` (default `{}`): This object is passed directly to [`rndr-me`](https://github.com/jed/rndr.me). You can use all the [options](https://github.com/jed/rndr.me#api) that are available in its documentation. *Note: there is a default port `8001` and a default readyEvent `load` that will be set on the rndr server.*
- `crawler` (default: `{}`): This object is passed directly to [`simplecrawler`](https://github.com/cgiffard/node-simplecrawler). You can use all the [options](https://github.com/cgiffard/node-simplecrawler#configuring-the-crawler) that are available in its documentation.

### rndr-me

`spa-crawler` utilizes [`rndr-me`](https://github.com/jed/rndr.me), which has a very apt description "an HTTP server that uses PhantomJS to render HTML".

One caveat to using it this way, is that you will almost always want to use the `readyEvent` option. See the [api](https://github.com/jed/rndr.me#api) for specific instructions on how to do that.

This is because most single page apps will not be ready when the `window.load` event fires (which is what `rndr-me` listens to by default). In my tests even the most basic use of `Backbone` + writing to the DOM once had race conditions where it wouldn't always be ready.

### Events

Each instance of `spa-crawler` will have a `crawler` property. This property will emit all the same [events](https://github.com/cgiffard/node-simplecrawler#events) as `simplecrawler`. There is also one additional event:

- `spaurl` (url): Fired for each unique `url` found within the single page app.

### Methods

- `start`: Starts the `rndr-me` server and the crawler.
- `close`: Kills the `rndr-me` server.

## Test

Run `npm test`.


## Sample

Run `npm start` to see the sample crawler run. Or run `npm run start:client` to examine the sample single page app at [http://localhost:3000](http://localhost:3000).


#License

MIT
