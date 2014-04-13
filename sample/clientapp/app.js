var Backbone = require('backbone');
Backbone.$ = window.jQuery;
var Router = require('./router');
var MainView = require('./main');


module.exports = {
    blastoff: function () {
        var self = this;

        this.router = new Router();
        this.history = Backbone.history;

        $(function () {
            var mainView = new MainView({
                el: document.body
            }).render();
            self.router.on('newPage', mainView.setPage, mainView);
            self.history.start({pushState: true, root: '/'});
        });
    }
};

module.exports.blastoff();
