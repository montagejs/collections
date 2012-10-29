// Describe Array, List, and SortedSet, all of which have the interface of a
// double-ended queue.  Array and List are proper queues since push and unshift
// put the values at the ends, but for sake of reusing these tests for
// SortedSet, all of these tests maintain the sorted order of the collection.

module.exports = describeDequeue;
function describeDequeue(Collection) {

    describe("add(value)", function () {
        it("should be an alias for push", function () {
            var collection = Collection([1, 2, 3]);
            collection.add(4);
            expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        });
    });

    describe("push(value)", function () {
        it("should add one value to the end", function () {
            var collection = Collection([1, 2, 3]);
            collection.push(4);
            expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        });
    });

    describe("push(...values)", function () {
        it("should add many values to the end", function () {
            var collection = Collection([1, 2, 3]);
            collection.push(4, 5, 6);
            expect(collection.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it("should add many values to the end variadically", function () {
            var collection = Collection([1, 2, 3]);
            collection.push.apply(collection, [4, 5, 6]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });
    });

    describe("unshift(value)", function () {
        it("should add a value to the beginning", function () {
            var collection = Collection([1, 2, 3]);
            collection.unshift(0);
            expect(collection.toArray()).toEqual([0, 1, 2, 3]);
        });
    });

    describe("unshift(...values)", function () {
        it("should add many values to the beginning", function () {
            var collection = Collection([1, 2, 3]);
            collection.unshift(-2, -1, 0);
            expect(collection.toArray()).toEqual([-2, -1, 0, 1, 2, 3]);
        });

        it("should add many values to the beginning", function () {
            var collection = Collection([1, 2, 3]);
            collection.unshift.apply(collection, [-2, -1, 0]);
            expect(collection.toArray()).toEqual([-2, -1, 0, 1, 2, 3]);
        });
    });

    describe("pop()", function () {
        it("should remove one value from the end and return it", function () {
            var collection = Collection([1, 2, 3]);
            expect(collection.pop()).toEqual(3);
            expect(collection.toArray()).toEqual([1, 2]);
        });
    });

    describe("shift()", function () {
        it("should remove one value from the beginning and return it", function () {
            var collection = Collection([1, 2, 3]);
            expect(collection.shift()).toEqual(1);
            expect(collection.toArray()).toEqual([2, 3]);
        });
    });

    describe("concat", function () {
        it("should concatenate variadic mixed-type collections", function () {
            var collection = Collection([1, 2, 3]).concat(
                [4, 5, 6],
                Collection([7, 8, 9])
            );
            expect(collection.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
    });

    describe("slice()", function () {
        var collection = Collection([1, 2, 3, 4]);

        it("should slice all values with no arguments", function () {
            expect(collection.slice()).toEqual([1, 2, 3, 4]);
        });

        it("should slice all after an index", function () {
            expect(collection.slice(2)).toEqual([3, 4]);
        });

        it("should slice from the middle by indexed positions", function () {
            expect(collection.slice(1, 3)).toEqual([2, 3]);
        });

        it("should slice from a negative index", function () {
            expect(collection.slice(-2)).toEqual([3, 4]);
        });

        it("should slice from a negative index to a positive", function () {
            expect(collection.slice(-2, 3)).toEqual([3]);
        });

        it("should slice from a negative index to a negative", function () {
            expect(collection.slice(-2, -1)).toEqual([3]);
        });

        /*
        it("should slice from a negative index to zero", function () {
            expect(collection.slice(-2, 0)).toEqual([]); // Array
            expect(collection.slice(-2, 0)).toEqual([3, 4]); // List
        });
        */

    });

    describe("splice()", function () {

        it("should do nothing with no arguments", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.splice()).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        });

        it("should splice to end with only an offset argument", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.splice(2)).toEqual([3, 4]);
            expect(collection.toArray()).toEqual([1, 2]);
        });

        it("should splice nothing with no length", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.splice(2, 0)).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        });

        it("should splice all values", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.splice(0, collection.length)).toEqual([1, 2, 3, 4]);
            expect(collection.toArray()).toEqual([]);
        });

        it("should splice from negative offset", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.splice(-2)).toEqual([3, 4]);
            expect(collection.toArray()).toEqual([1, 2]);
        });

        it("should inject values at a numeric offset", function () {
            var collection = Collection([1, 2, 5, 6]);
            expect(collection.splice(2, 0, 3, 4)).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it("should replace values at a numeric offset", function () {
            var collection = Collection([1, 2, 3, 6]);
            expect(collection.splice(1, 2, 4, 5)).toEqual([2, 3]);
            expect(collection.toArray()).toEqual([1, 4, 5, 6]);
        });

        it("should inject values with implied position and length", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.splice(null, null, -1, 0)).toEqual([]);
            expect(collection.toArray()).toEqual([-1, 0, 1, 2, 3, 4]);
        });

        it("should append values", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.splice(4, 0, 5, 6)).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });

    });

    describe("swap()", function () {

        it("should do nothing with no arguments", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.swap()).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        });

        it("should splice to end with only an offset argument", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.swap(2)).toEqual([3, 4]);
            expect(collection.toArray()).toEqual([1, 2]);
        });

        it("should splice nothing with no length", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.swap(2, 0)).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        });

        it("should splice all values", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.swap(0, collection.length)).toEqual([1, 2, 3, 4]);
            expect(collection.toArray()).toEqual([]);
        });

        it("should splice from negative offset", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.swap(-2)).toEqual([3, 4]);
            expect(collection.toArray()).toEqual([1, 2]);
        });

        it("should inject values at a numeric offset", function () {
            var collection = Collection([1, 2, 5, 6]);
            expect(collection.swap(2, 0, [3, 4])).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it("should replace values at a numeric offset", function () {
            var collection = Collection([1, 2, 3, 6]);
            expect(collection.swap(1, 2, [4, 5])).toEqual([2, 3]);
            expect(collection.toArray()).toEqual([1, 4, 5, 6]);
        });

        it("should inject values with implied position and length", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.swap(null, null, [-1, 0])).toEqual([]);
            expect(collection.toArray()).toEqual([-1, 0, 1, 2, 3, 4]);
        });

        it("should append values", function () {
            var collection = Collection([1, 2, 3, 4]);
            expect(collection.swap(4, 0, [5, 6])).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });
    });

}

