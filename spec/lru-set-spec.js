
var LruSet = require("../lru-set");
var describeCollection = require("./collection");

describe("LruSet", function () {

    // construction, has, add, get, delete
    function newLruSet(values) {
        return new LruSet(values);
    }

    [LruSet, newLruSet].forEach(function (LruSet) {
        describeCollection(LruSet, [1, 2, 3, 4], true);
        describeCollection(LruSet, [{}, {}, {}, {}], true);
    });

});

