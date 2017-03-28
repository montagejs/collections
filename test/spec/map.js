// Tests that are equally applicable to Map, unbounded LruMap, FastMap.
// These do not apply to SortedMap since keys are not comparable.

var describeMapChanges = require("./listen/map-changes");

module.exports = describeMap;
function describeMap(Map, values) {

    describeMapChanges(Map);

    values = values || [];
    var a = values[0] || {};
    var b = values[1] || {};
    var c = values[2] || {};

    function shouldHaveTheUsualContent(map) {
        expect(map.has(a)).toBe(true);
        expect(map.has(b)).toBe(true);
        expect(map.has(c)).toBe(false);
        expect(map.get(a)).toBe(10);
        expect(map.get(b)).toBe(20);
        expect(map.get(c)).toBe(undefined);
        expect(map.length).toBe(2);
        expect(map.keysArray()).toEqual([a, b]);
        expect(map.valuesArray()).toEqual([10, 20]);
        expect(map.entriesArray()).toEqual([[a, 10], [b, 20]]);
        expect(map.reduce(function (basis, value, key) {
            basis.push([this, key, value]);
            return basis;
        }, [], map)).toEqual([
            [map, a, 10],
            [map, b, 20]
        ]);;
    }

    it("should be constructable from entry duples with object keys", function () {
        var map = new Map([[a, 10], [b, 20]]);
        shouldHaveTheUsualContent(map);
    });

    it("should be constructable from an interable", function () {
        var map = Map.from({
            forEach: function (callback, thisp) {
                callback.call(thisp, [a, 10]);
                callback.call(thisp, [b, 20]);
            }
        });
        shouldHaveTheUsualContent(map);
    });

    it("should support filter", function () {
        var map = Map.from({a: 10, b: 20, c: 30});
        expect(map.filter(function (value, key) {
            return key === "a" || value === 30;
        }).entriesArray()).toEqual([
            ["a", 10],
            ["c", 30]
        ]);
    });

    it("should remove one entry", function () {
        var map = new Map([[a, 10], [b, 20], [c, 30]]);
        expect(map.delete(c)).toBe(true);
        shouldHaveTheUsualContent(map);
    });

    it("should be able to delete all content", function () {
        var map = Map.from({a: 10, b: 20, c: 30});
        map.clear();
        expect(map.length).toBe(0);
        expect(map.keysArray()).toEqual([]);
        expect(map.valuesArray()).toEqual([]);
        expect(map.entriesArray()).toEqual([]);
    });

    it("should equals", function () {
        var map = Map.from({a: 10, b: 20});
        expect(Object.equals(map, map)).toBe(true);
        expect(map.equals(map)).toBe(true);
        expect(Map.from({a: 10, b: 20}).equals({b: 20, a: 10})).toBe(true);
        expect(Object.equals({a: 10, b: 20}, Map.from({b: 20, a: 10}))).toBe(true);
        expect(Object.equals(Map.from({b: 20, a: 10}), {a: 10, b: 20})).toBe(true);
        expect(Object.equals(Map.from({b: 20, a: 10}), Map.from({a: 10, b: 20}))).toBe(true);
    });

    it("should clone", function () {
        var map = Map.from({a: 10, b: 20});
        var clone = Object.clone(map);
        expect(map).not.toBe(clone);
        expect(map.equals(clone)).toBe(true);
    });

}
