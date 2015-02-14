var Iterator = require("../iterator");

var Maps = [require("../map"),require("../sorted-map"),require("../sorted-array-map"),require("../fast-map"),require("../lfu-map"),require("../lru-map")]

describe("Map Iterator", function () {
    Maps.forEach(function(M) {
        it("iterator should iterate keys of a "+M.name,function() {
            var map = M({a:10});
            var count = 0;
            Iterator(map).forEach(function(v,k) {
                count = count+1;
                expect(k).toBe('a');
                expect(v).toBe(10);
            });
            //expect(count).toBe(1);
        });
    });
});
