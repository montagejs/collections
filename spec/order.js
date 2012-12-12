
var GenericCollection = require("../generic-collection");

module.exports = describeOrder;
function describeOrder(Collection) {

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

    describe("equals", function () {

        it("should equal itself", function () {
            var collection = Collection([1, 2]);
            expect(collection.equals(collection)).toBe(true);
        });

        it("should be able to distinguish incomparable objects", function () {
            expect(Collection([]).equals(null)).toEqual(false);
        });

        it("should compare itself to an array-like collection", function () {
            expect(Collection([10, 20, 30]).equals(fakeArray)).toEqual(true);
        });

    });

    describe("compare", function () {

        it("should compare to itself", function () {
            var collection = Collection([1, 2]);
            expect(collection.compare(collection)).toBe(0);
        });

        // contains 10, 20, 30
        it("a fake array should be equal to collection", function () {
            expect(Object.compare(fakeArray, Collection([10, 20, 30]))).toEqual(0);
        });

        it("a fake array should be less than a collection", function () {
            expect(Object.compare(fakeArray, Collection([10, 30]))).toEqual(-10);
        });

        it("a fake array should be greater than a real array because it is longer", function () {
            expect(Object.compare(fakeArray, Collection([10, 20]))).toEqual(1);
        });

        it("a fake array should be less than a longer but otherwise equal", function () {
            expect(Object.compare(fakeArray, Collection([10, 20, 30, 40]))).toEqual(-1);
        });

        it("an array should be equal to a fake array", function () {
            expect(Collection([10, 20, 30]).compare(fakeArray)).toEqual(0);
        });

        it("an array should be greater than a fake array", function () {
            expect(Collection([10, 30]).compare(fakeArray)).toEqual(10);
        });

        it("an array should be less than a fake array because it is shorter but otherwise equal", function () {
            expect(Collection([10, 20]).compare(fakeArray)).toEqual(-1);
        });

        it("an array should be less than a fake array because it is longer but otherwise equal", function () {
            expect(Collection([10, 20, 30, 40]).compare(fakeArray)).toEqual(1);
        });

    });

    describe("find", function () {

        it("should find equivalent values", function () {
            expect(Collection([10, 10, 10]).find(10)).toEqual(0);
        });

    });

    describe("findLast", function () {

        it("should find equivalent values", function () {
            expect(Collection([10, 10, 10]).findLast(10)).toEqual(2);
        });

    });

    describe("has", function () {

        it("should find equivalent values", function () {
            expect(Collection([10]).has(10)).toBe(true);
        });

        it("should not find non-contained values", function () {
            expect(Collection([]).has(-1)).toBe(false);
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
                expect(Collection(test[0]).any()).toEqual(test[1]);
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
                expect(Collection(test[0]).all()).toEqual(test[1]);
            });
        });

    });

    describe("min", function () {

        it("should find the minimum of numeric values", function () {
            expect(Collection([1, 2, 3]).min()).toEqual(1);
        });

    });

    describe("max", function () {

        it("should find the maximum of numeric values", function () {
            expect(Collection([1, 2, 3]).max()).toEqual(3);
        });

    });

    describe("sum", function () {

        it("should compute the sum of numeric values", function () {
            expect(Collection([1, 2, 3]).sum()).toEqual(6);
        });

        // sum has deprecated behaviors for implicit flattening and
        // property path mapping, not tested here

    });

    describe("average", function () {

        it("should compute the arithmetic mean of values", function () {
            expect(Collection([1, 2, 3]).average()).toEqual(2);
        });

    });

    describe("flatten", function () {

        it("should flatten an array one level", function () {
            var collection = Collection([
                [[1, 2, 3], [4, 5, 6]],
                Collection([[7, 8, 9], [10, 11, 12]])
            ]);
            expect(collection.flatten()).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [10, 11, 12]
            ]);
        });

    });

    describe("one", function () {

        it("should get the first value", function () {
            expect(Collection([0]).one()).toEqual(0);
        });

        it("should throw if empty", function () {
            expect(Collection([]).one()).toBe(undefined);
        });

    });

    describe("only", function () {

        it("should get the first value", function () {
            expect(Collection([0]).only()).toEqual(0);
        });

        it("should be undefined if empty", function () {
            expect(Collection([]).only()).toBeUndefined();
        });

        it("should be undefined if more than one value", function () {
            expect(Collection([1, 2]).only()).toBeUndefined();
        });

    });

    describe("clone", function () {

        // should have been adequately covered by Object.clone tests

        it("should clone with indefinite depth", function () {
            var collection = Collection([[[]]]);
            var clone = collection.clone();
            expect(clone).toEqual(collection);
            expect(clone).toNotBe(collection);
        });

        it("should clone with depth 0", function () {
            var collection = Collection([]);
            expect(collection.clone(0)).toBe(collection);
        });

        it("should clone with depth 1", function () {
            var collection = [Collection({})];
            expect(collection.clone(1)).toNotBe(collection);
            expect(collection.clone(1).one()).toBe(collection.one());
        });

        it("should clone with depth 2", function () {
            var collection = Collection([{a: 10}]);
            expect(collection.clone(2)).toNotBe(collection);
            expect(collection.clone(2).one()).toNotBe(collection.one());
            expect(collection.clone(2).one()).toEqual(collection.one());
        });

    });

}

