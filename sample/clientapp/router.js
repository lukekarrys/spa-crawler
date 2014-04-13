var Backbone = require('backbone');
var Pages = require('./pages');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'home',
        'page1': 'page1',
        'page2': 'page2'
    },
    home: function () {
        this.trigger('newPage', new Pages.home());
    },
    page1: function () {
        this.trigger('newPage', new Pages.page1());
    },
    page2: function () {
        this.trigger('newPage', new Pages.page2());
    }
});
