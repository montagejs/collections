
var SortedArrayMap = require("../sorted-array-map");
var describeDict = require("./dict");
var describeMap = require("./map");
var describeMapChanges = require("./listen/map-changes");
var describeToJson = require("./to-json");

describe("SortedArrayMap", function () {
    describeDict(SortedArrayMap);
    describeMap(SortedArrayMap, [1, 2, 3]);
    describeMapChanges(SortedArrayMap);
    describeToJson(SortedArrayMap, [[1, 10], [2, 20], [3, 30]]);
});

