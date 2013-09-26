
var Set = require("../set");
var describeCollection = require("./collection");
var describeSet = require("./set");

describe("Set", function () {

    function newSet(values) {
        return new Set(values);
    }

    [Set, newSet].forEach(function (Set) {
        describeCollection(Set, [1, 2, 3, 4], true);
        describeCollection(Set, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], true);
        describeSet(Set);
    });

    describeCollection(function (values) {
        return Set(values, Object.is);
    }, [{}, {}, {}, {}], true);

    it("should pop and shift", function () {
        var a = {i: 2};
        var b = {i: 1};
        var c = {i: 0};
        var set = Set([a, b, c], Object.is);
        expect(set.pop()).toBe(c);
        expect(set.shift()).toBe(a);
    });

    it("should dispatch range change on clear", function () {
        var set = Set([1, 2, 3]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        set.clear();
        expect(spy).toHaveBeenCalledWith([], [1, 2, 3], 0, set, undefined);
    });

    it("should dispatch range change on add", function () {
        var set = Set([1, 3]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        set.add(2);
        expect(set.toArray()).toEqual([1, 3, 2]);
        expect(spy).toHaveBeenCalledWith([2], [], 2, set, undefined);
    });

    it("should dispatch range change on delete", function () {
        var set = Set([1, 2, 3]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        set["delete"](2);
        expect(set.toArray()).toEqual([1, 3]);
        expect(spy).toHaveBeenCalledWith([], [2], 1, set, undefined);
    });

    it("should dispatch range change on pop", function () {
        var set = Set([1, 3, 2]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        expect(set.pop()).toEqual(2);
        expect(set.toArray()).toEqual([1, 3]);
        expect(spy).toHaveBeenCalledWith([], [2], 2, set, undefined);
    });

    it("should dispatch range change on shift", function () {
        var set = Set([1, 3, 2]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        expect(set.shift()).toEqual(1);
        expect(set.toArray()).toEqual([3, 2]);
        expect(spy).toHaveBeenCalledWith([], [1], 0, set, undefined);
    });

    it("should dispatch range change on shift then pop", function () {
        var set = Set([1, 3]);
        set.addRangeChangeListener(function (plus, minus, index) {
            spy(plus, minus, index); // ignore all others
        });

        var spy = jasmine.createSpy();
        expect(set.add(2)).toEqual(true);
        expect(set.toArray()).toEqual([1, 3, 2]);
        expect(spy).toHaveBeenCalledWith([2], [], 2);

        var spy = jasmine.createSpy();
        expect(set.shift()).toEqual(1);
        expect(set.toArray()).toEqual([3, 2]);
        expect(spy).toHaveBeenCalledWith([], [1], 0);

        var spy = jasmine.createSpy();
        expect(set.pop()).toEqual(2);
        expect(set.toArray()).toEqual([3]);
        expect(spy).toHaveBeenCalledWith([], [2], 1);

        var spy = jasmine.createSpy();
        expect(set.delete(3)).toEqual(true);
        expect(set.toArray()).toEqual([]);
        expect(spy).toHaveBeenCalledWith([], [3], 0);
    });

});

