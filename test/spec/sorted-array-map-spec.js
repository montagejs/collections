
var SortedArrayMap = require("collections/sorted-array-map");
var describeDict = require("./dict");
var describeMap = require("./map");
var describeToJson = require("./to-json");
var describeObservableMap = require("./observable-map");

describe("SortedArrayMap-spec", function () {
    describeDict(SortedArrayMap);
    describeMap(SortedArrayMap, [1, 2, 3]);
    describeToJson(SortedArrayMap, [[1, 10], [2, 20], [3, 30]]);
    describeObservableMap(SortedArrayMap);
});

