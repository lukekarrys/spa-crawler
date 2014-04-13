var PageView = require('human-view');
var templates = require('./templates');


module.exports.home = PageView.extend({
    pageTitle: 'Home',
    template: templates.home,
    render: function () {
        this.renderAndBind();
    }
});

module.exports.page1 = PageView.extend({
    pageTitle: 'Page 1',
    template: templates.page1,
    render: function () {
        this.renderAndBind();
    }
});

module.exports.page2 = PageView.extend({
    pageTitle: 'Page 2',
    template: templates.page2,
    render: function () {
        this.renderAndBind();
    }
});
