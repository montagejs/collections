"use strict";

var sinon = require("sinon");
var extendSpyExpectation = require("./spy-expectation");
var ObservableMap = require("../observable-map");

describe("ObservableMap", function () {

    extendSpyExpectation();

    describe("observeMapChange", function () {
        it("observe, dispatch", function () {

            var map = Object.create(ObservableMap.prototype);
            var spy;

            var observer = map.observeMapChange(function (plus, minus, key, type, object) {
                spy(plus, minus, key, type, object);
            });

            spy = sinon.spy();
            map.dispatchMapChange("create", "foo", 10, undefined);
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", "create", map);

        });

        it("observe, cancel, dispatch", function () {

            var map = Object.create(ObservableMap.prototype);
            var spy;

            var observer = map.observeMapChange(function (plus, minus, key, type, object) {
                spy(plus, minus, key, type, object);
            });

            spy = sinon.spy();
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

            spy = sinon.spy();
            map.dispatchMapChange("create", "foo", 10, undefined);
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", "create", map);

            observer.cancel();
            spy = sinon.spy();
            map.dispatchMapChange("create", "foo", 10, undefined);
            expect(spy).not.toHaveBeenCalled();
        });
    });

});

