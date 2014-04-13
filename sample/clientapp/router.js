var Backbone = require('backbone');
var PageView = require('human-view');
var templates = require('./templates');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'home',
        'page1': 'page1',
        'page2': 'page2'
    },
    home: function () {
        var Page = PageView.extend({
            pageTitle: 'Home',
            template: templates.home,
            render: function () {
                this.renderAndBind();
            }
        });
        this.trigger('newPage', new Page());
    },
    page1: function () {
        var Page = PageView.extend({
            pageTitle: 'Page 1',
            template: templates.page1,
            render: function () {
                this.renderAndBind();
            }
        });
        this.trigger('newPage', new Page());
    },
    page2: function () {
        var Page = PageView.extend({
            pageTitle: 'Page 2',
            template: templates.page2,
            render: function () {
                this.renderAndBind();
            }
        });
        this.trigger('newPage', new Page());
    }
});
