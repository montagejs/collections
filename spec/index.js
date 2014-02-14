
// "Isomprphic" test suite runner. This can be executed either:
//     run node test/index.js
//     or visit test/index.html (which loads this with Mr)

var Suite = require("jasminum/suite");

var suite = new Suite("Q").describe(function () {
    require("./shim-object-spec");
    require("./shim-functions-spec");
    require("./array-spec");
    require("./clone-spec");
    require("./deque-spec");
    require("./dict-spec");
    require("./fast-map-spec");
    require("./fast-set-spec");
    require("./heap-spec");
    require("./iterator-spec");
    require("./list-spec");
    require("./lru-map-spec");
    require("./lru-set-spec");
    require("./map-spec");
    require("./observable-array-spec");
    require("./observable-map-spec");
    require("./observable-object-spec");
    require("./observable-range-spec");
    require("./regexp-spec");
    require("./set-spec");
    require("./sorted-array-map-spec");
    require("./sorted-array-set-spec");
    require("./sorted-array-spec");
    require("./sorted-map-spec");
    require("./sorted-set-spec");
});

suite.runAndReportSync();

