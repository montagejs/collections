
var SortedArraySet = require("../sorted-array-set");
var describeDeque = require("./deque");
var describeCollection = require("./collection");
var describeSet = require("./set");

describe("SortedArraySet", function () {

    function newSortedArraySet(values) {
        return new SortedArraySet(values);
    }

    newSortedArraySet.prototype.isSorted = true;

    [SortedArraySet, newSortedArraySet].forEach(function (SortedArraySet) {
        describeDeque(SortedArraySet);
        describeCollection(SortedArraySet, [1, 2, 3, 4]);
        describeSet(SortedArraySet);
    });

    describe("constructor", function () {
        it("only allows unique values", function () {
            var set = SortedArraySet([1, 2, 3, 1, 2, 3]);
            expect(set.slice()).toEqual([1, 2, 3]);
        });
    });

});

