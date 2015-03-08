// Tests that are equally applicable to Map, unbounded LruMap, FastMap.
// These do not apply to SortedMap since keys are not comparable.

var describeObservableMap = require("./observable-map");
var describeDict = require("./dict");
var equalsOperator = require("pop-equals");
var cloneOperator = require("pop-clone");

module.exports = describeMap;
function describeMap(Map, values) {

    describe("as Map", function () {

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
            expect(map.get(c, 30)).toBe(30);
            expect(map.length).toBe(2);
            expect(map.keys()).toEqual([a, b]);
            expect(map.values()).toEqual([10, 20]);
            expect(map.entries()).toEqual([[a, 10], [b, 20]]);
            expect(map.reduce(function (basis, value, key) {
                basis.push([this, key, value]);
                return basis;
            }, [], map)).toEqual([
                [map, a, 10],
                [map, b, 20]
            ]);;
        }

        it("should be constructable from entry duples with object keys", function () {
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

        it("should support filter", function () {
            var map = Map({a: 10, b: 20, c: 30});
            expect(map.filter(function (value, key) {
                return key === "a" || value === 30;
            }).entries()).toEqual([
                ["a", 10],
                ["c", 30]
            ]);
        });

        describe("delete", function () {
            it("removes one entry", function () {
                var map = Map([[a, 10], [b, 20], [c, 30]]);
                expect(map.delete(c)).toBe(true);
                shouldHaveTheUsualContent(map);
            });
        });

        describe("clear", function () {
            it("deletes all content", function () {
                var map = Map({a: 10, b: 20, c: 30});
                map.clear();
                expect(map.length).toBe(0);
                expect(map.keys()).toEqual([]);
                expect(map.values()).toEqual([]);
                expect(map.entries()).toEqual([]);
            });
        });

        describe("equals", function () {
            it("compares maps", function () {
                var map = Map({a: 10, b: 20});
                expect(equalsOperator(map, map)).toBe(true);
                expect(map.equals(map)).toBe(true);
                expect(Map({a: 10, b: 20}).equals({b: 20, a: 10})).toBe(true);
                expect(equalsOperator({a: 10, b: 20}, Map({b: 20, a: 10}))).toBe(true);
                expect(equalsOperator(Map({b: 20, a: 10}), {a: 10, b: 20})).toBe(true);
                expect(equalsOperator(Map({b: 20, a: 10}), Map({a: 10, b: 20}))).toBe(true);
            });
        });

        describe("clone", function () {
            it("clones a map", function () {
                var map = Map({a: 10, b: 20});
                var clone = cloneOperator(map);
                expect(map).not.toBe(clone);
                expect(map.equals(clone)).toBe(true);
            });
        });

    });

    describeObservableMap(Map);
    describeDict(Map);

}

