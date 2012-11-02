
var Set = require("../set");
var describeCollection = require("./collection");
var describeSet = require("./set");

describe("Set", function () {

    function newSet(values) {
        return new Set(values);
    }

    [Set, newSet].forEach(function (Set) {
        describeCollection(Set, [1, 2, 3, 4], true);
        describeCollection(Set, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], true);
        describeSet(Set);
    });

    describeCollection(function (values) {
        return Set(values, Object.is);
    }, [{}, {}, {}, {}], true);

});

