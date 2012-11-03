
var SortedMap = require("../sorted-map");
var describeDict = require("./dict");

describe("SortedMap", function () {
    describeDict(SortedMap);

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

