
require("collections/shim-array");
var SortedSet = require("collections/sorted-set");
var TreeLog = require("collections/tree-log");
var describeDeque = require("./deque");
var describeCollection = require("./collection");
var describeSet = require("./set");
var describeToJson = require("./to-json");
var Fuzz = require("./fuzz");

describe("SortedSet-spec", function () {


    // TODO SortedSet compare and equals argument overrides

    // construction, has, add, get, delete
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

    // Happens to qualify as a deque, since the tests keep the content in
    // sorted order.  SortedSet has meaningful pop and shift operations, but
    // push and unshift just add the arguments into their proper sorted
    // positions rather than the ends.
    describeDeque(SortedSet);

    describeSet(SortedSet, "sorted");
    describeToJson(SortedSet, [1, 2, 3, 4]);

    describe("splay", function () {

        function draw(set) {
            var lines = [];
            set.log(TreeLog.ascii, null, lines.push, lines);
            return lines;
        }

        it("should degenerate for sorted values", function () {
            var set = SortedSet([1, 2, 3]);
            expect(draw(set)).toEqual([
                "  .-- 1",
                ".-+ 2",
                "+ 3"
            ]);
        });

        it("should splay middle value", function () {
            var set = SortedSet([1, 2, 3]);
            set.get(2);
            expect(draw(set)).toEqual([
                ".-- 1",
                "+ 2",
                "'-- 3"
            ]);
        });

        it("should splay middle value", function () {
            var set = SortedSet([1, 2, 3]);
            set.get(2);
            set.delete(1);
            expect(draw(set)).toEqual([
                "+ 2",
                "'-- 3"
            ]);
        });

    });

    describe("subtree lengths", function () {

        function draw(set) {
            var lines = [];
            set.log(TreeLog.ascii, function (node, write, writeAbove) {
                write(" " + node.value + " length=" + node.length);
            }, lines.push, lines);
            return lines;
        }

        function expectNodeToHaveCorrectSubtreeLengths(node) {
            if (!node)
                return 0;
            var length = 1;
            length += expectNodeToHaveCorrectSubtreeLengths(node.left);
            length += expectNodeToHaveCorrectSubtreeLengths(node.right);
            expect(node.length).toBe(length);
            return length;
        }

        it("+1", function () {
            var set = SortedSet([1]);
            expect(draw(set)).toEqual([
                "- 1 length=1"
            ]);
            expectNodeToHaveCorrectSubtreeLengths(set.root);
        });

        it("+1, +2", function () {
            var set = SortedSet([1, 2]);
            expect(draw(set)).toEqual([
                ".-- 1 length=1",
                "+ 2 length=2"
            ]);
            expectNodeToHaveCorrectSubtreeLengths(set.root);
        });

        it("+1, +2, 1", function () {
            var set = SortedSet([1, 2]);
            set.get(1);
            expect(draw(set)).toEqual([
                "+ 1 length=2",
                "'-- 2 length=1"
            ]);
            expectNodeToHaveCorrectSubtreeLengths(set.root);
        });

        it("+1, +3, +2", function () {
            var set = SortedSet([1, 3, 2]);
            expect(draw(set)).toEqual([
                ".-- 1 length=1",
                "+ 2 length=3",
                "'-- 3 length=1"
            ]);
            expectNodeToHaveCorrectSubtreeLengths(set.root);
        });

        function makeCase(description, operations, log) {
            it(description + " " + operations, function () {
                var set = SortedSet();
                Fuzz.execute(set, Fuzz.parse(operations), log);
                expectNodeToHaveCorrectSubtreeLengths(set.root);
            });
        }

        makeCase("reduction of case with propagation issue", "+2, +4, +3, +1, 4");

        // 50 fuzz cases
        for (var i = 0; i < 50; i++) {
            (function () {
                var fuzz = Fuzz.make(i * 5, i, Math.max(10, i * 5));
                makeCase("fuzz", Fuzz.stringify(fuzz));
            })();
        }

    });

    describe("splayIndex", function () {
        it("should find the index of every element", function () {
            var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            var rand = Fuzz.makeRandom(0);
            numbers.sort(function () {
                return rand() - .5;
            });
            var set = SortedSet(numbers);
            numbers.forEach(function (index) {
                set.splayIndex(index);
                expect(set.root.index).toBe(index);
                expect(set.root.value).toBe(index);
            });
        });
    });

    describe("indexOf", function () {
        // fuzz cases
        for (var seed = 0; seed < 20; seed++) {
            (function (seed) {
                var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                var rand = Fuzz.makeRandom(seed);
                numbers.sort(function () {
                    return rand() - .5;
                });
                it("should discern the position of every value in " + numbers.join(", "), function () {
                    var set = SortedSet(numbers);
                    numbers.forEach(function (n, i) {
                        expect(set.indexOf(n)).toBe(n);
                    });
                });
            })(seed);
        }
    });

    describe("find methods", function () {
        var set = new SortedSet([22, 23, 1, 34, 19, 5, 26, 12, 27, 30, 21,
                                 20, 6, 7, 2, 32, 10, 9, 33, 3, 11, 17, 28, 15]);

        describe("find", function() {

            it("should find the node for existing values", function() {
                expect(set.find(1).value).toBe(1);
                expect(set.find(5).value).toBe(5);
                expect(set.find(9).value).toBe(9);
                expect(set.find(30).value).toBe(30);
                expect(set.find(34).value).toBe(34);
            });

            it("should return undefined for non-existent values", function() {
                expect(set.find(4)).toBe(undefined);
                expect(set.find(13)).toBe(undefined);
                expect(set.find(31)).toBe(undefined);
            });

        });

        describe("findGreatest", function () {

            it("should return the highest value in the set", function() {
                expect(set.findGreatest().value).toBe(34);
            });

        });

        describe("findLeast", function () {

            it("should return the lowest value in the set", function() {
                expect(set.findLeast().value).toBe(1);
            });

        });

        describe("findGreatestLessThanOrEqual", function () {

            it("should return values that exist in the set", function() {
                expect(set.findGreatestLessThanOrEqual(5).value).toBe(5);
                expect(set.findGreatestLessThanOrEqual(7).value).toBe(7);
                expect(set.findGreatestLessThanOrEqual(9).value).toBe(9);
            });

            it("should return the next highest value", function() {
                expect(set.findGreatestLessThanOrEqual(14).value).toBe(12);
                expect(set.findGreatestLessThanOrEqual(24).value).toBe(23);
                expect(set.findGreatestLessThanOrEqual(31).value).toBe(30);
                expect(set.findGreatestLessThanOrEqual(4).value).toBe(3);
                expect(set.findGreatestLessThanOrEqual(29).value).toBe(28);
                expect(set.findGreatestLessThanOrEqual(25).value).toBe(23);
            });

            it("should return undefined for values out of range", function() {
                expect(set.findGreatestLessThanOrEqual(0)).toBe(undefined);
            });

        });

        describe("findGreatestLessThan", function () {

            it("should return next highest for values that exist in the set", function() {
                expect(set.findGreatestLessThan(5).value).toBe(3);
                expect(set.findGreatestLessThan(7).value).toBe(6);
                expect(set.findGreatestLessThan(9).value).toBe(7);
                expect(set.findGreatestLessThan(26).value).toBe(23);
            });

            it("should return the next highest value", function() {
                expect(set.findGreatestLessThan(14).value).toBe(12);
                expect(set.findGreatestLessThan(24).value).toBe(23);
                expect(set.findGreatestLessThan(31).value).toBe(30);
                expect(set.findGreatestLessThan(4).value).toBe(3);
                expect(set.findGreatestLessThan(29).value).toBe(28);
                expect(set.findGreatestLessThan(25).value).toBe(23);
            });


            it("should return undefined for value at bottom of range", function() {
                expect(set.findGreatestLessThan(1)).toBe(undefined);
            });

        });

        describe("findLeastGreaterThanOrEqual", function () {

            it("should return values that exist in the set", function() {
                expect(set.findLeastGreaterThanOrEqual(5).value).toBe(5);
                expect(set.findLeastGreaterThanOrEqual(7).value).toBe(7);
                expect(set.findLeastGreaterThanOrEqual(9).value).toBe(9);
            });

            it("should return the next value", function() {
                expect(set.findLeastGreaterThanOrEqual(13).value).toBe(15);
                expect(set.findLeastGreaterThanOrEqual(24).value).toBe(26);
                expect(set.findLeastGreaterThanOrEqual(31).value).toBe(32);
                expect(set.findLeastGreaterThanOrEqual(4).value).toBe(5);
                expect(set.findLeastGreaterThanOrEqual(29).value).toBe(30);
                expect(set.findLeastGreaterThanOrEqual(25).value).toBe(26);
            });

            it("should return undefined for values out of range", function() {
                expect(set.findLeastGreaterThanOrEqual(36)).toBe(undefined);
            });

        });

        describe("findLeastGreaterThan", function () {

            it("should return next value for values that exist in the set", function() {
                expect(set.findLeastGreaterThan(5).value).toBe(6);
                expect(set.findLeastGreaterThan(7).value).toBe(9);
                expect(set.findLeastGreaterThan(9).value).toBe(10);
                expect(set.findLeastGreaterThan(26).value).toBe(27);
            });

            it("should return the next value", function() {
                expect(set.findLeastGreaterThan(14).value).toBe(15);
                expect(set.findLeastGreaterThan(24).value).toBe(26);
                expect(set.findLeastGreaterThan(31).value).toBe(32);
                expect(set.findLeastGreaterThan(4).value).toBe(5);
                expect(set.findLeastGreaterThan(29).value).toBe(30);
                expect(set.findLeastGreaterThan(25).value).toBe(26);
            });

            it("should return undefined for value at top of range", function() {
                expect(set.findLeastGreaterThan(34)).toBe(undefined);
            });

        });

    });

    describe("addRangeChangeListener", function () {
        // fuzz cases
        for (var seed = 0; seed < 20; seed++) {
            (function (seed) {
                var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                var rand = Fuzz.makeRandom(seed);
                numbers.sort(function () {
                    return rand() - .5;
                });
                it("should bind content changes to an array for " + numbers.join(", "), function () {
                    var mirror = [];
                    var set = SortedSet();
                    set.addRangeChangeListener(function (plus, minus, index) {
                        mirror.swap(index, minus.length, plus);
                    });
                    set.addEach(numbers);
                    expect(mirror.length).toBe(set.length);
                    mirror.forEach(function (n, i) {
                        expect(n).toBe(i);
                    });
                });
            })(seed);
        }
    });

    describe("log drawings", function () {

        function draw(set) {
            var lines = [];
            set.log({
                intersection: "+",
                through: "-",
                branchUp: "^",
                branchDown: "v",
                fromBelow: ".",
                fromAbove: "'",
                fromBoth: "x",
                strafe: "|"
            }, function (node, write, writeAbove) {
                var line = "" + node.value;
                var length = line.length;
                var rule = Array(length + 1).join("-");
                writeAbove(" +-" + rule + "-+");
                write("-| " + line + " |");
                write(" +-" + rule + "-+");
            }, lines.push, lines);
            return lines;
        }

        it("should draw a simple box", function () {
            var set = SortedSet([1]);
            expect(draw(set)).toEqual([
                "  +---+",
                "--| 1 |",
                "  +---+"
            ]);
        });

        it("should draw a graph of two ascending", function () {
            var set = SortedSet([1, 2]);
            expect(draw(set)).toEqual([
                "    +---+",
                ".---| 1 |",
                "|   +---+",
                "| +---+",
                "^-| 2 |",
                "  +---+"
            ]);
        });

        it("should draw a graph of two descending", function () {
            var set = SortedSet([2, 1]);
            expect(draw(set)).toEqual([
                "  +---+",
                "v-| 1 |",
                "| +---+",
                "|   +---+",
                "'---| 2 |",
                "    +---+"
            ]);
        });

        it("should draw a graph of three", function () {
            var set = SortedSet([3, 1, 2]);
            expect(draw(set)).toEqual([
                "    +---+",
                ".---| 1 |",
                "|   +---+",
                "| +---+",
                "+-| 2 |",
                "| +---+",
                "|   +---+",
                "'---| 3 |",
                "    +---+"
            ]);
        });

        it("should draw a complex graph", function () {
            var set = SortedSet([8, 6, 5, 3, 7, 2, 1, 4]);
            expect(draw(set)).toEqual([
                "      +---+",
                "  .---| 1 |",
                "  |   +---+",
                "  | +---+",
                ".-+-| 2 |",
                "| | +---+",
                "| |   +---+",
                "| '---| 3 |",
                "|     +---+",
                "| +---+",
                "+-| 4 |",
                "| +---+",
                "|   +---+",
                "'-v-| 5 |",
                "  | +---+",
                "  |     +---+",
                "  | .---| 6 |",
                "  | |   +---+",
                "  | | +---+",
                "  '-+-| 7 |",
                "    | +---+",
                "    |   +---+",
                "    '---| 8 |",
                "        +---+"
            ]);
        });

    });

});
