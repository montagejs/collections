
module.exports = describeRangeChanges;
function describeRangeChanges(Collection) {

    var collection = Collection([1, 2, 3]);
    var spy;

    // the following tests all share the same initial collection so they
    // are sensitive to changes in order

    it("set up listeners", function () {
        collection.addBeforeOwnPropertyChangeListener("length", function (length) {
            spy("length change from", length);
        });

        collection.addOwnPropertyChangeListener("length", function (length) {
            spy("length change to", length);
        });

        collection.addBeforeRangeChangeListener(function (plus, minus, index) {
            spy("before content change at", index, "to add", plus.slice(), "to remove", minus.slice());
        });

        collection.addRangeChangeListener(function (plus, minus, index) {
            spy("content change at", index, "added", plus.slice(), "removed", minus.slice());
        });
    });

    it("clear initial values", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([1, 2, 3]);
        collection.clear();
        expect(collection.slice()).toEqual([]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 0, "to add", [], "to remove", [1, 2, 3]],
            ["length change from", 3],
            ["length change to", 0],
            ["content change at", 0, "added", [], "removed", [1, 2, 3]],
        ]);
    });

    it("push two values on empty collection", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([]); // initial
        collection.push(10, 20);
        expect(collection.slice()).toEqual([10, 20]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 0, "to add", [10, 20], "to remove", []],
            ["length change from", 0],
            ["length change to", 2],
            ["content change at", 0, "added", [10, 20], "removed", []],
        ]);

    });

    it("pop one value", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 20]);
        collection.pop();
        expect(collection.slice()).toEqual([10]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 1, "to add", [], "to remove", [20]],
            ["length change from", 2],
            ["length change to", 1],
            ["content change at", 1, "added", [], "removed", [20]],
        ]);
    });

    it("push two values on top of existing one, with hole open for splice", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10]);
        collection.push(40, 50);
        expect(collection.slice()).toEqual([10, 40, 50]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 1, "to add", [40, 50], "to remove", []],
            ["length change from", 1],
            ["length change to", 3],
            ["content change at", 1, "added", [40, 50], "removed", []],
        ]);
    });

    it("splices two values into middle", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 40, 50]);
        expect(collection.splice(1, 0, 20, 30)).toEqual([]);
        expect(collection.slice()).toEqual([10, 20, 30, 40, 50]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 1, "to add", [20, 30], "to remove", []],
            ["length change from", 3],
            ["length change to", 5],
            ["content change at", 1, "added", [20, 30], "removed", []],
        ]);
    });

    it("pushes one value to end", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 20, 30, 40, 50]);
        collection.push(60);
        expect(collection.slice()).toEqual([10, 20, 30, 40, 50, 60]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 5, "to add", [60], "to remove", []],
            ["length change from", 5],
            ["length change to", 6],
            ["content change at", 5, "added", [60], "removed", []],
        ]);
    });

    it("splices in place", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 20, 30, 40, 50, 60]);
        expect(collection.splice(2, 2, "A", "B")).toEqual([30, 40]);
        expect(collection.slice()).toEqual([10, 20, "A", "B", 50, 60]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            // no length change
            ["before content change at", 2, "to add", ["A", "B"], "to remove", [30, 40]],
            ["content change at", 2, "added", ["A", "B"], "removed", [30, 40]],
        ]);
    });

    // ---- fresh start

    it("shifts one from the beginning", function () {
        collection.clear(); // start over fresh
        collection.push(10, 20, 30);
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 20, 30]);
        expect(collection.shift()).toEqual(10);
        expect(collection.slice()).toEqual([20, 30]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 0, "to add", [], "to remove", [10]],
            ["length change from", 3],
            ["length change to", 2],
            ["content change at", 0, "added", [], "removed", [10]],
        ]);
    });

    it("sets new value at end", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([20, 30]);
        expect(collection.splice(2, 0, 40)).toEqual([]);
        expect(collection.slice()).toEqual([20, 30, 40]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 2, "to add", [40], "to remove", []],
            ["length change from", 2],
            ["length change to", 3],
            ["content change at", 2, "added", [40], "removed", []],
        ]);
    });

    it("sets new value at beginning", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([20, 30, 40]);
        expect(collection.splice(0, 1, 10)).toEqual([20]);
        expect(collection.slice()).toEqual([10, 30, 40]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 0, "to add", [10], "to remove", [20]],
            ["content change at", 0, "added", [10], "removed", [20]],
        ]);
    });

    // ---- fresh start

    it("unshifts one to the beginning", function () {
        collection.clear(); // start over fresh
        expect(collection.slice()).toEqual([]);
        spy = jasmine.createSpy();
        collection.unshift(30);
        expect(collection.slice()).toEqual([30]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 0, "to add", [30], "to remove", []],
            ["length change from", 0],
            ["length change to", 1],
            ["content change at", 0, "added", [30], "removed", []],
        ]);
    });

    it("unshifts two values on beginning of already populated collection", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([30]);
        collection.unshift(10, 20);
        expect(collection.slice()).toEqual([10, 20, 30]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            // added and removed values reflect the ending values, not the values at the time of the call
            ["before content change at", 0, "to add", [10, 20], "to remove", []],
            ["length change from", 1],
            ["length change to", 3],
            ["content change at", 0, "added", [10, 20], "removed", []],
        ]);
    });

    it("reverses in place", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 20, 30]);
        collection.reverse();
        expect(collection.slice()).toEqual([30, 20, 10]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 0, "to add", [30, 20, 10], "to remove", [10, 20, 30]],
            ["content change at", 0, "added", [30, 20, 10], "removed", [10, 20, 30]],
        ]);
    });

    it("sorts in place", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([30, 20, 10]);
        collection.sort();
        expect(collection.slice()).toEqual([10, 20, 30]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            // added and removed values reflect the ending values, not the values at the time of the call
            ["before content change at", 0, "to add", [10, 20, 30], "to remove", [30, 20, 10]],
            ["content change at", 0, "added", [10, 20, 30], "removed", [30, 20, 10]],
        ]);
    });

    it("deletes one value", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 20, 30]);
        expect(collection.delete(40)).toBe(false); // to exercise deletion of non-existing entry
        expect(collection.delete(20)).toBe(true);
        expect(collection.slice()).toEqual([10, 30]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 1, "to add", [], "to remove", [20]],
            ["length change from", 3],
            ["length change to", 2],
            ["content change at", 1, "added", [], "removed", [20]],
        ]);
    });

    it("clears all values finally", function () {
        spy = jasmine.createSpy();
        expect(collection.slice()).toEqual([10, 30]);
        collection.clear();
        expect(collection.slice()).toEqual([]);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ["before content change at", 0, "to add", [], "to remove", [10, 30]],
            ["length change from", 2],
            ["length change to", 0],
            ["content change at", 0, "added", [], "removed", [10, 30]],
        ]);
    });

    it("removes content change listeners", function () {
        spy = jasmine.createSpy();

        // mute all listeners
        // current is now optimized to be an objet when there's only one listener vs an array when there's more than one.
        //This isn't intended to be a public API
        var descriptor = collection.getOwnPropertyChangeDescriptor('length'),
            currentWillChangeListeners = descriptor.willChangeListeners.current,
            currentChangeListeners = descriptor.changeListeners.current;

        if(Array.isArray(currentWillChangeListeners)) {
            currentWillChangeListeners.forEach(function (listener) {
                collection.removeBeforeOwnPropertyChangeListener('length', listener);
            });
        }
        else if(currentWillChangeListeners){
            collection.removeBeforeOwnPropertyChangeListener('length', currentWillChangeListeners);
        }

        if(Array.isArray(currentChangeListeners)) {
            currentChangeListeners.forEach(function (listener) {
                collection.removeOwnPropertyChangeListener('length', listener);
            });
        }
        else if(currentChangeListeners){
            collection.removeOwnPropertyChangeListener('length', currentChangeListeners);
        }


        // current is now optimized to be an objet when there's only one listener vs an array when there's more than one.
        //This isn't intended to be a public API
        var descriptor = collection.getRangeChangeDescriptor(),
            currentWillChangeListeners = descriptor.willChangeListeners.current,
            currentChangeListeners = descriptor.changeListeners.current;

        if(Array.isArray(currentWillChangeListeners)) {
            currentWillChangeListeners.forEach(function (listener) {
                collection.removeBeforeRangeChangeListener(listener);
            });
        }
        else if(currentWillChangeListeners) {
            collection.removeBeforeRangeChangeListener(currentWillChangeListeners);
        }

        if(Array.isArray(currentChangeListeners)) {
            currentChangeListeners.forEach(function (listener) {
                collection.removeRangeChangeListener(listener);
            });
        }
        else if(currentChangeListeners){
            collection.removeRangeChangeListener(currentChangeListeners);
        }

        // modify
        collection.splice(0, 0, 1, 2, 3);

        // note silence
        expect(spy).not.toHaveBeenCalled();
    });

    // --------------- FIN -----------------

    it("handles cyclic content change listeners", function () {
        var foo = Collection([]);
        var bar = Collection([]);
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
        expect(bar.slice()).toEqual([10, 20, 30]);
        bar.pop();
        expect(foo.slice()).toEqual([10, 20]);
    });

    it("observes length changes on collections that are not otherwised observed", function () {
        var collection = new Collection([1, 2, 3]);
        var spy = jasmine.createSpy();
        collection.addOwnPropertyChangeListener("length", spy);
        collection.push(4);
        expect(spy).toHaveBeenCalled();
    });

    it("does not throw an error when dispatching a range change on a collection with no range change listeners that previously had more than one listener", function () {
        var collection = new Collection([1, 2, 3]);
        // Adding two range change listeners to trigger the behavior of change listeners being stored in an array
        var cancelRangeChangeListenerA = collection.addRangeChangeListener(Function.noop);
        var cancelRangeChangeListenerB = collection.addRangeChangeListener(Function.noop);
        cancelRangeChangeListenerA();
        cancelRangeChangeListenerB();
        collection.push(5);
    });
}
