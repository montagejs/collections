
var LruMap = require("../lru-map");
var describeDict = require("./dict");

describe("LruMap", function () {

    describeDict(LruMap);

    it("should remote stale items", function () {
        var map = LruMap({a: 10, b: 20, c: 30}, 3);
        map.get("b");
        map.set("d", 40);
        expect(map.keys()).toEqual(['c', 'b', 'd']);
        expect(map.length).toBe(3);
    });

});


