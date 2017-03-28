
var Iterator = require("collections/iterator");

describe("Iterator-spec", function () {

    shouldWorkWithConstructor(function withoutNew(iterable) {
        return Iterator(iterable);
    });

    shouldWorkWithConstructor(function withNew(iterable) {
        return new Iterator(iterable);
    });

    describe("Iterator.cycle", function () {

        it("should work", function () {
            var iterator = Iterator.cycle([1, 2, 3]);
            for (var i = 0; i < 10; i++) {
                expect(iterator.next().value).toBe(1);
                expect(iterator.next().value).toBe(2);
                expect(iterator.next().value).toBe(3);
            }
        });

        it("should work with specified number of times", function () {
            var iterator = Iterator.cycle([1, 2, 3], 2);
            for (var i = 0; i < 2; i++) {
                expect(iterator.next().value).toBe(1);
                expect(iterator.next().value).toBe(2);
                expect(iterator.next().value).toBe(3);
            }
            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });

        it("should work with specified 0 times", function () {
            var iterator = Iterator.cycle([1, 2, 3], 0);
            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });

        it("should work with specified -1 times", function () {
            var iterator = Iterator.cycle([1, 2, 3], 0);
            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });

    });

    describe("Iterator.repeat", function () {

        it("should repeat a value indefinite times by default", function () {
            var iterator = Iterator.repeat(1);
            for (var i = 0; i < 10; i++) {
                expect(iterator.next().value).toEqual(1);
            }
        });

        it("should repeat a value specified times", function () {
            var iterator = Iterator.repeat(1, 3);
            for (var i = 0; i < 3; i++) {
                expect(iterator.next().value).toEqual(1);
            }
            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });

    });

    describe("Iterator.concat", function () {
        it("should work", function () {
            var iterator = Iterator.concat([
               Iterator([1, 2, 3]),
               Iterator([4, 5, 6]),
               Iterator([7, 8, 9])
            ]);
            for (var i = 0; i < 9; i++) {
                expect(iterator.next().value).toEqual(i + 1);
            }
            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });
    });

    describe("Iterator.chain", function () {
        it("should work", function () {
            var iterator = Iterator.chain(
               Iterator([1, 2, 3]),
               Iterator([4, 5, 6]),
               Iterator([7, 8, 9])
            );
            for (var i = 0; i < 9; i++) {
                expect(iterator.next().value).toEqual(i + 1);
            }
            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });
    });

    describe("Iterator.unzip", function () {
        it("should work", function () {
            var iterator = Iterator.unzip([
                Iterator([0, 'A', 'x']),
                Iterator([1, 'B', 'y', 'I']),
                Iterator([2, 'C'])
            ]);

            expect(iterator.next().value).toEqual([0, 1, 2]);
            expect(iterator.next().value).toEqual(['A', 'B', 'C']);

            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });
    });

    describe("Iterator.zip", function () {
        it("should work", function () {
            var iterator = Iterator.zip(
                Iterator([0, 'A', 'x']),
                Iterator([1, 'B', 'y', 'I']),
                Iterator([2, 'C'])
            );

            expect(iterator.next().value).toEqual([0, 1, 2]);
            expect(iterator.next().value).toEqual(['A', 'B', 'C']);

            expect(iterator.next().done).toBe(true);
            expect(iterator.next().done).toBe(true);
        });
    });

    describe("Iterator.range", function () {
    });

    describe("Iterator.count", function () {
    });

});

function shouldWorkWithConstructor(Iterator) {

    function definiteIterator() {
        return Iterator([1, 2, 3]);
    }

    function indefiniteIterator() {
        var n = 0;
        return Iterator(function () {
            return {
                done: false,
                value: n++
            };
        });
    }

    it("should iterate an array", function () {
        var iterator = Iterator([1, 2, 3]);
        expect(iterator.next().value).toEqual(1);
        expect(iterator.next().value).toEqual(2);
        expect(iterator.next().value).toEqual(3);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().done).toBe(true);
    });

    it("should iterate an sparse array", function () {
        var array = [];
        array[0] = 1;
        array[100] = 2;
        array[1000] = 3;
        var iterator = Iterator(array);
        expect(iterator.next().value).toEqual(1);
        expect(iterator.next().value).toEqual(2);
        expect(iterator.next().value).toEqual(3);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().done).toBe(true);
    });

    it("should iterate a string", function () {
        var iterator = Iterator("abc");
        expect(iterator.next().value).toEqual("a");
        expect(iterator.next().value).toEqual("b");
        expect(iterator.next().value).toEqual("c");
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().done).toBe(true);
    });

    it("should gracefully fail to iterate null", function () {
        expect(function () {
            Iterator(null);
        }).toThrow();
    });

    it("should gracefully fail to iterate undefined", function () {
        expect(function () {
            Iterator();
        }).toThrow();
    });

    it("should gracefully fail to iterate a number", function () {
        expect(function () {
            Iterator(42);
        }).toThrow();
    });

    it("should gracefully pass an existing iterator through", function () {
        var iterator = Iterator([1, 2, 3]);
        iterator = Iterator(iterator);
        expect(iterator.next().value).toEqual(1);
        expect(iterator.next().value).toEqual(2);
        expect(iterator.next().value).toEqual(3);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().done).toBe(true);
    });

    it("should iterate an iterator", function () {
        var iterator = Iterator({
            iterate: function () {
                return Iterator([1, 2, 3]);
            }
        });
        iterator = Iterator(iterator);
        expect(iterator.next().value).toEqual(1);
        expect(iterator.next().value).toEqual(2);
        expect(iterator.next().value).toEqual(3);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().done).toBe(true);
    });

    it("should iterate an iterable", function () {
        var n = 0;
        var iterator = Iterator({
            next: function next() {
                if (++n > 3) {
                    return {value:void 0,done:true};
                } else {
                    return {value:n,done:false};
                }
            }
        });
        expect(iterator.next().value).toEqual(1);
        expect(iterator.next().value).toEqual(2);
        expect(iterator.next().value).toEqual(3);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().done).toBe(true);
    });

    it("should create an iterator from a function", function () {
        var n = 0;
        var iterator = Iterator(function next() {
            if (++n > 3) {
                return {value:void 0,done:true};
            } else {
                return {value:n,done:false};
            }
        });
        expect(iterator.next().value).toEqual(1);
        expect(iterator.next().value).toEqual(2);
        expect(iterator.next().value).toEqual(3);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().done).toBe(true);
    });

    describe("reduce", function () {
        it("should work", function () {
            var iterator = definiteIterator();
            var count = 0;
            var result = iterator.reduce(function (result, value, key, object) {
                expect(value).toBe(count + 1);
                expect(key).toBe(count);
                expect(object).toBe(iterator);
                count++;
                return value + 1;
            }, 0);
            expect(result).toBe(4);
        });
    });

    describe("forEach", function () {
        it("should work", function () {
            var iterator = definiteIterator();
            var count = 0;
            iterator.forEach(function (value, key, object) {
                expect(value).toBe(count + 1);
                expect(key).toBe(count);
                expect(object).toBe(iterator);
                count++;
            });
            expect(count).toBe(3);
        });
    });

    describe("map", function () {
        it("should work", function () {
            var iterator = definiteIterator();
            var count = 0;
            var result = iterator.map(function (value, key, object) {
                expect(value).toBe(count + 1);
                expect(key).toBe(count);
                expect(object).toBe(iterator);
                count++;
                return "abc".charAt(key);
            });
            expect(result).toEqual(["a", "b", "c"]);
            expect(count).toBe(3);
        });
    });

    describe("filter", function () {
        it("should work", function () {
            var iterator = definiteIterator();
            var count = 0;
            var result = iterator.filter(function (value, key, object) {
                expect(value).toBe(count + 1);
                expect(key).toBe(count);
                expect(object).toBe(iterator);
                count++;
                return value === 2;
            });
            expect(result).toEqual([2]);
            expect(count).toBe(3);
        });
    });

    describe("every", function () {
        it("should work", function () {
            expect(Iterator([1, 2, 3]).every(function (n) {
                return n < 10;
            })).toBe(true);
            expect(Iterator([1, 2, 3]).every(function (n) {
                return n > 1;
            })).toBe(false);
        });
    });

    describe("some", function () {
        it("should work", function () {
            expect(Iterator([1, 2, 3]).some(function (n) {
                return n === 2;
            })).toBe(true);
            expect(Iterator([1, 2, 3]).some(function (n) {
                return n > 10;
            })).toBe(false);
        });
    });

    describe("any", function () {
        [
            [[false, false], false],
            [[false, true], true],
            [[true, false], true],
            [[true, true], true]
        ].forEach(function (test) {
            test = Iterator(test);
            var input = test.next().value;
            var output = test.next().value;
            it("any of " + JSON.stringify(input) + " should be " + output, function () {
                expect(Iterator(input).any()).toEqual(output);
            });
        });
    });

    describe("all", function () {
        [
            [[false, false], false],
            [[false, true], false],
            [[true, false], false],
            [[true, true], true]
        ].forEach(function (test) {
            test = Iterator(test);
            var input = test.next().value;
            var output = test.next().value;
            it("all of " + JSON.stringify(input) + " should be " + output, function () {
                expect(Iterator(input).all()).toEqual(output);
            });
        });
    });

    describe("min", function () {
        it("should work", function () {
            expect(definiteIterator().min()).toBe(1);
        });
    });

    describe("max", function () {
        it("should work", function () {
            expect(definiteIterator().max()).toBe(3);
        });
    });

    describe("sum", function () {
        it("should work", function () {
            expect(definiteIterator().sum()).toBe(6);
        });
    });

    describe("average", function () {
        it("should work", function () {
            expect(definiteIterator().average()).toBe(2);
        });
    });

    describe("flatten", function () {
        it("should work", function () {
            expect(
                Iterator([
                    definiteIterator(),
                    definiteIterator(),
                    definiteIterator()
                ]).flatten()
            ).toEqual([
                1, 2, 3,
                1, 2, 3,
                1, 2, 3
            ]);
        });
    });

    describe("zip", function () {
        it("should work", function () {
            var cardinals = definiteIterator().mapIterator(function (n) {
                return n - 1;
            });
            var ordinals = definiteIterator();
            expect(cardinals.zip(ordinals)).toEqual([
                [0, 1],
                [1, 2],
                [2, 3]
            ]);
        });
    });

    describe("enumerate", function () {

        it("should work with default start", function () {
            var cardinals = definiteIterator();
            expect(cardinals.enumerate()).toEqual([
                [0, 1],
                [1, 2],
                [2, 3]
            ]);
        });

        it("should work with given start", function () {
            var cardinals = definiteIterator();
            expect(cardinals.enumerate(1)).toEqual([
                [1, 1],
                [2, 2],
                [3, 3]
            ]);
        });

    });

    describe("sorted", function () {
        it("should work", function () {
            expect(Iterator([5, 2, 4, 1, 3]).sorted()).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe("group", function () {
        it("should work", function () {
            expect(Iterator([5, 2, 4, 1, 3]).group(function (n) {
                return n % 2 === 0;
            })).toEqual([
                [false, [5, 1, 3]],
                [true, [2, 4]]
            ]);
        });
    });

    describe("reversed", function () {
        it("should work", function () {
            expect(Iterator([5, 2, 4, 1, 3]).reversed()).toEqual([3, 1, 4, 2, 5]);
        });
    });

    describe("toArray", function () {
        it("should work", function () {
            expect(Iterator([5, 2, 4, 1, 3]).toArray()).toEqual([5, 2, 4, 1, 3]);
        });
    });

    describe("toObject", function () {
        it("should work", function () {
            expect(Iterator("AB").toObject()).toEqual({
                0: "A",
                1: "B"
            });
        });
    });

    describe("mapIterator", function () {

        it("should work", function () {
            var iterator = indefiniteIterator()
            .mapIterator(function (n, i, o) {
                return n * 2;
            });
            expect(iterator.next().value).toBe(0);
            expect(iterator.next().value).toBe(2);
            expect(iterator.next().value).toBe(4);
            expect(iterator.next().value).toBe(6);
        });

        it("should pass the correct arguments to the callback", function () {
            var iterator = indefiniteIterator()
            var result = iterator.mapIterator(function (n, i, o) {
                expect(i).toBe(n);
                expect(o).toBe(iterator);
                return n * 2;
            });
            result.next();
            result.next();
            result.next();
            result.next();
        });

    });

    describe("filterIterator", function () {

        it("should work", function () {
            var iterator = indefiniteIterator()
            .filterIterator(function (n, i, o) {
                expect(i).toBe(n);
                //expect(o).toBe(iterator);
                return n % 2 === 0;
            });
            expect(iterator.next().value).toBe(0);
            expect(iterator.next().value).toBe(2);
            expect(iterator.next().value).toBe(4);
            expect(iterator.next().value).toBe(6);
        });

        it("should pass the correct arguments to the callback", function () {
            var iterator = indefiniteIterator()
            var result = iterator.filterIterator(function (n, i, o) {
                expect(i).toBe(n);
                expect(o).toBe(iterator);
                return n * 2;
            });
            result.next();
            result.next();
            result.next();
            result.next();
        });

    });

    describe("concat", function () {
        it("should work", function () {
            var iterator = definiteIterator().concat(definiteIterator());
            expect(iterator.next().value).toBe(1);
            expect(iterator.next().value).toBe(2);
            expect(iterator.next().value).toBe(3);
            expect(iterator.next().value).toBe(1);
            expect(iterator.next().value).toBe(2);
            expect(iterator.next().value).toBe(3);
            expect(iterator.next().done).toBe(true);
        });
    });

    describe("dropWhile", function () {

        it("should work", function () {
            var iterator = indefiniteIterator()
            .dropWhile(function (n) {
                return n < 10;
            });
            expect(iterator.next().value).toBe(10);
            expect(iterator.next().value).toBe(11);
            expect(iterator.next().value).toBe(12);
        });

        it("should pass the correct arguments to the callback", function () {
            var iterator = indefiniteIterator()
            var result = iterator.dropWhile(function (n, i, o) {
                expect(i).toBe(n);
                expect(o).toBe(iterator);
            });
            result.next();
            result.next();
            result.next();
        });

    });

    describe("takeWhile", function () {

        it("should work", function () {
            var iterator = indefiniteIterator()
            .takeWhile(function (n) {
                return n < 3;
            });
            expect(iterator.next().value).toBe(0);
            expect(iterator.next().value).toBe(1);
            expect(iterator.next().value).toBe(2);
            expect(iterator.next().done).toBe(true);
        });

        it("should pass the correct arguments to the callback", function () {
            var iterator = indefiniteIterator()
            var result = iterator.takeWhile(function (n, i, o) {
                expect(i).toBe(n);
                expect(o).toBe(iterator);
                return n < 3;
            });
            result.next();
            result.next();
            result.next();
        });

    });

    describe("zipIterator", function () {

        it("should work", function () {
            var cardinals = indefiniteIterator();
            var ordinals = indefiniteIterator().mapIterator(function (n) {
                return n + 1;
            });
            var iterator = cardinals.zipIterator(ordinals);
            expect(iterator.next().value).toEqual([0, 1]);
            expect(iterator.next().value).toEqual([1, 2]);
            expect(iterator.next().value).toEqual([2, 3]);
        });

        it("should work, even for crazy people", function () {
            var cardinals = indefiniteIterator();
            var iterator = cardinals.zipIterator(cardinals, cardinals);
            expect(iterator.next().value).toEqual([0, 1, 2]);
            expect(iterator.next().value).toEqual([3, 4, 5]);
            expect(iterator.next().value).toEqual([6, 7, 8]);
        });
    });

    describe("enumerateIterator", function () {
        it("should work", function () {
            var ordinals = indefiniteIterator().mapIterator(function (n) {
                return n + 1;
            });
            var iterator = ordinals.enumerateIterator();
            expect(iterator.next().value).toEqual([0, 1]);
            expect(iterator.next().value).toEqual([1, 2]);
            expect(iterator.next().value).toEqual([2, 3]);
        });
    });

}
