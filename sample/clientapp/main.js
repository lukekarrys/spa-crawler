/* global app */
var HumanView = require('human-view');
var ViewSwitcher = require('human-view-switcher');
var _ = require('lodash');
var templates = require('./templates');


module.exports = HumanView.extend({
    template: templates.body,
    events: {
        'click a[href]': 'handleLinkClick'
    },
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
        readyEvent.initEvent("rendered", true, true);
        window.dispatchEvent(readyEvent);
    },
    handleLinkClick: function (e) {
        var t = $(e.target);
        var $a = t.is('a') ? t : t.closest('a');
        var aEl = $a[0];
        var local = window.location.host === aEl.host;
        var path = $a.attr('href');
        var isKeyModified = e.metaKey || e.ctrlKey || e.shiftKey;

        if (local && !isKeyModified && path.charAt(0) !== '#') {
            app.navigate(path);
            return false;
        }
    },
});
