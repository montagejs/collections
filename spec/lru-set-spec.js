
var LruSet = require("../lru-set");
var describeCollection = require("./collection");
var describeSet = require("./set");

describe("LruSet", function () {

    // construction, has, add, get, delete
    function newLruSet(values) {
        return new LruSet(values);
    }

    [LruSet, newLruSet].forEach(function (LruSet) {
        describeCollection(LruSet, [1, 2, 3, 4], true);
        describeCollection(LruSet, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], true);
        describeSet(LruSet);
    });

});

