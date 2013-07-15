
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

});

