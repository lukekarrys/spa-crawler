var HumanView = require('human-view');
var ViewSwitcher = require('human-view-switcher');
var _ = require('lodash');
var templates = require('./templates');


module.exports = HumanView.extend({
    template: templates.body,
    render: function () {
        this.renderAndBind();
        this.pageSwitcher = new ViewSwitcher(this.getByRole('page-container'), {
            show: function (newView) {
                document.title = _.result(newView, 'pageTitle');
            }
        });
        return this;
    },
    setPage: function (view) {
        this.pageSwitcher.set(view);
        var readyEvent = document.createEvent("Event");
        readyEvent.initEvent("renderReady", true, true);
        window.dispatchEvent(readyEvent);
    }
});
