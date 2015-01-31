
require("../observable-array");
var is = require("../operators").is;
var compare = require("pop-compare");
var GenericCollection = require("../generic-collection");
var describeDeque = require("./deque");
var describeCollection = require("./collection");
var describeOrder = require("./order");
var copy = require("../copy");
var arrayify = require("pop-arrayify");

function by(relation) {
    return function (a, b) {
        return compare(relation(a), relation(b));
    };
}

describe("Array", function () {
    describeDeque(arrayify);
    describeCollection(arrayify, [1, 2, 3, 4]);
    describeCollection(arrayify, [{id: 0}, {id: 1}, {id: 2}, {id: 3}]);
    describeOrder(arrayify);

    /*
        The following tests are from Montage.
        Copyright (c) 2012, Motorola Mobility LLC.
        All Rights Reserved.
        BSD License.
    */

    // contains 10, 20, 30
    function FakeArray() {
        this.length = 3;
    }
    copy(FakeArray.prototype, GenericCollection.prototype);
    FakeArray.prototype.reduce = function (callback, basis) {
        basis = callback(basis, 10, 0, this);
        basis = callback(basis, 20, 1, this);
        basis = callback(basis, 30, 2, this);
        return basis;
    };
    var fakeArray = new FakeArray();

    // should have been almost completely tested by equals and
    // describeOrder

});

