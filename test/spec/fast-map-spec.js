
var FastMap = require("collections/fast-map");
var describeDict = require("./dict");
var describeMap = require("./map");
var describeToJson = require("./to-json");

describe("FastMap-spec", function () {
    describeDict(FastMap);
    describeMap(FastMap);
    describeToJson(FastMap, [[{a: 1}, 10], [{b: 2}, 20], [{c: 3}, 30]]);
});

