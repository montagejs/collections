// TODO test insertion order

var Map = require("collections/map");
var describeDict = require("./dict");
var describeMap = require("./map");
var describeObservableMap = require("./observable-map");
var describeToJson = require("./to-json");

describe("Map-spec", function () {
    describeDict(Map);
    describeMap(Map);
    describeObservableMap(Dict);
    describeToJson(Map, [[{a: 1}, 10], [{b: 2}, 20], [{c: 3}, 30]]);
});

