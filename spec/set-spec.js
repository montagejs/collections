
var Set = require("../set");
var describeCollection = require("./collection");
var describeSet = require("./set");

describe("Set", function () {

    function newSet(values) {
        return new Set(values);
    }

    [Set, newSet].forEach(function (Set) {
        describeCollection(Set, [1, 2, 3, 4], true);
        describeCollection(Set, [{}, {}, {}, {}], true);
        describeSet(Set);
    });

});

