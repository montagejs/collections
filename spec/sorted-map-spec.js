
var SortedMap = require("../sorted-map");
var describeDict = require("./dict");
var describeToJson = require("./to-json");

describe("SortedMap", function () {
    describeDict(SortedMap);
    describeToJson(SortedMap, [[1, 10], [2, 20], [3, 30]]);

    describe("reduceRight", function () {
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

});

