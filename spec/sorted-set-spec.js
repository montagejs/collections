
var SortedSet = require("../sorted-set");
var describeDequeue = require("./dequeue");
var describeCollection = require("./collection");

describe("SortedSet", function () {

    // Happens to qualify as a dequeue, since the tests keep the content in
    // sorted order.  SortedSet could support push and unshift, but does not
    // necessarily put the values on the desired end.
    // TODO describeDequeue(SortedSet);

    // construction, has, add, get, delete
    function newSortedSet(values) {
        return new SortedSet(values);
    }

    [SortedSet, newSortedSet].forEach(function (SortedSet) {

        describeCollection(SortedSet, [1, 2, 3, 4], true);

        // comparable objects
        function Value(value) {
            this.value = value;
        }
        Value.prototype.compare = function (that) {
            return Object.compare(this.value, that.value);
        }
        var a = new Value(1);
        var b = new Value(2);
        var c = new Value(3);
        var d = new Value(4);
        var values = [a, b, c, d];
        describeCollection(SortedSet, values, true);

    });

});

