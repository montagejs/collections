"use strict";

var Set = require("collections/fast-set");
var Iterator = require("collections/iterator");
var TreeLog = require("collections/tree-log");

var describeCollection = require("./collection");
var describeSet = require("./set");
var describeToJson = require("./to-json");

describe("Set-spec", function () {
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

    describeCollection(Set, [1, 2, 3, 4], true);
    describeCollection(Set, [{id: 0}, {id: 1}, {id: 2}, {id: 3}], true);
    describeSet(Set);
    describeToJson(Set, [1, 2, 3, 4]);

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

        expect(set.buckets.keysArray().sort()).toEqual(['1', '2', '3']);

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

    it("can iterate with an iterator", function () {
        var set = new Set([1, 2, 3, 4, 5, 6]);
        var iterator = new Iterator(set);
        var array = iterator.toArray();
        expect(array).toEqual(set.toArray());
    });

    it("should log", function () {
        var set = new Set([1, 2, 3]);
        var lines = [];
        set.log(TreeLog.ascii, null, lines.push, lines);
        expect(lines).toEqual([
            "+-+ 1",
            "| '-- 1",
            "+-+ 2",
            "| '-- 2",
            "'-+ 3",
            "  '-- 3"
        ]);
    });

    it("should log objects by hash", function () {
        function Type(value) {
            this.value = value;
        }
        Type.prototype.hash = function () {
            return this.value;
        };
        var set = new Set([
            new Type(1),
            new Type(1),
            new Type(2),
            new Type(2)
        ]);
        var lines = [];
        set.log(TreeLog.ascii, function (node, write) {
            write(" " + JSON.stringify(node.value));
        }, lines.push, lines);
        expect(lines).toEqual([
            "+-+ 1",
            "| +-- {\"value\":1}",
            "| '-- {\"value\":1}",
            "'-+ 2",
            "  +-- {\"value\":2}",
            "  '-- {\"value\":2}"
        ]);
    });

    it("should log objects by only one hash", function () {
        function Type(value) {
            this.value = value;
        }
        Type.prototype.hash = function () {
            return this.value;
        };
        var set = new Set([
            new Type(1),
            new Type(1)
        ]);
        var lines = [];
        set.log(TreeLog.ascii, null, lines.push, lines);
        expect(lines).toEqual([
            "'-+ 1",
            "  +-- {",
            "  |       \"value\": 1",
            "  |   }",
            "  '-- {",
            "          \"value\": 1",
            "      }"
        ]);
    });

    describe("should log objects with a custom writer with multiple lines", function () {
        function Type(value) {
            this.value = value;
        }
        Type.prototype.hash = function () {
            return this.value;
        };
        var set = new Set([
            new Type(1),
            new Type(1)
        ]);
        var lines = [];
        set.log(TreeLog.ascii, function (node, below, above) {
            above(" . ");
            below("-+ " + node.value.value);
            below(" ' ");
        }, lines.push, lines);
        [
            "'-+ 1",
            "  |   . ",
            "  +---+ 1",
            "  |   ' ",
            "  |   . ",
            "  '---+ 1",
            "      ' "
        ].forEach(function (line, index) {
            it("line " + index, function () {
                expect(lines[index]).toEqual(line);
            });
        });
    });
});
