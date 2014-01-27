"use strict";

var ObservableRange = require("../observable-range");

describe("ObservableRange", function () {

    describe("observeRangeChange", function () {
        it("observe, dispatch", function () {
            var range = Object.create(ObservableRange.prototype);
            var spy;

            var observer = range.observeRangeChange(function (plus, minus, index) {
                spy(plus, minus, index);
            });

            spy = jasmine.createSpy();
            range.dispatchRangeChange([1, 2, 3], [], 0);
            expect(spy).toHaveBeenCalledWith([1, 2, 3], [], 0);
        });
    });

});

