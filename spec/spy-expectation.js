
var has = require("pop-has");
var equals = require("pop-equals");

module.exports = extendSpyExpectation;
function extendSpyExpectation() {
    var Expectation = getCurrentSuite().Expectation;

    Expectation.prototype.toHaveBeenCalledWith = function () {
        var soughtArgs = Array.prototype.slice.call(arguments);
        this.assert(has(this.value.args, soughtArgs), [
           "expected spy [not] to have been called with",
           "but calls were"
        ], [
            soughtArgs,
            this.value.args
        ]);
    };

    Expectation.prototype.toHaveBeenCalled = function () {
        this.assert(!!this.value.args.length, [
            "expected spy [not] to have been called but calls were"
        ], [
            this.value.args
        ]);
    };

};

