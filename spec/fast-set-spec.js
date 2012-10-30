"use strict";

var Set = require("../fast-set");
var describeCollection = require("./collection");
var describeSet = require("./set");

describe("Set", function () {
    // new Set()
    // Set()
    // Set(values)
    // Set(null, equals, hash)
    // Set(null, null, null, content)
    // Set().has(value)
    // Set().get(value)
    // Set().delete(value)
    // Set().clear()
    // Set().add(value)
    // Set().reduce(callback, basis, thisp)
    // Set().forEach()
    // Set().map()
    // Set().toArray()
    // Set().filter()
    // Set().every()
    // Set().some()
    // Set().all()
    // Set().any()
    // Set().min()
    // Set().max()

    function newSet(values) {
        return new Set(values);
    }

    [Set, newSet].forEach(function (Set) {
        describeCollection(Set, [1, 2, 3, 4], true);
        describeCollection(Set, [{}, {}, {}, {}], true);
        describeSet(Set);
    });

    it("can use hash delegate methods", function () {
        function Item(key, value) {
            this.key = key;
            this.value = value;
        }

        Item.prototype.hash = function () {
            return '' + this.key;
        };

        var set = new Set();
        set.add(new Item(1, 'a'));
        set.add(new Item(3, 'b'));
        set.add(new Item(2, 'c'));
        set.add(new Item(2, 'd'));

        expect(set.buckets.keys().sort()).toEqual(['1', '2', '3']);

    });

    it("can iterate with forEach", function () {
        var values = [false, null, undefined, 0, 1, {}];
        var set = new Set(values);
        set.forEach(function (value) {
            var index = values.indexOf(value);
            values.splice(index, 1);
        });
        expect(values.length).toBe(0);
    });

});

