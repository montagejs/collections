
var Set = require("../set");
var Iterator = require("../iterator");

describe("Set", function () {

    it("length of empty set", function () {
        expect(new Set().length).toBe(0);
    });

    it("wiped set should be empty", function () {
        var set = new Set([1, 2]);
        expect(set.length).toBe(2);
        set.delete(1);
        expect(set.length).toBe(1);
        set.wipe();
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

    it("can iterate with forEach", function () {
        var values = [false, null, undefined, 0, 1, {}];
        var set = new Set(values);
        set.forEach(function (value) {
            var index = values.indexOf(value);
            values.splice(index, 1);
        });
        expect(values.length).toBe(0);
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
        expect(set.count()).toBe(2);
        expect(set.sum()).toBe(3);
        expect(set.average()).toBe(1.5);
        expect(set.map(function (n) {
            return n + 1;
        }).indexOf(3)).toNotBe(-1);
    });

    it("can use hash delegate methods", function () {
        function Item(key, value) {
            this.key = key;
            this.value = value;
        }

        Item.prototype.hash = function () {
            return '' + this.key;
        };

        var set = new Set();
        set.add(new Item(1, 'a'));
        set.add(new Item(3, 'b'));
        set.add(new Item(2, 'c'));
        set.add(new Item(2, 'd'));

        expect(Object.keys(set.buckets).sort()).toEqual(['1', '2', '3']);

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

});

