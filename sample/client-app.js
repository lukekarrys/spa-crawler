var AmpMainView = require('ampersand-main-view')
var View = require('ampersand-view')

var templates = {
  home: function () {
    return [
      '<p>',
      '<a href="/page1">Page 1</a>',
      '<a href="/page3">Page 3</a>',
      '<a href="http://google.com">Google</a>',
      '<a href="http://twitter.com">Twitter</a>',
      '</p>'
    ].join('')
  },
  page1: function () {
    return [
      '<p>',
      '<a href="/page2">Page 2</a>',
      '</p>'
    ].join('')
  },
  page2: function () {
    return [
      '<p>',
      '<a href="/">Home</a>',
      '<a href="/page1">Page 1</a>',
      '</p>'
    ].join('')
  },
  page3: function () {
    return [
      '<p>',
      '<a href="/">Home</a>',
      '<a href="/page1">Page 1</a>',
      '</p>'
    ].join('')
  },
  page404: function () {
    return [
      '<p>',
      'NotFound',
      '</p>'
    ].join('')
  }
}

var dispatchRendered = function () {
  var readyEvent = document.createEvent('Event')
  readyEvent.initEvent('rendered', true, true)
  window.dispatchEvent(readyEvent)
}

var MainView = AmpMainView.extend({
  template: '<div><div data-hook="page"></div></div>',

  updatePage: function (page) {
    AmpMainView.prototype.updatePage.call(this, page)
    dispatchRendered()
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
      this.triggerPage(new View({
        template: templates.home
      }))
    },
    page1: function () {
      this.triggerPage(new View({
        template: templates.page1
      }))
    },
    page2: function () {
      this.triggerPage(new View({
        template: templates.page2
      }))
    },
    page3: function () {
      this.triggerPage(new View({
        template: templates.page3
      }))
    },
    page404: function () {
      this.triggerPage(new View({
        template: templates.page404
      }))
    }
  }
})

require('domready')(function () {
  // eslint-disable-next-line no-new
  new MainView()
})
