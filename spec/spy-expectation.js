
module.exports = extendSpyExpectation;
function extendSpyExpectation() {
    var Expectation = getCurrentSuite().Expectation;

    Expectation.prototype.toHaveBeenCalledWith = function () {
        var args = Array.prototype.slice.call(arguments);
        this.assert(Object.has(this.value.args, args), [
           "expected spy [not] to have been called with",
           "but calls were"
        ], [
            args,
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

