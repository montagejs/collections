
require("../shim");
require("../dispatch/array-changes");
var describeDequeue = require("./dequeue");
var describeCollection = require("./collection");
var describeMapChanges = require("./dispatch/map-changes");
var GenericCollection = require("../generic-collection");

describe("Array", function () {

    describeDequeue(Array.from);
    describeCollection(Array.from, [1, 2, 3, 4]);
    describeCollection(Array.from, [{id: 0}, {id: 1}, {id: 2}, {id: 3}]);
    describeMapChanges(function (items) {
        var array = [];
        if (items) {
            items.forEach(function (pair) {
                array.set(pair[0], pair[1]);
            });
        }
        return array;
    });

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
    Object.addEach(FakeArray.prototype, GenericCollection);
    FakeArray.prototype.reduce = function (callback, basis) {
        basis = callback(basis, 10, 0, this);
        basis = callback(basis, 20, 1, this);
        basis = callback(basis, 30, 2, this);
        return basis;
    };
    var fakeArray = new FakeArray();

    describe("equals", function () {

        // should have been almost completely tested by Object.equals

        it("should be able to distinguish non-arrays and non-array-like objects", function () {
            expect([].equals(null)).toEqual(false);
        });

        it("should compare itself to an array-like collection", function () {
            expect([10, 20, 30].equals(fakeArray)).toEqual(true);
        });

    });

    describe("compare", function () {

        // contains 10, 20, 30
        it("a fake array should be equal to a real array", function () {
            expect(Object.compare(fakeArray, [10, 20, 30])).toEqual(0);
        });

        it("a fake array should be less than a real array", function () {
            expect(Object.compare(fakeArray, [10, 30])).toEqual(-10);
        });

        it("a fake array should be greater than a real array because it is longer", function () {
            expect(Object.compare(fakeArray, [10, 20])).toEqual(1);
        });

        it("a fake array should be less than a longer but otherwise equal", function () {
            expect(Object.compare(fakeArray, [10, 20, 30, 40])).toEqual(-1);
        });

        it("an array should be equal to a fake array", function () {
            expect([10, 20, 30].compare(fakeArray)).toEqual(0);
        });

        it("an array should be greater than a fake array", function () {
            expect([10, 30].compare(fakeArray)).toEqual(10);
        });

        it("an array should be less than a fake array because it is shorter but otherwise equal", function () {
            expect([10, 20].compare(fakeArray)).toEqual(-1);
        });

        it("an array should be less than a fake array because it is longer but otherwise equal", function () {
            expect([10, 20, 30, 40].compare(fakeArray)).toEqual(1);
        });

    });

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

    describe("find", function () {

        it("should find equivalent objects", function () {
            expect([{a:10}].find({a:10})).toEqual(0);
        });

        it("should allow equality comparison override", function () {
            expect([{a:10}].find({a:10}, Object.is)).toEqual(-1);
        });

    });

    describe("findLast", function () {

        it("should find equivalent objects", function () {
            expect([{a:10}].findLast({a:10})).toEqual(0);
        });

        it("should allow equality comparison override", function () {
            expect([{a:10}].findLast({a:10}, Object.is)).toEqual(-1);
        });

        it("should find the last of equivalent objects", function () {
            var object = {a: 10};
            expect([object, {a: 10}].findLast(object)).toEqual(1);
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

    describe("delete", function () {

        it("should delete values that are present", function () {
            var array = [{a: 10}];
            array["delete"]({a: 10});
            expect(array.length).toEqual(0);
        });

        it("should ignore values that are not present", function () {
            var array = [{b: 20}];
            array["delete"]({a: 10});
            expect(array.length).toEqual(1);
        });

        it("should allow equality override", function () {
            var a = {}, b = {}, c = {};
            var array = [a, b, c];
            array["delete"](b, Object.is);
            expect(array).toEqual([a, c]);
        });

    });

    describe("any", function () {

        var tests = [
            [[0, false], false],
            [["0"], true],
            [[{}], true],
            [[{a: 10}], true],
            [[0, 1, 0], true],
            [[1, 1, 1], true],
            [[true, true, true], true],
            [[0, 0, 0, true], true],
            [[], false],
            [[false, false, false], false]
        ];

        tests.forEach(function (test) {
            it(JSON.stringify(test[0]) + ".any() should be " + test[1], function () {
                expect(test[0].any()).toEqual(test[1]);
            });
        });

    });

    describe("all", function () {

        var tests = [
            [[], true],
            [[true], true],
            [[1], true],
            [[{}], true],
            [[false, true, true, true], false]
        ];

        tests.forEach(function (test) {
            it(JSON.stringify(test[0]) + ".all() should be " + test[1], function () {
                expect(test[0].all()).toEqual(test[1]);
            });
        });

    });

    describe("min", function () {

        it("should find the minimum of numeric values", function () {
            expect([1, 2, 3].min()).toEqual(1);
        });

    });

    describe("max", function () {

        it("should find the maximum of numeric values", function () {
            expect([1, 2, 3].max()).toEqual(3);
        });

    });

    describe("sum", function () {

        it("should compute the sum of numeric values", function () {
            expect([1, 2, 3].sum()).toEqual(6);
        });

        // sum has deprecated behaviors for implicit flattening and
        // property path mapping, not tested here

    });

    describe("average", function () {

        it("should compute the arithmetic mean of values", function () {
            expect([1, 2, 3].average()).toEqual(2);
        });

    });

    describe("flatten", function () {

        it("should flatten an array one level", function () {
            var array = [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]];
            expect(array.flatten()).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [10, 11, 12]
            ]);
        });

    });

    describe("one", function () {

        it("should get the first value", function () {
            expect([0].one()).toEqual(0);
        });

        it("should throw if empty", function () {
            expect(function () {
                [].one();
            }).toThrow();
        });

    });

    describe("only", function () {

        it("should get the first value", function () {
            expect([0].only()).toEqual(0);
        });

        it("should throw if empty", function () {
            expect(function () {
                [].only();
            }).toThrow();
        });

        it("should throw if more than one value", function () {
            expect(function () {
                [1, 2].only();
            }).toThrow();
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
            expect(unsorted.sorted()).toNotBe(unsorted);
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

        it("should clone with depth 0", function () {
            var array = [];
            expect(array.clone(0)).toBe(array);
        });

        it("should clone with depth 1", function () {
            var array = [{}];
            expect(array.clone(1)).toNotBe(array);
            expect(array.clone(1)[0]).toBe(array[0]);
        });

        it("should clone with depth 2", function () {
            var array = [{a: 10}];
            expect(array.clone(2)).toNotBe(array);
            expect(array.clone(2)[0]).toNotBe(array[0]);
            expect(array.clone(2)[0]).toEqual(array[0]);
        });

    });

});

