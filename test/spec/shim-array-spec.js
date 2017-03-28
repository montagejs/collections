
require("collections/shim-array");

describe("ArrayShim-spec", function () {

    describe("clone", function () {

        it("clones", function () {
            expect([1].clone()).toEqual([1]);
        });

        it("clones deeply", function () {
            var array = [[1], [2], [3], {
                a: 10,
                b: 20,
                c: [1, 2, 3]
            }];
            expect(array.clone()).toEqual(array);
        });

        it("clones cycles", function () {
            var array = [];
            array[0] = array;
            expect(array.clone()).toEqual(array);
        });

        it("clones sparse arrays", function () {
            expect([,,].clone()).toEqual([,,]);
        });

        it("clones sparse arrays quickly", function () {
            var start = Date.now();
            new Array(Math.pow(2, 30)).clone();
            expect(Date.now() - start < 100).toBe(true);
        });

        it("spliceOne remove", function () {
            var array = [1, 2, 3];
            array.spliceOne(1);
            expect(array).toEqual([1, 3]);
        });

        it("spliceOne add", function () {
            var array = [1, 2, 3];
            array.spliceOne(1, 2.5);
            expect(array).toEqual([1, 2.5, 3]);
        });

    });

});
