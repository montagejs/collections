
var LruSet = require("../lru-set");
var describeCollection = require("./collection");
var describeSet = require("./set");

describe("LruSet", function () {

    // construction, has, add, get, delete
    function newLruSet(values) {
        return new LruSet(values);
    }

    [LruSet, newLruSet].forEach(function (LruSet) {
        describeCollection(LruSet, [1, 2, 3, 4], true);
        describeCollection(LruSet, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], true);
        describeSet(LruSet);
    });

    
    describe("least recently used", function () {
        it("should prune the least recently used element", function () {
            var a = 1, b = 2, c = 3, d = 4;
            var lruset = LruSet([d, c, a, b, c], 3);
            expect(lruset.length).toBe(3);
            lruset.add(c);
            expect(lruset.toArray()).toEqual([a, b, c]);
            lruset.add(d);
            expect(lruset.toArray()).toEqual([b, c, d]);
        });
        
        it("should emit LRU changes as singleton operation", function () {
            var a = 1, b = 2, c = 3, d = 4;
            var lruset = LruSet([d, c, a, b, c], 3);
            lruset.addRangeChangeListener(function(plus, minus) {
                expect(plus).toEqual([d]);
                expect(minus).toEqual([a]);
            });
            expect(lruset.add(d)).toBe(false);
        });
    });
});

