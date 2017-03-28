
var SortedArraySet = require("collections/sorted-array-set");
var describeDeque = require("./deque");
var describeCollection = require("./collection");
var describeSet = require("./set");
var describeToJson = require("./to-json");

describe("SortedArraySet-spec", function () {

    describeDeque(SortedArraySet);
    describeCollection(SortedArraySet, [1, 2, 3, 4]);
    describeSet(SortedArraySet);
    describeToJson(SortedArraySet, [1, 2, 3, 4]);

    it("uniqueness", function () {
        var set = SortedArraySet([1, 2, 3, 1, 2, 3]);
        expect(set.slice()).toEqual([1, 2, 3]);
    });

});
