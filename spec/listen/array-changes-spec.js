
require("../../listen/array-changes");
var describeRangeChanges = require("./range-changes");

describe("Array change dispatch", function () {

    // TODO (make consistent with List)
    // describeRangeChanges(Array.from);

    var array = [1, 2, 3];
    var spy;

    // the following tests all share the same initial array so they
    // are sensitive to changes in order

    it("set up listeners", function () {

        array.addBeforeOwnPropertyChangeListener("length", function (length) {
            spy("length change from", length);
        });

        array.addOwnPropertyChangeListener("length", function (length) {
            spy("length change to", length);
        });

        array.addBeforeRangeChangeListener(function (plus, minus, index) {
            spy("before content change at", index, "to add", plus.slice(), "to remove", minus.slice());
        });

        array.addRangeChangeListener(function (plus, minus, index) {
            spy("content change at", index, "added", plus.slice(), "removed", minus.slice());
        });

        array.addBeforeMapChangeListener(function (value, key) {
            spy("change at", key, "from", value);
        });

        array.addMapChangeListener(function (value, key) {
            spy("change at", key, "to", value);
        });

    });

    it("change dispatch properties should not be enumerable", function () {
        // this verifies that dispatchesRangeChanges and dispatchesMapChanges
        // are both non-enumerable, and any other properties that might get
        // added in the future.
        for (var name in array) {
            expect(isNaN(+name)).toBe(false);
        }
    });

    it("clear initial values", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([1, 2, 3]);
        array.clear();
        expect(array).toEqual([]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 0, "to add", [], "to remove", [1, 2, 3]],
            ["change at", 0, "from", 1],
            ["change at", 1, "from", 2],
            ["change at", 2, "from", 3],
            ["change at", 0, "to", undefined],
            ["change at", 1, "to", undefined],
            ["change at", 2, "to", undefined],
            ["content change at", 0, "added", [], "removed", [1, 2, 3]],
            ["length change to", 0]
        ]);
    });

    it("push two values on empty array", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([]); // initial
        array.push(10, 20);
        expect(array).toEqual([10, 20]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 0],
            ["before content change at", 0, "to add", [10, 20], "to remove", []],
            ["change at", 0, "from", undefined],
            ["change at", 1, "from", undefined],
            ["change at", 0, "to", 10],
            ["change at", 1, "to", 20],
            ["content change at", 0, "added", [10, 20], "removed", []],
            ["length change to", 2],
        ]);

    });

    it("pop one value", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 20]);
        array.pop();
        expect(array).toEqual([10]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 2],
            ["before content change at", 1, "to add", [], "to remove", [20]],
            ["change at", 1, "from", 20],
            ["change at", 1, "to", undefined],
            ["content change at", 1, "added", [], "removed", [20]],
            ["length change to", 1],
        ]);
    });

    it("push two values on top of existing one, with hole open for splice", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10]);
        array.push(40, 50);
        expect(array).toEqual([10, 40, 50]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 1],
            ["before content change at", 1, "to add", [40, 50], "to remove", []],
            ["change at", 1, "from", undefined],
            ["change at", 2, "from", undefined],
            ["change at", 1, "to", 40],
            ["change at", 2, "to", 50],
            ["content change at", 1, "added", [40, 50], "removed", []],
            ["length change to", 3]
        ]);
    });

    it("splices two values into middle", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 40, 50]);
        expect(array.splice(1, 0, 20, 30)).toEqual([]);
        expect(array).toEqual([10, 20, 30, 40, 50]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 1, "to add", [20, 30], "to remove", []],
            ["change at", 1, "from", 40],
            ["change at", 2, "from", 50],
            ["change at", 3, "from", undefined],
            ["change at", 4, "from", undefined],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 30],
            ["change at", 3, "to", 40],
            ["change at", 4, "to", 50],
            ["content change at", 1, "added", [20, 30], "removed", []],
            ["length change to", 5]
        ]);
    });

    it("pushes one value to end", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 20, 30, 40, 50]);
        array.push(60);
        expect(array).toEqual([10, 20, 30, 40, 50, 60]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 5],
            ["before content change at", 5, "to add", [60], "to remove", []],
            ["change at", 5, "from", undefined],
            ["change at", 5, "to", 60],
            ["content change at", 5, "added", [60], "removed", []],
            ["length change to", 6]
        ]);
    });

    it("splices in place", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 20, 30, 40, 50, 60]);
        expect(array.splice(2, 2, "A", "B")).toEqual([30, 40]);
        expect(array).toEqual([10, 20, "A", "B", 50, 60]);
        expect(spy.argsForCall).toEqual([
            // no length change
            ["before content change at", 2, "to add", ["A", "B"], "to remove", [30, 40]],
            ["change at", 2, "from", 30],
            ["change at", 3, "from", 40],
            ["change at", 2, "to", "A"],
            ["change at", 3, "to", "B"],
            ["content change at", 2, "added", ["A", "B"], "removed", [30, 40]],
        ]);
    });

    // ---- fresh start

    it("shifts one from the beginning", function () {
        array.clear(); // start over fresh
        array.push(10, 20, 30);
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 20, 30]);
        expect(array.shift()).toEqual(10);
        expect(array).toEqual([20, 30]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 0, "to add", [], "to remove", [10]],
            ["change at", 0, "from", 10],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 30],
            ["change at", 0, "to", 20],
            ["change at", 1, "to", 30],
            ["change at", 2, "to", undefined],
            ["content change at", 0, "added", [], "removed", [10]],
            ["length change to", 2]
        ]);
    });

    it("sets new value at end", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([20, 30]);
        expect(array.set(2, 40)).toBe(array);
        expect(array).toEqual([20, 30, 40]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 2],
            ["before content change at", 2, "to add", [40], "to remove", []],
            ["change at", 2, "from", undefined],
            ["change at", 2, "to", 40],
            ["content change at", 2, "added", [40], "removed", []],
            ["length change to", 3]
        ]);
    });

    it("sets new value at beginning", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([20, 30, 40]);
        expect(array.set(0, 10)).toBe(array);
        expect(array).toEqual([10, 30, 40]);
        expect(spy.argsForCall).toEqual([
            ["before content change at", 0, "to add", [10], "to remove", [20]],
            ["change at", 0, "from", 20],
            ["change at", 0, "to", 10],
            ["content change at", 0, "added", [10], "removed", [20]]
        ]);
    });

    // ---- fresh start

    it("unshifts one to the beginning", function () {
        array.clear(); // start over fresh
        expect(array).toEqual([]);
        spy = jasmine.createSpy();
        array.unshift(30);
        expect(array).toEqual([30]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 0],
            ["before content change at", 0, "to add", [30], "to remove", []],
            ["change at", 0, "from", undefined],
            ["change at", 0, "to", 30],
            ["content change at", 0, "added", [30], "removed", []],
            ["length change to", 1]
        ]);
    });

    it("unshifts two values on beginning of already populated array", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([30]);
        array.unshift(10, 20);
        expect(array).toEqual([10, 20, 30]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 1],
            // added and removed values reflect the ending values, not the values at the time of the call
            ["before content change at", 0, "to add", [10, 20], "to remove", []],
            ["change at", 0, "from", 30],
            ["change at", 1, "from", undefined],
            ["change at", 2, "from", undefined],
            ["change at", 0, "to", 10],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 30],
            ["content change at", 0, "added", [10, 20], "removed", []],
            ["length change to", 3]
        ]);
    });

    it("reverses in place", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 20, 30]);
        array.reverse();
        expect(array).toEqual([30, 20, 10]);
        expect(spy.argsForCall).toEqual([
            ["before content change at", 0, "to add", [30, 20, 10], "to remove", [10, 20, 30]],
            ["change at", 0, "from", 10],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 30],
            ["change at", 0, "to", 30],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 10],
            ["content change at", 0, "added", [30, 20, 10], "removed", [10, 20, 30]],
        ]);
    });

    it("sorts in place", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([30, 20, 10]);
        array.sort();
        expect(array).toEqual([10, 20, 30]);
        expect(spy.argsForCall).toEqual([
            // added and removed values reflect the ending values, not the values at the time of the call
            ["before content change at", 0, "to add", [30, 20, 10], "to remove", [30, 20, 10]],
            ["change at", 0, "from", 30],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 10],
            ["change at", 0, "to", 10],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 30],
            ["content change at", 0, "added", [10, 20, 30], "removed", [10, 20, 30]],
        ]);
    });

    it("deletes one value", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 20, 30]);
        expect(array.delete(40)).toBe(false); // to exercise deletion of non-existing entry
        expect(array.delete(20)).toBe(true);
        expect(array).toEqual([10, 30]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 1, "to add", [], "to remove", [20]],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 30],
            ["change at", 1, "to", 30],
            ["change at", 2, "to", undefined],
            ["content change at", 1, "added", [], "removed", [20]],
            ["length change to", 2]
        ]);
    });

    it("clears all values finally", function () {
        spy = jasmine.createSpy();
        expect(array).toEqual([10, 30]);
        array.clear();
        expect(array).toEqual([]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 2],
            ["before content change at", 0, "to add", [], "to remove", [10, 30]],
            ["change at", 0, "from", 10],
            ["change at", 1, "from", 30],
            ["change at", 0, "to", undefined],
            ["change at", 1, "to", undefined],
            ["content change at", 0, "added", [], "removed", [10, 30]],
            ["length change to", 0]
        ]);
    });

    it("removes content change listeners", function () {
        spy = jasmine.createSpy();

        // mute all listeners

        var descriptor = array.getOwnPropertyChangeDescriptor('length');
        descriptor.willChangeListeners.forEach(function (listener) {
            array.removeBeforeOwnPropertyChangeListener('length', listener);
        });
        descriptor.changeListeners.forEach(function (listener) {
            array.removeOwnPropertyChangeListener('length', listener);
        });

        var descriptor = array.getRangeChangeDescriptor();
        descriptor.willChangeListeners.forEach(function (listener) {
            array.removeBeforeRangeChangeListener(listener);
        });
        descriptor.changeListeners.forEach(function (listener) {
            array.removeRangeChangeListener(listener);
        });

        var descriptor = array.getMapChangeDescriptor();
        descriptor.willChangeListeners.forEach(function (listener) {
            array.removeBeforeMapChangeListener(listener);
        });
        descriptor.changeListeners.forEach(function (listener) {
            array.removeMapChangeListener(listener);
        });

        // modify
        array.splice(0, 0, 1, 2, 3);

        // note silence
        expect(spy).wasNotCalled();
    });

    // --------------- FIN -----------------

    it("handles cyclic content change listeners", function () {
        var foo = [];
        var bar = [];
        foo.addRangeChangeListener(function (plus, minus, index) {
            // if this is a change in response to a change in bar,
            // do not send back
            if (bar.getRangeChangeDescriptor().isActive)
                return;
            bar.splice.apply(bar, [index, minus.length].concat(plus));
        });
        bar.addRangeChangeListener(function (plus, minus, index) {
            if (foo.getRangeChangeDescriptor().isActive)
                return;
            foo.splice.apply(foo, [index, minus.length].concat(plus));
        });
        foo.push(10, 20, 30);
        expect(bar).toEqual([10, 20, 30]);
        bar.pop();
        expect(foo).toEqual([10, 20]);
    });

    it("observes length changes on arrays that are not otherwised observed", function () {
        var array = [1, 2, 3];
        var spy = jasmine.createSpy();
        array.addOwnPropertyChangeListener("length", spy);
        array.push(4);
        expect(spy).toHaveBeenCalled();
    });

});

