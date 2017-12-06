
module.exports = describeObservableMap;
function describeObservableMap(Map) {

    it("create, update, delete", function () {
        var map = new Map();
        var changeSpy = jasmine.createSpy();
        var willChangeSpy = jasmine.createSpy();
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

        changeSpy = jasmine.createSpy();
        map.set("a", 30);
        expect(changeSpy).toHaveBeenCalledWith(30, undefined, "a", "create");
        map.set("a", undefined);
        expect(changeSpy).toHaveBeenCalledWith(undefined, 30, "a", "update");

        changeSpy = jasmine.createSpy();
        changeObserver.cancel();
        willChangeObserver.cancel();

        map.set("b", 20);
        expect(changeSpy).not.toHaveBeenCalled();
    });

}

