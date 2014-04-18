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
        '<a href="http://google.com">Google</a>',
        '<a href="http://twitter.com">Twitter</a>',
        '<a href="http://lukekarrys.com?href=http%3A%2F%2Flukekarrys.com">Test</a>',
        '<a href="/?href=http%3A%2F%2Flukekarrys.com">Test</a>',
        '<a href="http://127.0.0.1:3010?href=http%3A%2F%2Flukekarrys.com">Test</a>',
        '<a href="http://localhost:3010?href=http%3A%2F%2Flukekarrys.com">Test</a>',
        '<a href="http://localhost:3001?href=http%3A%2F%2Flukekarrys.com">Test</a>',
        '<a href="http://127.0.0.1:3001?href=http%3A%2F%2Flukekarrys.com">Test</a>',
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