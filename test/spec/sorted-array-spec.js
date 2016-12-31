
var SortedArray = require("collections/sorted-array");
var describeCollection = require("./collection");
var describeDeque = require("./deque");
var describeOrder = require("./order");
var describeToJson = require("./to-json");

describe("SortedArray-spec", function () {


    describeDeque(SortedArray);
    describeCollection(SortedArray, [1, 2, 3, 4]);
    describeOrder(SortedArray);
    describeToJson(SortedArray, [1, 2, 3, 4]);

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

    describe("incomparable values", function () {
        function customEquals(one, two) {
            return one.id === two.id;
        }

        function customCompare(left, right) {
            if (left.position < right.position) {
                return -1;
            }
            if (left.position > right.position) {
                return 1;
            }
            return 0;
        }

        var a1 = {id: 'A', position: 1};
        var b1 = {id: 'B', position: 1};
        var c1 = {id: 'C', position: 1};

        function createCustomArray(backingArray) {
            // The ordering of incomparable elements is undefined.
            // To control the underlying array it's set directly here.
            var array = new SortedArray([], customEquals, customCompare);
            array.array = backingArray;
            return array;
        }

        it("should find the correct incomparable value in a streak", function () {
            var array = createCustomArray([a1, b1, c1]);
            expect(array.indexOf(a1)).toEqual(0);
            expect(array.indexOf(b1)).toEqual(1);
            expect(array.indexOf(c1)).toEqual(2);
        });

        it("should respect search direction", function () {
            var array = createCustomArray([a1, a1, a1]);
            expect(array.indexOf(a1)).toEqual(0);
            expect(array.lastIndexOf(a1)).toEqual(2);
        });

        it("should work regardless of array size", function () {
            var array = createCustomArray([]);
            expect(array.indexOf(a1)).toEqual(-1);

            array = createCustomArray([a1]);
            expect(array.indexOf(a1)).toEqual(0);

            array = createCustomArray([a1, b1]);
            expect(array.indexOf(a1)).toEqual(0);
            expect(array.indexOf(b1)).toEqual(1);
        });
    });

    // TODO test stability

});
