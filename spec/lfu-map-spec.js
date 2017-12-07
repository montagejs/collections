
var sinon = require("sinon");
var LfuMap = require("../lfu-map");
var describeDict = require("./dict");
var describeMap = require("./map");

describe("LfuMap", function () {

    describeMap(LfuMap);

    it("should remove stale entries", function () {
        var map = LfuMap({a: 10, b: 20, c: 30}, 3);
        map.get("a");
        map.get("b");
        map.set("d", 40);
        expect(map.keys()).toEqual(['d', 'a', 'b']);
        expect(map.length).toBe(3);
    });

    it("should not grow when re-adding", function () {
        var map = LfuMap({a: 10, b: 20, c: 30}, 3);

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
        var map = LfuMap({}, 3);
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
        var map = LfuMap({a: 10, b: 20, c: 30}, 3);
        var spy = sinon.spy();
        map.observeMapWillChange(function (plus, minus, key) {
            spy('before', key, minus);
        });
        map.observeMapChange(function (plus, minus, key) {
            spy('after', key, plus);
        });
        map.set('d', 40);
        expect(spy.args).toEqual([
            ['before', 'd', undefined], // d will be added
            ['before', 'a', 10],        // then a is pruned (stale)
            ['after', 'a', undefined],  // afterwards a is still pruned
            ['after', 'd', 40]          // and now d has a value
        ]);
    });
});

