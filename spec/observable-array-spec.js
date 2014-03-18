
var sinon = require("sinon");
var extendSpyExpectation = require("./spy-expectation");
require("../observable-array");
// TODO var describeObservableRange = require("./observable-range");
// TODO make Array.from consistent with List

extendSpyExpectation();

describe("Array", function () {
    it("change dispatch properties should not be enumerable", function () {
        // this verifies that dispatchesRangeChanges and dispatchesMapChanges
        // are both non-enumerable, and any other properties that might get
        // added in the future.
        for (var name in [1, 2,, 3]) {
            expect(isNaN(+name)).toBe(false);
        }
    });
});

describe("Array change dispatch with map observers", function () {

    var array;
    var spy;
    var continued;

    beforeEach(function () {
        if (continued) {
            continued = false;
            return;
        }

        array = [];

        array.observePropertyWillChange("length", function (plus, minus) {
            spy("length will change from", minus, "to", plus);
        });

        array.observePropertyChange("length", function (plus, minus) {
            spy("length change from", minus, "to", plus);
        });

        array.observeRangeWillChange(function (plus, minus, index) {
            spy("range will change from", minus, "to", plus, "at", index);
        });

        array.observeRangeChange(function (plus, minus, index) {
            spy("range change from", minus, "to", plus, "at", index);
        });

        array.observeMapWillChange(function (plus, minus, index, type) {
            spy("map will", type, index, "from", minus, "to", plus);
        });

        array.observeMapChange(function (plus, minus, index, type) {
            spy("map", type, index, "from", minus, "to", plus);
        });

    });

    it("push", function () {
        spy = sinon.spy();
        array.push(1, 2, 3);
        expect(spy.args).toEqual([
            ["length will change from", 0, "to", 3],
            ["range will change from", [], "to", [1, 2, 3], "at", 0],
            ["map will", "create", 0, "from", undefined, "to", 1],
            ["map will", "create", 1, "from", undefined, "to", 2],
            ["map will", "create", 2, "from", undefined, "to", 3],
            ["map", "create", 0, "from", undefined, "to", 1],
            ["map", "create", 1, "from", undefined, "to", 2],
            ["map", "create", 2, "from", undefined, "to", 3],
            ["range change from", [], "to", [1, 2, 3], "at", 0],
            ["length change from", 0, "to", 3]
        ]);
        continued = true;
    });

    it("clear", function () {
        spy = sinon.spy();
        array.clear();
        expect(array).toEqual([]);
        expect(spy.args).toEqual([
            ["length will change from", 3, "to", 0],
            ["range will change from", [1, 2, 3], "to", [], "at", 0],
            ["map will", "delete", 0, "from", 1, "to", undefined],
            ["map will", "delete", 1, "from", 2, "to", undefined],
            ["map will", "delete", 2, "from", 3, "to", undefined],
            ["map", "delete", 0, "from", 1, "to", undefined],
            ["map", "delete", 1, "from", 2, "to", undefined],
            ["map", "delete", 2, "from", 3, "to", undefined],
            ["range change from", [1, 2, 3], "to", [], "at", 0],
            ["length change from", 3, "to", 0]
        ]);
    });

    it("pop one value from an array", function () {
        array.push(1, 2, 3);
        spy = sinon.spy();
        array.pop();
        expect(spy.args).toEqual([
            ["length will change from", 3, "to", 2],
            ["range will change from", [3], "to", [], "at", 2],
            ["map will", "delete", 2, "from", 3, "to", undefined],
            ["map", "delete", 2, "from", 3, "to", undefined],
            ["range change from", [3], "to", [], "at", 2],
            ["length change from", 3, "to", 2]
        ]);
    });

    it("shift one value off an array", function () {
        array.push(1, 2, 3);
        spy = sinon.spy();
        array.shift();
        expect(spy.args).toEqual([
            ["length will change from", 3, "to", 2],
            ["range will change from", [1], "to", [], "at", 0],
            ["map will", "update", 0, "from", 1, "to", 2],
            ["map will", "update", 1, "from", 2, "to", 3],
            ["map will", "delete", 2, "from", 3, "to", undefined],
            ["map", "update", 0, "from", 1, "to", 2],
            ["map", "update", 1, "from", 2, "to", 3],
            ["map", "delete", 2, "from", 3, "to", undefined],
            ["range change from", [1], "to", [], "at", 0],
            ["length change from", 3, "to", 2]
        ]);
    });

    it("replaces values into the midst of an array", function () {
        array.push(1, 3, 2, 4);
        spy = sinon.spy();
        array.splice(1, 2, 2, 3);
        expect(spy.args).toEqual([
            ["range will change from", [3, 2], "to", [2, 3], "at", 1],
            ["map will", "update", 1, "from", 3, "to", 2],
            ["map will", "update", 2, "from", 2, "to", 3],
            ["map", "update", 1, "from", 3, "to", 2],
            ["map", "update", 2, "from", 2, "to", 3],
            ["range change from", [3, 2], "to", [2, 3], "at", 1]
        ]);
    });

    it("replaces values into the midst of an array, from a negative index", function () {
        array.push(1, 3, 2, 4);
        spy = sinon.spy();
        array.splice(-3, 2, 2, 3);
        expect(spy.args).toEqual([
            ["range will change from", [3, 2], "to", [2, 3], "at", 1],
            ["map will", "update", 1, "from", 3, "to", 2],
            ["map will", "update", 2, "from", 2, "to", 3],
            ["map", "update", 1, "from", 3, "to", 2],
            ["map", "update", 2, "from", 2, "to", 3],
            ["range change from", [3, 2], "to", [2, 3], "at", 1]
        ]);
    });

    it("splices values into the midst of an array", function () {
        array.push(1, 4);
        spy = sinon.spy();
        array.splice(1, 0, 2, 3);
        expect(spy.args).toEqual([
            ["length will change from", 2, "to", 4],
            ["range will change from", [], "to", [2, 3], "at", 1],
            ["map will", "update", 1, "from", 4, "to", 2],
            ["map will", "create", 2, "from", undefined, "to", 3],
            ["map will", "create", 3, "from", undefined, "to", 4],
            ["map", "update", 1, "from", 4, "to", 2],
            ["map", "create", 2, "from", undefined, "to", 3],
            ["map", "create", 3, "from", undefined, "to", 4],
            ["range change from", [], "to", [2, 3], "at", 1],
            ["length change from", 2, "to", 4]
        ]);
    });

    it("splices values into the midst of an array, with a negative length", function () {
        array.push(1, 4);
        spy = sinon.spy();
        array.splice(1, -1, 2, 3);
        expect(spy.args).toEqual([
            ["length will change from", 2, "to", 4],
            ["range will change from", [], "to", [2, 3], "at", 1],
            ["map will", "update", 1, "from", 4, "to", 2],
            ["map will", "create", 2, "from", undefined, "to", 3],
            ["map will", "create", 3, "from", undefined, "to", 4],
            ["map", "update", 1, "from", 4, "to", 2],
            ["map", "create", 2, "from", undefined, "to", 3],
            ["map", "create", 3, "from", undefined, "to", 4],
            ["range change from", [], "to", [2, 3], "at", 1],
            ["length change from", 2, "to", 4]
        ]);
    });

    it("set at end", function () {
        array.push(1, 2, 3);
        spy = sinon.spy();
        array.set(3, 4);
        expect(spy.args).toEqual([
            ["length will change from", 3, "to", 4],
            ["range will change from", [], "to", [4], "at", 3],
            ["map will", "create", 3, "from", undefined, "to", 4],
            ["map", "create", 3, "from", undefined, "to", 4],
            ["range change from", [], "to", [4], "at", 3],
            ["length change from", 3, "to", 4]
        ]);
    });

    it("set at beginning", function () {
        array.push(1, 2, 3);
        spy = sinon.spy();
        array.set(0, 3);
        expect(spy.args).toEqual([
            ["range will change from", [1], "to", [3], "at", 0],
            ["map will", "update", 0, "from", 1, "to", 3],
            ["map", "update", 0, "from", 1, "to", 3],
            ["range change from", [1], "to", [3], "at", 0]
        ]);
    });

    it("unshifts", function () {
        array.push(3, 4);
        spy = sinon.spy();
        array.unshift(1, 2);
        expect(spy.args).toEqual([
            ["length will change from", 2, "to", 4],
            ["range will change from", [], "to", [1, 2], "at", 0],
            ["map will", "update", 0, "from", 3, "to", 1],
            ["map will", "update", 1, "from", 4, "to", 2],
            ["map will", "create", 2, "from", undefined, "to", 3],
            ["map will", "create", 3, "from", undefined, "to", 4],
            ["map", "update", 0, "from", 3, "to", 1],
            ["map", "update", 1, "from", 4, "to", 2],
            ["map", "create", 2, "from", undefined, "to", 3],
            ["map", "create", 3, "from", undefined, "to", 4],
            ["range change from", [], "to", [1, 2], "at", 0],
            ["length change from", 2, "to", 4]
        ]);
    });

    it("reverses in place", function () {
        array.push(10, 20, 30);
        spy = sinon.spy();
        array.reverse();
        expect(spy.args).toEqual([
            ["range will change from", [10, 20, 30], "to", [30, 20, 10], "at", 0],
            ["map will", "update", 0, "from", 10, "to", 30],
            ["map will", "update", 2, "from", 30, "to", 10],
            ["map", "update", 0, "from", 10, "to", 30],
            ["map", "update", 2, "from", 30, "to", 10],
            ["range change from", [10, 20, 30], "to", [30, 20, 10], "at", 0]
        ]);
    });

    it("sorts in place", function () {
        array.push(30, 20, 10);
        spy = sinon.spy();
        array.sort();
        expect(spy.args).toEqual([
            ["range will change from", [30, 20, 10], "to", [10, 20, 30], "at", 0],
            ["map will", "update", 0, "from", 30, "to", 10],
            ["map will", "update", 2, "from", 10, "to", 30],
            ["map", "update", 0, "from", 30, "to", 10],
            ["map", "update", 2, "from", 10, "to", 30],
            ["range change from", [30, 20, 10], "to", [10, 20, 30], "at", 0]
        ]);
    });

    it("does not dispatch redundant map changes", function () {
        array.length = 3;
        spy = sinon.spy();
        array.set(0, void 0);
        array.set(0, void 0);
        array.set(0, 1);
        expect(spy.args).toEqual([

            // opens holes
            ["range will change from", [,], "to", [void 0], "at", 0],
            ["range change from", [,], "to", [void 0], "at", 0],

            // no real change
            ["range will change from", [void 0], "to", [void 0], "at", 0],
            ["range change from", [void 0], "to", [void 0], "at", 0],

            // map change
            ["range will change from", [void 0], "to", [1], "at", 0],
            ["map will", "update", 0, "from", void 0, "to", 1],
            ["map", "update", 0, "from", void 0, "to", 1],
            ["range change from", [void 0], "to", [1], "at", 0]

        ]);
    });

    // TODO cancel observers

});

describe("Array changes", function () {

    it("observes range changes on arrays that are not otherwised observed", function () {
        var array = [1, 2, 3];
        var spy = sinon.spy();
        array.observeRangeChange(spy);
        array.push(4);
        expect(spy).toHaveBeenCalledWith([4], [], 3, array);
    });

    it("observes length changes on arrays that are not otherwised observed", function () {
        var array = [1, 2, 3];
        var spy = sinon.spy();
        array.observePropertyChange("length", spy);
        array.push(4);
        expect(spy).toHaveBeenCalledWith(4, 3, "length", array);
    });

    it("observes map changes on arrays that are not otherwised observed", function () {
        var array = [1, 2, 3];
        var spy = sinon.spy();
        array.observeMapChange(spy);
        array.push(4);
        expect(spy).toHaveBeenCalledWith(4, undefined, 3, "create", array);
    });

    it("observes index changes on arrays that are not otherwised observed", function () {
        var array = [1, 2, 3];
        var spy = sinon.spy();
        array.observePropertyChange(3, spy);
        array.push(4);
        expect(spy).toHaveBeenCalledWith(4, undefined, 3, array);
    });

    it("does not observe redundant property changes", function () {
        var array = [];
        var spy = sinon.spy();
        array.observePropertyChange(0, spy);
        array.set(0, 1);
        expect(array).toEqual([1]);
        expect(spy).toHaveBeenCalledWith(1, void 0, 0, array);

        spy.args.clear();
        array.set(0, 1);
        expect(spy).not.toHaveBeenCalled();
    });

    describe("swap", function () {
        it("works with large arrays", function () {
            var array = [];
            array.makeRangeChangesObservable();
            var otherArray;
            otherArray = new Array(200000);
            // Should not throw a Maximum call stack size exceeded error.
            expect(function () {
                array.swap(0, array.length, otherArray);
            }).not.toThrow();
            expect(array.length).toEqual(200000);
        });
    });

});

describe("splice", function () {

    it("truncates start to length", function () {
        var array = [];
        array.splice(1000, 0, 1, 2, 3);
        expect(array).toEqual([1, 2, 3]);
    });

    it("truncates start to length on an observed array", function () {
        var array = [];
        array.makeRangeChangesObservable();
        array.splice(1000, 0, 1, 2, 3);
        expect(array).toEqual([1, 2, 3]);
    });

});

describe("swap", function () {
    it("grows the array if start beyond length", function () {
        var array = [];
        var spy = sinon.spy();
        array.observeRangeChange(function (plus, minus, index) {
            spy(plus, minus, index);
        });
        array.swap(4, 0, [1, 2, 3]);
        expect(spy).toHaveBeenCalledWith([ , , , , 1, 2, 3], [], 0);
        expect(array).toEqual([ , , , , 1, 2, 3]);
    });
});

describe("set", function () {
    it("grows the array if start beyond length", function () {
        var array = [];
        var spy = sinon.spy();
        array.observeRangeChange(function (plus, minus, index) {
            spy(plus, minus, index);
        });
        array.set(4, 1);
        expect(spy).toHaveBeenCalledWith([ , , , , 1], [], 0);
        expect(array).toEqual([ , , , , 1]);
    });
});

