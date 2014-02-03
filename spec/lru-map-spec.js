
var LruMap = require("../lru-map");
var describeDict = require("./dict");
var describeMap = require("./map");

describe("LruMap", function () {

    describeDict(LruMap);
    describeMap(LruMap);

    it("should remove stale entries", function () {
        var map = LruMap({a: 10, b: 20, c: 30}, 3);
        map.get("b");
        map.set("d", 40);
        expect(map.keys()).toEqual(['c', 'b', 'd']);
        expect(map.length).toBe(3);
    });

    it("should not grow when re-adding", function () {
        var map = LruMap({a: 10, b: 20, c: 30}, 3);

        expect(map.keys()).toEqual(['a', 'b', 'c']);
        expect(map.length).toBe(3);

        map.get("b");
        expect(map.keys()).toEqual(['a', 'c', 'b']);
        expect(map.length).toBe(3);

        map.set("c", 40);
        expect(map.keys()).toEqual(['a', 'b', 'c']);
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
        map.observeMapChange(function (plus, minus, key, type) {
            spy(plus, minus, key, type);
        });
        map.set('d', 40);
        expect(spy.argsForCall).toEqual([
            [undefined, 10, "a", "delete"], // a pruned
            [40, undefined, "d", "create"] // d added
        ]);
    });
});

