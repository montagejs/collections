
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
        it("should retain non-unique values", function () {
            var array = SortedArray([1, 2, 3, 1, 2, 3]);
            expect(array.slice()).toEqual([1, 1, 2, 2, 3, 3]);
        });
    });

    describe("deleteAll", function () {
        it("should delete a range of equivalent values", function () {
            var array = SortedArray([1, 1, 1, 2, 2, 2, 3, 3, 3]);
            expect(array.deleteAll(2)).toBe(3);
            expect(array.toArray()).toEqual([1, 1, 1, 3, 3, 3]);
        });
        it("deletes all equivalent values for an alternate relation", function () {
            var equivalent = function (a, b) {
                return a % 2 === b % 2;
            };
            var collection = SortedArray([1, 2, 3, 4, 5]);
            expect(collection.deleteAll(2, equivalent)).toBe(2);
            expect(collection.toArray()).toEqual([1, 3, 5]);
            expect(collection.length).toBe(3);
        });
    });

    // TODO test stability

});

