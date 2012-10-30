
var Iterator = require("../iterator");

module.exports = describeSet;
function describeSet(Set) {

    describe("uniqueness", function () {
        var set = Set([1, 2, 3, 1, 2, 3]);
        expect(set.toArray().sort()).toEqual([1, 2, 3]);
    });

    describe("forEach", function () {
        it("the callback should receive value, value, set", function () {
            var set = Set([1, 2, 3]);
            set.forEach(function (value, key, object) {
                expect(value).toBe(key);
                expect(object).toBe(set);
            });
        });
    });

    it("should be initially empty", function () {
        expect(new Set().length).toBe(0);
    });

    it("cleared set should be empty", function () {
        var set = new Set([1, 2]);
        expect(set.length).toBe(2);
        set.delete(1);
        expect(set.length).toBe(1);
        set.clear();
        expect(set.length).toBe(0);
    });

    it("can add and delete an object", function () {
        var set = new Set();
        var object = {};
        set.add(object);
        expect(set.has(object)).toBe(true);
        set.delete(object);
        expect(set.length).toBe(0);
        expect(set.has(object)).toBe(false);
    });

    it("can add and delete objects from the same bucket", function () {
        var a = {}, b = {};
        var set = new Set();
        set.add(a);
        expect(set.has(a)).toBe(true);
        set.add(b);
        expect(set.has(b)).toBe(true);
        set.delete(b);
        expect(set.has(b)).toBe(false);
        expect(set.has(a)).toBe(true);
        set.delete(a);
        expect(set.has(a)).toBe(false);
    });

    it("can readd a deleted object", function () {
        var set = new Set();
        var object = {};
        set.add(object);
        expect(set.has(object)).toBe(true);
        set.add(object);
        expect(set.length).toBe(1);
        set.delete(object);
        expect(set.length).toBe(0);
        expect(set.has(object)).toBe(false);
        set.add(object);
        expect(set.length).toBe(1);
        expect(set.has(object)).toBe(true);
    });

    it("can be changed to an array", function () {
        var set = new Set([0]);
        expect(set.toArray()).toEqual([0]);
    });

    it("is a reducible", function () {
        var set = new Set([1, 1, 1, 2, 2, 2, 1, 2]);
        expect(set.length).toBe(2);
        expect(set.min()).toBe(1);
        expect(set.max()).toBe(2);
        expect(set.sum()).toBe(3);
        expect(set.average()).toBe(1.5);
        expect(set.map(function (n) {
            return n + 1;
        }).indexOf(3)).toNotBe(-1);
    });

    it("is iterable", function () {
        var set = new Set(['c', 'b', 'a']);
        var iterator = new Iterator(set);
        expect(iterator.toArray().sort()).toEqual(['a', 'b', 'c']);
    });

    it("is concatenatable", function () {
        var array = new Set([3, 2, 1]).concat([4, 5, 6]).toArray();
        array.sort();
        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should compute unions", function () {
        expect(Set([1, 2, 3]).union([2, 3, 4]).toArray()).toEqual([1, 2, 3, 4]);
        expect(Set([1, 2, 3]).union([2, 3, 4]).equals([1, 2, 3, 4])).toBe(true);
    });

    it("should compute intersections", function () {
        expect(Set([1, 2, 3]).intersection([2, 3, 4]).toArray()).toEqual([2, 3]);
    });

    it("should compute differences", function () {
        expect(Set([1, 2, 3]).difference([2, 3, 4]).toArray()).toEqual([1]);
    });

    it("should compute symmetric differences", function () {
        expect(Set([1, 2, 3]).symmetricDifference([2, 3, 4]).toArray()).toEqual([1, 4]);
    });

}
