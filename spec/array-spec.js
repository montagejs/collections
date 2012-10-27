
require("../array");
var describeDequeue = require("./dequeue");
var describeCollection = require("./collection");

describe("Array", function () {

    describeDequeue(Array.from);
    describeCollection(Array.from, [1, 2, 3, 4]);
    describeCollection(Array.from, [{}, {}, {}, {}]);

    // Array().get(index)

});

