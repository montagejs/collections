// TODO test insertion order

var Map = require("../map");
var describeDict = require("./dict");
var describeMap = require("./map");

describe("Map", function () {
    describeDict(Map);
    describeMap(Map);
});

