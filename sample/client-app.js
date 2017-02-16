var AmpMainView = require('ampersand-main-view')
var View = require('ampersand-view')
var domready = require('domready')

var triggerPage = function (template) {
  this.triggerPage(new View({
    template: function () {
      return '<p>' + (Array.isArray(template) ? template.join('') : template) + '</p>'
    }
  }))
}

var MainView = AmpMainView.extend({
  template: '<div data-hook="page"></div>',
  updatePage: function (page) {
    AmpMainView.prototype.updatePage.call(this, page)
    var readyEvent = document.createEvent('Event')
    readyEvent.initEvent('rendered', true, true)
    window.dispatchEvent(readyEvent)
  },
  router: {
    routes: {
      '': 'home',
      'page1': 'page1',
      'page2': 'page2',
      'page3': 'page3',
      '*notFound': 'page404'
    },
    home: function () {
      triggerPage.call(this, [
        '<a href="/page1">Page 1</a>',
        '<a href="/page3">Page 3</a>',
        '<a href="http://google.com">Google</a>',
        '<a href="http://twitter.com">Twitter</a>',
        '<a href="http://localhost:3011">Different port</a>'
      ])
    },
    page1: function () {
      triggerPage.call(this, '<a href="/page2">Page 2</a>')
    },
    page2: function () {
      triggerPage.call(this, [
        '<a href="/">Home</a>',
        '<a href="/page1">Page 1</a>'
      ])
    },
    page3: function () {
      triggerPage.call(this, [
        '<a href="/">Home</a>',
        '<a href="/page1">Page 1</a>',
        '<a href="/page2">Page 2</a>'
      ])
    },
    page404: function () {
      triggerPage.call(this, 'Not Found')
    }
  }
})

// eslint-disable-next-line no-new
domready(function () { new MainView() })
