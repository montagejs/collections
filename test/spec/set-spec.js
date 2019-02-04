
var Set = require("collections/set");
var describeCollection = require("./collection");
var describeSet = require("./set");

if (Set._setupCollectionSet) {
    Set._setupCollectionSet();
}
var CollectionsSet = Set.CollectionsSet || Set;

describe("CollectionsSet-spec", function () {
    var Set = CollectionsSet;
    describeCollection(Set, [1, 2, 3, 4], true);
    describeCollection(Set, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], true);
    describeSet(Set);

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

describe("Set-spec", function () {
    describeCollection(Set, [1, 2, 3, 4], false);
    describeCollection(Set, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], false);
    describeSet(Set);

    it("should pop and shift", function () {
        var a = {i: 2};
        var b = {i: 1};
        var c = {i: 0};
        var set = Set.from([a, b, c]);
        expect(set.pop()).toBe(c);
        expect(set.shift()).toBe(a);
    });

    it("should dispatch range change on clear", function () {
        var set = Set.from([1, 2, 3]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        set.clear();
        expect(spy).toHaveBeenCalledWith([], [1, 2, 3], 0, set, undefined);
    });

    it("should dispatch range change on add", function () {
        var set = Set.from([1, 3]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        set.add(2);
        expect(set.toArray()).toEqual([1, 3, 2]);
        expect(spy).toHaveBeenCalledWith([2], [], 2, set, undefined);
    });

    it("should dispatch range change on delete", function () {
        var set = Set.from([1, 2, 3]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        set["delete"](2);
        expect(set.toArray()).toEqual([1, 3]);
        expect(spy).toHaveBeenCalledWith([], [2], 1, set, undefined);
    });

    it("should dispatch range change on pop", function () {
        var set = Set.from([1, 3, 2]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        expect(set.pop()).toEqual(2);
        expect(set.toArray()).toEqual([1, 3]);
        expect(spy).toHaveBeenCalledWith([], [2], 2, set, undefined);
    });

    it("should dispatch range change on shift", function () {
        var set = Set.from([1, 3, 2]);
        var spy = jasmine.createSpy();
        set.addRangeChangeListener(spy);
        expect(set.shift()).toEqual(1);
        expect(set.toArray()).toEqual([3, 2]);
        expect(spy).toHaveBeenCalledWith([], [1], 0, set, undefined);
    });

    it("should dispatch range change on shift then pop", function () {
        var set = Set.from([1, 3]);
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

    it("should dispatch size property change on clear", function () {
        var set = new Set([1, 2, 3]);
        // var set = Set.from([1, 2, 3]);
        var spy = jasmine.createSpy();
        set.addBeforeOwnPropertyChangeListener("size", function (size) {
            spy("size change from", size);
        });

        set.addOwnPropertyChangeListener("size", function (size) {
            spy("size change to", size);
        });

        expect(set.size).toBe(3);
        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);
        expect(set.has(3)).toBe(true);
        set.clear();
        expect(set.size).toBe(0);
        expect(set.has(1)).toBe(false);
        expect(set.has(2)).toBe(false);
        expect(set.has(3)).toBe(false);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["size change from", 3],
            ["size change to", 0]
        ]);
    });

    it("should dispatch size property change on add", function () {
        var set = new Set();
        var spy = jasmine.createSpy();
        set.addBeforeOwnPropertyChangeListener("size", function (size) {
            spy("size change from", size);
        });

        set.addOwnPropertyChangeListener("size", function (size) {
            spy("size change to", size);
        });

        set.add(10);
        set.add(20);

        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["size change from", 0],
            ["size change to", 1],
            ["size change from", 1],
            ["size change to", 2],
        ]);
    });

    it("should dispatch size property change on delete", function () {
        var set = new Set([1, 2, 3]);
        var spy = jasmine.createSpy();
        set.addBeforeOwnPropertyChangeListener("size", function (size) {
            spy("size change from", size);
        });

        set.addOwnPropertyChangeListener("size", function (size) {
            spy("size change to", size);
        });

        set.delete(2);
        set.delete(1);
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["size change from", 3],
            ["size change to", 2],
            ["size change from", 2],
            ["size change to", 1],
        ]);
    });

});
