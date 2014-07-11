
var SortedArraySet = require("../sorted-array-set");
var describeDeque = require("./deque");
var describeCollection = require("./collection");
var describeSet = require("./set");
var describeToJson = require("./to-json");

describe("SortedArraySet", function () {

    function newSortedArraySet(values) {
        return new SortedArraySet(values);
    }

    newSortedArraySet.prototype.isSorted = true;

    [SortedArraySet, newSortedArraySet].forEach(function (SortedArraySet) {
        describeDeque(SortedArraySet);
        describeCollection(SortedArraySet, [1, 2, 3, 4]);
        describeSet(SortedArraySet);
        describeToJson(SortedArraySet, [1, 2, 3, 4]);
    });

    describe("uniqueness", function () {
        var set = SortedArraySet([1, 2, 3, 1, 2, 3]);
        expect(set.slice()).toEqual([1, 2, 3]);
    });

});

