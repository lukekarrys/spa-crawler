var templates = {};

templates.body = function () {
    return [
        '<body>',
        '<div class="container">',
        '<div id="pages" role="page-container">',
        '</div>',
        '</div>',
        '</body>'
    ].join('');
};

templates.home = function () {
    return [
        '<p>',
        '<a href="/page1">Page 1</a>',
        '<a href="/page3">Page 3</a>',
        '</p>'
    ].join('');
};

templates.page1 = function () {
    return [
        '<p>',
        '<a href="/page2">Page 2</a>',
        '</p>'
    ].join('');
};

templates.page2 = function () {
    return [
        '<p>',
        '<a href="/">Home</a>',
        '<a href="/page1">Page 1</a>',
        '</p>'
    ].join('');
};

templates.page3 = function () {
    return [
        '<p>',
        '<a href="/">Home</a>',
        '<a href="/page1">Page 1</a>',
        '</p>'
    ].join('');
};

module.exports = templates;