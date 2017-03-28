
var LruMap = require("collections/lru-map");
var describeDict = require("./dict");
var describeMap = require("./map");
var describeToJson = require("./to-json");

describe("LruMap-spec", function () {

    describeDict(LruMap);
    describeMap(LruMap);
    describeToJson(LruMap, [[{a: 1}, 10], [{b: 2}, 20], [{c: 3}, 30]]);

    it("should remove stale entries", function () {
        var map = LruMap({a: 10, b: 20, c: 30}, 3);
        map.get("b");
        map.set("d", 40);
        expect(map.keysArray()).toEqual(['c', 'b', 'd']);
        expect(map.length).toBe(3);
    });

    it("should not grow when re-adding", function () {
        var map = LruMap({a: 10, b: 20, c: 30}, 3);

        expect(map.keysArray()).toEqual(['a', 'b', 'c']);
        expect(map.length).toBe(3);

        map.get("b");
        expect(map.keysArray()).toEqual(['a', 'c', 'b']);
        expect(map.length).toBe(3);

        map.set("c", 40);
        expect(map.keysArray()).toEqual(['a', 'b', 'c']);
        expect(map.length).toBe(3);
    });

    it("should grow when adding new values", function () {
        var map = LruMap({}, 3);
        expect(map.length).toBe(0);

        map.set("a", 10);
        expect(map.length).toBe(1);
        map.set("a", 10);
        expect(map.length).toBe(1);

        map.set("b", 20);
        expect(map.length).toBe(2);
        map.set("b", 20);
        expect(map.length).toBe(2);

        map.set("c", 30);
        expect(map.length).toBe(3);
        map.set("c", 30);
        expect(map.length).toBe(3);

        // stops growing
        map.set("d", 40);
        expect(map.length).toBe(3);
        map.set("d", 40);
        expect(map.length).toBe(3);

        map.set("e", 50);
        expect(map.length).toBe(3);
    });

    it("should dispatch deletion for stale entries", function () {
        var map = LruMap({a: 10, b: 20, c: 30}, 3);
        var spy = jasmine.createSpy();
        map.addBeforeMapChangeListener(function (value, key) {
            spy('before', key, value);
        });
        map.addMapChangeListener(function (value, key) {
            spy('after', key, value);
        });
        map.set('d', 40);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ['before', 'd', undefined], // d will be added
            ['before', 'a', undefined], // then a is pruned (stale)
            ['after', 'a', undefined],  // afterwards a is still pruned
            ['after', 'd', 40]          // and now d has a value
        ]);
    });
});
