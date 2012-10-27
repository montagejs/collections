
var SortedSet = require("../sorted-set");
var TreeLog = require("../tree-log");
var describeDequeue = require("./dequeue");
var describeCollection = require("./collection");

describe("SortedSet", function () {

    // Happens to qualify as a dequeue, since the tests keep the content in
    // sorted order.  SortedSet has meaningful pop and shift operations, but
    // push and unshift just add the arguments into their proper sorted
    // positions rather than the ends.
    describeDequeue(SortedSet, true);

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

