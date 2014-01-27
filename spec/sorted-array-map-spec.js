
var SortedArrayMap = require("../sorted-array-map");
var describeDict = require("./dict");
var describeMap = require("./map");
var describeObservableMap = require("./observable-map");

describe("SortedArrayMap", function () {
    describeDict(SortedArrayMap);
    describeMap(SortedArrayMap, [1, 2, 3]);
    describeObservableMap(SortedArrayMap);
});

