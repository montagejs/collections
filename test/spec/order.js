
var GenericCollection = require("collections/generic-collection");

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

        it("identifies itself", function () {
            var collection = Collection([1, 2]);
            expect(collection.equals(collection)).toBe(true);
        });

        it("distinguishes incomparable objects", function () {
            expect(Collection([]).equals(null)).toEqual(false);
        });

        it("compares itself to an array-like collection", function () {
            expect(Collection([10, 20, 30]).equals(fakeArray)).toEqual(true);
        });

    });

    describe("compare", function () {

        it("compares to itself", function () {
            var collection = Collection([1, 2]);
            expect(collection.compare(collection)).toBe(0);
        });

        // contains 10, 20, 30
        it("a fake array should be equal to collection", function () {
            expect(Object.compare(fakeArray, Collection([10, 20, 30]))).toEqual(-0);
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

    describe("indexOf", function () {
        if (!Collection.prototype.indexOf)
            return;

        it("finds first value", function () {
            var collection = Collection([1, 2, 3]);
            expect(collection.indexOf(2)).toBe(1);
        });

        it("finds first identical value", function () {
            if (Collection.prototype.isSet)
                return;
            var collection = Collection([1, 1, 2, 2, 3, 3]);
            expect(collection.indexOf(2)).toBe(2);
        });

        it("finds first value after index", function () {
            if (Collection.prototype.isSet || Collection.prototype.isSorted)
                return;
            var collection = Collection([1, 2, 3, 1, 2, 3]);
            expect(collection.indexOf(2, 3)).toBe(4);
        });

        it("finds first value after negative index", function () {
            if (Collection.prototype.isSet || Collection.prototype.isSorted)
                return;
            var collection = Collection([1, 2, 3, 1, 2, 3]);
            expect(collection.indexOf(2, -3)).toBe(4);
        });

    });

    describe("lastIndexOf", function () {
        if (!Collection.prototype.lastIndexOf)
            return;

        it("finds last value", function () {
            var collection = Collection([1, 2, 3]);
            expect(collection.lastIndexOf(2)).toBe(1);
        });

        it("finds last identical value", function () {
            if (Collection.prototype.isSet)
                return;
            var collection = Collection([1, 1, 2, 2, 3, 3]);
            expect(collection.lastIndexOf(2)).toBe(3);
        });

        it("finds the last value before index", function () {
            if (Collection.prototype.isSet || Collection.prototype.isSorted)
                return;
            var collection = Collection([1, 2, 3, 1, 2, 3]);
            expect(collection.lastIndexOf(2, 3)).toBe(1);
        });

        it("finds the last value before negative index", function () {
            if (Collection.prototype.isSet || Collection.prototype.isSorted)
                return;
            var collection = Collection([1, 2, 3, 1, 2, 3]);
            expect(collection.lastIndexOf(2, -3)).toBe(1);
        });

    });

    describe("find (deprecated support)", function () {

        it("finds equivalent values", function () {
            expect(Collection([10, 10, 10]).find(10)).toEqual(0);
        });

        it("finds equivalent values", function () {
            expect(Collection([10, 10, 10]).find(10)).toEqual(0);
        });

    });

    describe("findValue", function () {

        it("finds equivalent values", function () {
            expect(Collection([10, 10, 10]).findValue(10)).toEqual(0);
        });

        it("finds equivalent values", function () {
            expect(Collection([10, 10, 10]).findValue(10)).toEqual(0);
        });

    });

    describe("findLast (deprecated support)", function () {

        it("finds equivalent values", function () {
            expect(Collection([10, 10, 10]).findLast(10)).toEqual(2);
        });
    });

    describe("findLastValue", function () {

        it("finds equivalent values", function () {
            expect(Collection([10, 10, 10]).findLastValue(10)).toEqual(2);
        });

    });

    describe("has", function () {

        it("finds equivalent values", function () {
            expect(Collection([10]).has(10)).toBe(true);
        });

        it("does not find absent values", function () {
            expect(Collection([]).has(-1)).toBe(false);
        });

    });

    describe("has", function () {

        it("finds a value", function () {
            var collection = Collection([1, 2, 3]);
            expect(collection.has(2)).toBe(true);
        });

        it("does not find an absent value", function () {
            var collection = Collection([1, 2, 3]);
            expect(collection.has(4)).toBe(false);
        });

        // TODO
        // it("makes use of equality override", function () {
        //     var collection = Collection([1, 2, 3]);
        //     expect(collection.has(4, function (a, b) {
        //         return a - 1 === b;
        //     })).toBe(true);
        // });

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

        it("finds the minimum of numeric values", function () {
            expect(Collection([1, 2, 3]).min()).toEqual(1);
        });

    });

    describe("max", function () {

        it("finds the maximum of numeric values", function () {
            expect(Collection([1, 2, 3]).max()).toEqual(3);
        });

    });

    describe("sum", function () {

        it("computes the sum of numeric values", function () {
            expect(Collection([1, 2, 3]).sum()).toEqual(6);
        });

        // sum has deprecated behaviors for implicit flattening and
        // property path mapping, not tested here

    });

    describe("average", function () {

        it("computes the arithmetic mean of values", function () {
            expect(Collection([1, 2, 3]).average()).toEqual(2);
        });

    });

    describe("flatten", function () {

        it("flattens an array one level", function () {
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

        it("gets the first value", function () {
            expect(Collection([0]).one()).toEqual(0);
        });

        it("throws if empty", function () {
            expect(Collection([]).one()).toBe(undefined);
        });

    });

    describe("only", function () {

        it("gets the first value", function () {
            expect(Collection([0]).only()).toEqual(0);
        });

        it("is undefined if empty", function () {
            expect(Collection([]).only()).toBeUndefined();
        });

        it("is undefined if more than one value", function () {
            expect(Collection([1, 2]).only()).toBeUndefined();
        });

    });

    describe("clone", function () {

        // should have been adequately covered by Object.clone tests

        it("should clone with indefinite depth", function () {
            var collection = Collection([[[]]]);
            var clone = collection.clone();
            expect(clone).toEqual(collection);
            expect(clone).not.toBe(collection);
        });

        it("should clone with depth 0", function () {
            var collection = Collection([]);
            expect(collection.clone(0)).toBe(collection);
        });

        it("should clone with depth 1", function () {
            var collection = [Collection({})];
            expect(collection.clone(1)).not.toBe(collection);
            expect(collection.clone(1).one()).toBe(collection.one());
        });

        it("should clone with depth 2", function () {
            var collection = Collection([{a: 10}]);
            expect(collection.clone(2)).not.toBe(collection);
            expect(collection.clone(2).one()).not.toBe(collection.one());
            expect(collection.clone(2).one()).toEqual(collection.one());
        });

    });

}

