var LfuSet = require("collections/lfu-set");
var describeCollection = require("./collection");
var describeSet = require("./set");
var describeToJson = require("./to-json");

describe("LfuSet-spec", function () {

    // construction, has, add, get, delete
    describeCollection(LfuSet, [1, 2, 3, 4], true);
    describeCollection(LfuSet, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], true);
    describeSet(LfuSet);
    describeToJson(LfuSet, [1, 2, 3, 4]);

    it("should handle many repeated values", function () {
        var set = new LfuSet([1, 1, 1, 2, 2, 2, 1, 2]);
        expect(set.toArray()).toEqual([1, 2]);
    });

    it("should remove stale entries", function () {
        var set = LfuSet([3, 4, 1, 3, 2], 3);

        expect(set.length).toBe(3);
        expect(set.toArray()).toEqual([1, 2, 3]);
        set.add(4);
        expect(set.toArray()).toEqual([2, 4, 3]);
    });

    it("should emit LFU changes as singleton operation", function () {
        var a = 1, b = 2, c = 3, d = 4;
        var lfuset = LfuSet([d, c, a, b, c], 3);
        lfuset.addRangeChangeListener(function(plus, minus) {
            expect(plus).toEqual([d]);
            expect(minus).toEqual([a]);
        });
        expect(lfuset.add(d)).toBe(false);
    });

    it("should dispatch LRU changes as singleton operation", function () {
        var set = LfuSet([4, 3, 1, 2, 3], 3);
        var spy = jasmine.createSpy();
        set.addBeforeRangeChangeListener(function (plus, minus) {
            spy('before-plus', plus);
            spy('before-minus', minus);
        });
        set.addRangeChangeListener(function (plus, minus) {
            spy('after-plus', plus);
            spy('after-minus', minus);
        });
        expect(set.add(4)).toBe(false);

        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ['before-plus', [4]],
            ['before-minus', [1]],
            ['after-plus', [4]],
            ['after-minus', [1]]
        ]);
    })
});
