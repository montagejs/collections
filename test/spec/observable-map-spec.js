"use strict";

var ObservableMap = require("collections/observable-map");

describe("ObservableMap", function () {

    describe("observeMapChange", function () {
        it("observe, dispatch", function () {

            var map = Object.create(ObservableMap.prototype);
            var spy;

            var observer = map.observeMapChange(function (plus, minus, key, type, object) {
                spy(plus, minus, key, type, object);
            });

            spy = jasmine.createSpy();
            map.dispatchMapChange("create", "foo", 10, undefined);
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", "create", map);

        });

        it("observe, cancel, dispatch", function () {

            var map = Object.create(ObservableMap.prototype);
            var spy;

            var observer = map.observeMapChange(function (plus, minus, key, type, object) {
                spy(plus, minus, key, type, object);
            });

            spy = jasmine.createSpy();
            observer.cancel();
            map.dispatchMapChange("create", "foo", 10, undefined);
            expect(spy).not.toHaveBeenCalled();

        });

        it("observe, dispatch, cancel, dispatch", function () {

            var map = Object.create(ObservableMap.prototype);
            var spy;

            var observer = map.observeMapChange(function (plus, minus, key, type, object) {
                spy(plus, minus, key, type, object);
            });

            spy = jasmine.createSpy();
            map.dispatchMapChange("create", "foo", 10, undefined);
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", "create", map);

            observer.cancel();
            spy = jasmine.createSpy();
            map.dispatchMapChange("create", "foo", 10, undefined);
            expect(spy).not.toHaveBeenCalled();
        });
    });

});

