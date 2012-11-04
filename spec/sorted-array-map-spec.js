
var SortedArrayMap = require("../sorted-array-map");
var describeDict = require("./dict");
var describeMap = require("./map");
var describeMapChanges = require("./listen/map-changes");

describe("SortedArrayMap", function () {
    describeDict(SortedArrayMap);
    describeMap(SortedArrayMap, [1, 2, 3]);
    describeMapChanges(SortedArrayMap);
});

