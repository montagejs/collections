
var Set = require("../set");
var describeCollection = require("./collection");

describe("Set", function () {

    function newSet(values) {
        return new Set(values);
    }

    [Set, newSet].forEach(function (Set) {
        describeCollection(Set, [1, 2, 3, 4], true);
        describeCollection(Set, [{}, {}, {}, {}], true);
    });

});

