
var SortedArray = require("../sorted-array");
var describeCollection = require("./collection");
var describeDeque = require("./deque");
var describeOrder = require("./order");
var describeToJson = require("./to-json");

describe("SortedArray", function () {

    function newSortedArray(values) {
        return new SortedArray(values);
    }

    newSortedArray.prototype = SortedArray.prototype;

    [SortedArray, newSortedArray].forEach(function (SortedArray) {
        describeDeque(SortedArray);
        describeCollection(SortedArray, [1, 2, 3, 4]);
        describeOrder(SortedArray);
        describeToJson(SortedArray, [1, 2, 3, 4]);
    });

    describe("non-uniqueness", function () {
        var array = SortedArray([1, 2, 3, 1, 2, 3]);
        expect(array.slice()).toEqual([1, 1, 2, 2, 3, 3]);
    });

    // TODO test stability

});

