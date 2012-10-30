// Tests that are equally applicable to Map, unbounded LruMap, FastMap.
// These do not apply to SortedMap since keys are not comparable.

module.exports = describeMap;
function describeMap(Map, nonEnumerable) {
    var a = {};
    var b = {};
    var c = {};

    function shouldHaveTheUsualContent(map) {
        expect(map.has(a)).toBe(true);
        expect(map.has(b)).toBe(true);
        expect(map.has(c)).toBe(false);
        expect(map.get(a)).toBe(10);
        expect(map.get(b)).toBe(20);
        expect(map.get(c)).toBe(undefined);
        expect(map.get(c, 30)).toBe(30);
        expect(map.length).toBe(2);
        expect(map.keys()).toEqual([a, b]);
        expect(map.values()).toEqual([10, 20]);
        expect(map.items()).toEqual([[a, 10], [b, 20]]);
        expect(map.reduce(function (basis, value, key) {
            basis.push([this, key, value]);
            return basis;
        }, [], map)).toEqual([
            [map, a, 10],
            [map, b, 20]
        ]);;
    }

    it("should be constructable from item duples with object keys", function () {
        var map = Map([[a, 10], [b, 20]]);
        shouldHaveTheUsualContent(map);
    });

    it("should be constructable from an interable", function () {
        var map = Map({
            forEach: function (callback, thisp) {
                callback.call(thisp, [a, 10]);
                callback.call(thisp, [b, 20]);
            }
        });
        shouldHaveTheUsualContent(map);
    });

    describe("delete", function () {
        it("should remove one item", function () {
            var map = Map([[a, 10], [b, 20], [c, 30]]);
            expect(map.delete(c)).toBe(true);
            shouldHaveTheUsualContent(map);
        });
    });

    describe("equals", function () {
        expect(Map({a: 10, b: 20}).equals({b: 20, a: 10})).toBe(true);
        expect(Object.equals({a: 10, b: 20}, Map({b: 20, a: 10}))).toBe(true);
        expect(Object.equals(Map({b: 20, a: 10}), {a: 10, b: 20})).toBe(true);
        expect(Object.equals(Map({b: 20, a: 10}), Map({a: 10, b: 20}))).toBe(true);
    });

}

