
var SortedArray = require("../sorted-array");
var describeDequeue = require("./dequeue");
var describeCollection = require("./collection");

describe("SortedArray", function () {

    function newSortedArray(values) {
        return new SortedArray(values);
    }

    [SortedArray, newSortedArray].forEach(function (SortedArray) {
        describeDequeue(SortedArray);
        describeCollection(SortedArray, [1, 2, 3, 4]);
    });

    describe("non-uniqueness", function () {
        var array = SortedArray([1, 2, 3, 1, 2, 3]);
        expect(array.slice()).toEqual([1, 1, 2, 2, 3, 3]);
    });

    // TODO test stability

});

