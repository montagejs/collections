
require("../shim");
require("../observable-array");
var GenericCollection = require("../generic-collection");
var describeDeque = require("./deque");
var describeCollection = require("./collection");
var describeOrder = require("./order");

describe("Array", function () {
    describeDeque(Array.from);
    describeCollection(Array.from, [1, 2, 3, 4]);
    describeCollection(Array.from, [{id: 0}, {id: 1}, {id: 2}, {id: 3}]);
    describeOrder(Array.from);

    /*
        The following tests are from Montage.
        Copyright (c) 2012, Motorola Mobility LLC.
        All Rights Reserved.
        BSD License.
    */

    // contains 10, 20, 30
    function FakeArray() {
        this.length = 3;
    }
    Object.addEach(FakeArray.prototype, GenericCollection.prototype);
    FakeArray.prototype.reduce = function (callback, basis) {
        basis = callback(basis, 10, 0, this);
        basis = callback(basis, 20, 1, this);
        basis = callback(basis, 30, 2, this);
        return basis;
    };
    var fakeArray = new FakeArray();

    // should have been almost completely tested by Object.equals and
    // describeOrder

    // get does not work the same way as most other ordered collections.  it
    // behaves like a map of indicies to values.  others behave like sets.
    describe("get", function () {

        it("should return the value for a given index", function () {
            expect([0].get(0)).toEqual(0);
        });

        it("should not return a named property", function () {
            expect(function () {
                [].get("length");
            }).toThrow();
        });

        it("should not return a named index", function () {
            expect(function () {
                [].get("0");
            }).toThrow();
        });

    });

    // Since these are brute force sought, they do not need to be comparable
    // for arrays, like they would for a SortedArray.  These tests would apply
    // to lists as well, but lists do not have indicies.

    describe("findValue", function () {

        it("should find equivalent objects", function () {
            expect([{a:10}].findValue({a:10})).toEqual(0);
        });

        it("should allow equality comparison override", function () {
            expect([{a:10}].findValue({a:10}, Object.is)).toEqual(-1);
        });

    });

    describe("findLastValue", function () {

        it("should find equivalent objects", function () {
            expect([{a:10}].findLastValue({a:10})).toEqual(0);
        });

        it("should allow equality comparison override", function () {
            expect([{a:10}].findLastValue({a:10}, Object.is)).toEqual(-1);
        });

        it("should find the last of equivalent objects", function () {
            var object = {a: 10};
            expect([object, {a: 10}].findLastValue(object)).toEqual(1);
        });

    });

    describe("has", function () {

        it("should find equivalent objects", function () {
            expect([{a: 10}].has({a: 10})).toBe(true);
        });

        it("should not find non-contained values", function () {
            expect([].has(-1)).toBe(false);
        });

        it("should allow equality comparison override", function () {
            var object = {};
            expect([{}].has(object, Object.is)).toBe(false);
            expect([object].has(object, Object.is)).toBe(true);
        });

    });

    describe("add", function () {

        it("should add values", function () {
            var array = [{a: 10}];
            array.add({a: 10});
            expect(array[0]).toEqual({a: 10});
            expect(array[1]).toEqual({a: 10});
            expect(array.has({a: 10})).toBe(true);
        });

    });

    describe("sorted", function () {
        var a = {foo: [1, 4]},
            b = {foo: [2, 3]},
            c = {foo: [2, 3]},
            d = {foo: [3, 2]},
            e = {foo: [4]},
            unsorted = [d, b, c, a, e], // b and c equal, in stable order
            sorted = [a, b, c, d, e],
            byFoo = Function.by(function (x) {
                return x.foo;
            });

        it("should not be an in-place sort", function () {
            expect(unsorted.sorted()).not.toBe(unsorted);
        });

        it("should sort objects by a property array", function () {
            expect(unsorted.sorted(byFoo)).toEqual(sorted);
            unsorted.sorted(byFoo).forEach(function (x, i) {
                expect(x).toBe(sorted[i]);
            });
        });

    });

    describe("clone", function () {

        // should have been adequately covered by Object.clone tests

        it("should clone with indefinite depth", function () {
            var array = [[[]]];
            var clone = array.clone();
            expect(clone).toEqual(array);
            expect(clone).not.toBe(array);
        });

        it("should clone with depth 0", function () {
            var array = [];
            expect(array.clone(0)).toBe(array);
        });

        it("should clone with depth 1", function () {
            var array = [{}];
            expect(array.clone(1)).not.toBe(array);
            expect(array.clone(1)[0]).toBe(array[0]);
        });

        it("should clone with depth 2", function () {
            var array = [{a: 10}];
            expect(array.clone(2)).not.toBe(array);
            expect(array.clone(2)[0]).not.toBe(array[0]);
            expect(array.clone(2)[0]).toEqual(array[0]);
        });

    });

    describe("zip", function () {
        it("should treat holes as undefined", function () {
            var a = [0, 1];
            var b = [];
            b[1] = 'b';
            expect(a.zip(b)).toEqual([
                [0],
                [1, 'b']
            ]);
        });
    });

    describe("group", function () {
        it("should make a histogram", function () {

            var groups = [
                {x: 0},
                {x: 1},
                {x: 2},
                {x: 3}
            ].group(function (object) {
                return Math.floor(object.x / 2);
            })
            expect(groups).toEqual([
                [0, [{x: 0}, {x: 1}]],
                [1, [{x: 2}, {x: 3}]]
            ]);

        });
    });

    describe("swap", function () {
        var array, otherArray;
        beforeEach(function () {
            array = [1, 2, 3];
        });

        it("grows", function () {
            array.swap(3, 0, [4, 5, 6]);
            expect(array).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it("grows with some removed", function () {
            array.swap(1, 2, [4, 5, 6]);
            expect(array).toEqual([1, 4, 5, 6]);
        });

        it("grows from beyond length", function () {
            array.swap(4, 0, [1]);
            expect(array).toEqual([1, 2, 3, , 1]);
        });

        it("grows from beyond length truncating removal", function () {
            array.swap(4, 1, [1]);
            expect(array).toEqual([1, 2, 3, , 1]);
        });

        it("shrinks", function () {
            array.swap(1, 1);
            expect(array).toEqual([1, 3]);
        });

        it("shrinks with some added", function () {
            array.swap(1, 2, [4]);
            expect(array).toEqual([1, 4]);
        });

        it("copies a hole", function () {
            array.swap(1, 1, [,]);
            expect(array).toEqual([1, , 3]);
        });

        it("copies holes", function () {
            array.swap(1, 1, [,,]);
            expect(array).toEqual([1, , , 3]);
        });

        it("sets within", function () {
            array.set(1, 4);
            expect(array).toEqual([1, 4, 3]);
        });

        it("sets without", function () {
            array.set(4, 4);
            expect(array).toEqual([1, 2, 3, , 4]);
        });

        it("can replace content with content of another arraylike", function () {
            otherArray = { __proto__ : Array.prototype };
            otherArray[0] = 4;
            otherArray[1] = 5;
            otherArray.length = 2;
            array.swap(0, array.length, otherArray);
            expect(array).toEqual([4, 5]);
        });

        it("should ignore non array like plus value", function () {
            array.swap(0, array.length, 4);
            expect(array).toEqual([]);

        });

        it("should ignore extra arguments", function () {
            array.swap(0, array.length, 4, 5, 6);
            expect(array).toEqual([]);
        });

        it("works with large arrays", function () {
            otherArray = new Array(200000);
            expect(function () {
                array.swap(0, array.length, otherArray);
            }).not.toThrow();
            expect(array.length).toEqual(200000);
        });

   });

});

