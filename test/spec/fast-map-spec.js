
var FastMap = require("collections/fast-map");
var describeDict = require("./dict");
var describeMap = require("./map");

describe("FastMap", function () {
    describeDict(FastMap);
    describeMap(FastMap);
});

