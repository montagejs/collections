
var SortedMap = require("collections/sorted-map");
var describeDict = require("./dict");
var describeToJson = require("./to-json");

describe("SortedMap-spec", function () {
    describeDict(SortedMap);
    describeToJson(SortedMap, [[1, 10], [2, 20], [3, 30]]);

    it("should reduceRight", function () {
        var map = SortedMap([
            [1, 2],
            [2, 4],
            [3, 6],
            [4, 8]
        ]);
        expect(map.reduceRight(function (valid, value, key) {
            return valid && key * 2 == value;
        }, true)).toBe(true);
    });

    it("should iterate", function () {
        var map = SortedMap([
            [1, 2],
            [2, 4],
            [3, 6],
            [4, 8]
        ]);
        var iterator = map.iterator();
        var a = iterator.next().value,
            b = iterator.next().value,
            c = iterator.next().value,
            d = iterator.next().value;
        expect(a.key).toEqual(1);
        expect(a.value).toEqual(2);
        expect(b.key).toEqual(2);
        expect(b.value).toEqual(4);
        expect(c.key).toEqual(3);
        expect(c.value).toEqual(6);
        expect(d.key).toEqual(4);
        expect(d.value).toEqual(8);
    });
});
