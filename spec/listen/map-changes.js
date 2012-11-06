
module.exports = describeMapChanges;
function describeMapChanges(Map) {

    it("should dispatch addition", function () {
        var map = Map();
        var spy = jasmine.createSpy();
        map.addBeforeMapChangeListener(function (value, key) {
            spy('before', key, value);
        });
        map.addMapChangeListener(function (value, key) {
            spy('after', key, value);
        });
        map.set(0, 10);
        expect(spy.argsForCall).toEqual([
            ['before', 0, undefined],
            ['after', 0, 10]
        ]);
    });

    it("should dispatch alteration", function () {
        var map = Map([[0, 10]]);
        var spy = jasmine.createSpy();
        map.addBeforeMapChangeListener(function (value, key) {
            spy('before', key, value);
        });
        map.addMapChangeListener(function (value, key) {
            spy('after', key, value);
        });
        map.set(0, 20);
        expect(spy.argsForCall).toEqual([
            ['before', 0, 10],
            ['after', 0, 20]
        ]);
    });

    it("should dispatch deletion", function () {
        var map = Map([[0, 20]]);
        // Arrays do not behave like maps for deletion.
        if (Array.isArray(map)) {
            return;
        }
        var spy = jasmine.createSpy();
        map.addBeforeMapChangeListener(function (value, key) {
            spy('before', key, value);
        });
        map.addMapChangeListener(function (value, key) {
            spy('after', key, value);
        });
        map.delete(0);
        expect(spy.argsForCall).toEqual([
            ['before', 0, 20],
            ['after', 0, undefined]
        ]);
    });

}

