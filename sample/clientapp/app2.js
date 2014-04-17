/* global app */
var Backbone = require('backbone');
Backbone.$ = window.jQuery;
var Router = require('./router');
var MainView = require('./main2');


module.exports = {
    blastoff: function () {
        var self = window.app = this;

        this.router = new Router();
        this.history = Backbone.history;

        $(function () {
            var mainView = new MainView({
                el: document.body
            }).render();
            self.router.on('newPage', mainView.setPage, mainView);
            self.history.start({pushState: true, root: '/'});
        });
    },
    navigate: function (page) {
        var url = (page.charAt(0) === '/') ? page.slice(1) : page;
        app.history.navigate(url, {trigger: true});
    }
};

module.exports.blastoff();
