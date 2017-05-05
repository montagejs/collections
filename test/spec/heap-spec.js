
var Heap = require("collections/heap");
var permute = require("./permute");
var describeToJson = require("./to-json");

describe("Heap-spec", function () {

    describeToJson(Heap, [4, 3, 2, 1]);

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

    it("should be observable", function () {

        var heap = new Heap([1,2,3,4,5]);
        var top;
        heap.addMapChangeListener(function (value, key) {
            if (key === 0) {
                top = value;
            }
        });

        heap.push(7);
        expect(top).toBe(7);

        heap.pop();
        expect(top).toBe(5);

        heap.pop();
        expect(top).toBe(4);

        heap.pop();
        expect(top).toBe(3);

    });

    it("should delete properly", function () {

        var heap = new Heap([1, 2, 3, 4, 5, 6]);
        expect(heap.length).toEqual(6);
        heap.delete(3);
        expect(heap.sorted()).toEqual([1, 2, 4, 5, 6]);
        expect(heap.length).toEqual(5);
        heap.delete(6);
        expect(heap.sorted()).toEqual([1, 2, 4, 5]);
        expect(heap.length).toEqual(4);
        heap.delete(1);
        expect(heap.sorted()).toEqual([2, 4, 5]);
        expect(heap.length).toEqual(3);
        heap.delete(4);
        expect(heap.sorted()).toEqual([2, 5]);
        expect(heap.length).toEqual(2);
        heap.delete(2);
        expect(heap.sorted()).toEqual([5]);
        expect(heap.length).toEqual(1);
        heap.delete(5);
        expect(heap.sorted()).toEqual([]);
        expect(heap.length).toEqual(0);
        expect(heap.delete(null)).toBe(false);
        expect(heap.sorted()).toEqual([]);
        expect(heap.length).toEqual(0);

    });

});
