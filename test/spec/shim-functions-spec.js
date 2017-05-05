
require("collections/shim-object");
require("collections/shim-function");

describe("FunctionShim-spec", function () {

    describe("identity", function () {

        it("should return the first argument", function () {
            expect(Function.identity(1, 2, 3)).toBe(1);
        });

    });

    describe("noop", function () {

        // should do nothing (not verifiable)

        it("should return nothing", function () {
            expect(Function.noop(1, 2, 3)).toBe(undefined);
        });

    });

    describe("by", function () {
        var getA = function (x) {
            return x.a;
        };
        var wrappedCompare = function (a, b) {
            return Object.compare(a, b);
        };
        var compare = Function.by(getA, wrappedCompare);

        it("should compare two values", function () {
            expect(compare({a: 10}, {a: 20})).toBe(-10);
        });

        it("should have a by property", function () {
            expect(compare.by).toBe(getA);
        });

        it("should have a compare property", function () {
            expect(compare.compare).toBe(wrappedCompare);
        });

    });

});

