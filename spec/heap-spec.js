
var Heap = require("../heap");
var permute = require("./permute");

describe("Heap", function () {

    describe("always tracks the max value", function () {

        var commonNumbers = [1, 2, 3, 4, 5];
        permute(commonNumbers).forEach(function (numbers) {
            it(JSON.stringify(numbers), function () {

                var heap = Heap(numbers);
                var maxes = commonNumbers.slice();

                while (maxes.length > 0) {
                    var max = maxes.pop();
                    var top = heap.pop();
                    expect(top).toEqual(max);
                    expect(heap.length).toBe(maxes.length);
                }

                expect(heap.length).toBe(0);

            });
        });

        it("[5, 4, 3, 2, 1]", function () {
            var stack = [5, 4, 3, 2, 1];
            var heap = Heap(stack);
            expect(heap.content).toEqual([5, 4, 3, 2, 1]);
            expect(heap.length).toBe(5);
            expect(heap.pop()).toBe(5);
            expect(heap.content).toEqual([4, 2, 3, 1]);
            expect(heap.length).toBe(4);
            expect(heap.pop()).toBe(4);
            expect(heap.content).toEqual([3, 2, 1]);
            expect(heap.length).toBe(3);
            expect(heap.pop()).toBe(3);
            expect(heap.content).toEqual([2, 1]);
            expect(heap.length).toBe(2);
            expect(heap.pop()).toBe(2);
            expect(heap.content).toEqual([1]);
            expect(heap.length).toBe(1);
            expect(heap.pop()).toBe(1);
            expect(heap.content).toEqual([]);
            expect(heap.length).toBe(0);
        });

    });

});

