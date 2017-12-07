
var sinon = require("sinon");
var extendSpyExpectation = require("./spy-expectation");

module.exports = describeObservableMap;
function describeObservableMap(Map) {

    extendSpyExpectation();

    it("create, update, delete", function () {
        var map = new Map();
        var changeSpy = sinon.spy();
        var willChangeSpy = sinon.spy();
        var willChangeObserver = map.observeMapWillChange(function (plus, minus, key, type) {
            willChangeSpy(plus, minus, key, type);
        });
        var changeObserver = map.observeMapChange(function (plus, minus, key, type) {
            changeSpy(plus, minus, key, type);
            expect(willChangeSpy.args[willChangeSpy.args.length - 1]).toEqual([plus, minus, key, type]);
        });

        map.set("a", 10);
        expect(changeSpy).toHaveBeenCalledWith(10, undefined, "a", "create");
        map.set("a", 20);
        expect(changeSpy).toHaveBeenCalledWith(20, 10, "a", "update");
        map.delete("a");
        expect(changeSpy).toHaveBeenCalledWith(undefined, 20, "a", "delete");

        changeSpy = sinon.spy();
        map.set("a", 30);
        expect(changeSpy).toHaveBeenCalledWith(30, undefined, "a", "create");
        map.set("a", undefined);
        expect(changeSpy).toHaveBeenCalledWith(undefined, 30, "a", "update");

        changeSpy = sinon.spy();
        changeObserver.cancel();
        willChangeObserver.cancel();

        map.set("b", 20);
        expect(changeSpy).not.toHaveBeenCalled();
    });

}

