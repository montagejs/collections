
var Iterator = require("../iterator");
var Iterator_ = Iterator; // For referencing things on the constructor

describe("Iterator", function () {
    describeIterator(function withoutNew(iterable) {
        return Iterator(iterable);
    });
    //describeIterator(function withNew(iterable) {
    //    return new Iterator(iterable);
    //});
});

function expectCommonIterator(iterator) {
    expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
    expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
    expect(Object.equals(iterator.next(), {value: 3, index: 2, done: false})).toBe(true);
    expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
}

function describeIterator(Iterator) {

    it("iterates undefined (empty) iteration", function () {
        var iterator = Iterator();
        expect(iterator.next()).toEqual({value: undefined, done: true});
    });

    it("iterates null (empty) iteration", function () {
        var iterator = Iterator(null);
        expect(iterator.next()).toEqual({value: undefined, done: true});
    });

    it("iterates empty array iteration", function () {
        var iterator = Iterator([]);
        expect(iterator.next()).toEqual({value: undefined, done: true});
    });

    it("iterates an array", function () {
        var iterator = Iterator([1, 2, 3]);
        expectCommonIterator(iterator);
    });

    it("iterates a sparse array", function () {
        var iterator = Iterator([1,, 2,, 3]);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 3, index: 4, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

    it("iterates a string", function () {
        var iterator = Iterator("abc");
        expect(Object.equals(iterator.next(), {value: "a", index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: "b", index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: "c", index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

    it("fails to iterate a number", function () {
        expect(function () {
            Iterator(42);
        }).toThrow();
    });

    it("wraps an existing iterator", function () {
        var iterator = Iterator(Iterator([1, 2, 3]));
        expectCommonIterator(iterator);
    });

    it("iterates an iterable", function () {
        var iterator = Iterator({
            iterate: function () {
                return Iterator([1, 2, 3]);
            }
        });
        expectCommonIterator(iterator);
    });

    it("wraps a duck iterator", function () {
        var n = 0;
        var iterator = Iterator({
            next: function next() {
                if (++n > 3) {
                    return Iterator_.done;
                } else {
                    return new Iterator_.Iteration(
                        n,
                        n - 1
                    );
                }
            }
        });
        expectCommonIterator(iterator);
    });

    it("wraps a pure next function", function () {
        var n = 0;
        var iterator = Iterator(function () {
            if (++n > 3) {
                return Iterator_.done;
            } else {
                return new Iterator_.Iteration(
                    n,
                    n - 1
                );
            }
        });
        expectCommonIterator(iterator);
    });

    describe("iterateMap", function () {

        it("maps an iterator", function () {
            var iterator = Iterator([1, 2, 3]).iterateMap(function (n, i) {
                expect(i).toBe(n - 1);
                return n * 2;
            });
            expect(Object.equals(iterator.next(), {value: 2, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 4, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 6, index: 2, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });

    });

    describe("iterateFilter", function () {

        it("filters an iterator", function () {
            var iterator = Iterator([1, 2, 3]).iterateFilter(function (n, i) {
                expect(i).toBe(n - 1);
                return n % 2 === 0;
            });
            expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });

    });

    describe("recount", function () {

        it("recounts a filtered iterator", function () {
            var iterator = Iterator([1, 2, 3, 4]).iterateFilter(function (n, i) {
                expect(i).toBe(n - 1);
                return n % 2 === 0;
            }).recount();
            expect(Object.equals(iterator.next(), {value: 2, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 4, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });

        it("recounts a sparse array iterator", function () {
            var iterator = Iterator([1,, 2,, 3]).recount();
            expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 3, index: 2, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });

        it("recounts from one", function () {
            var iterator = Iterator([1,, 2,, 3]).recount(1);
            expect(Object.equals(iterator.next(), {value: 1, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 2, index: 2, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 3, index: 3, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });

    });

    describe("reduce", function () {

        it("reduces", function () {
            expect(Iterator([1, 2, 3]).reduce(function (n, m) {
                return n + m;
            }, 0)).toBe(6);
        });

        it("reduces without a basis", function () {
            expect(Iterator([1, 2, 3]).reduce(function (n, m) {
                return n + m;
            })).toBe(6);
        });

        it("fails to reduce an empty iteration without a basis", function () {
            expect(function () {
                Iterator([]).reduce(function () {
                });
            }).toThrow();
        });

        it("reduces with a thisp", function () {
            var o = {};
            expect(Iterator([1, 2, 3]).reduce(function (n, m, i) {
                expect(i).toBe(m - 1);
                expect(this).toBe(o);
                return n + m;
            }, 0, o)).toBe(6);
        });

    });

    describe("dropWhile", function () {
        it("drops while the guard is true", function () {
            var iterator = new Iterator([-1, -2, -3, 1, 2, 3])
            .dropWhile(function (n) {
                return n < 0;
            });
            expect(Object.equals(iterator.next(), {value: 1, index: 3, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 2, index: 4, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 3, index: 5, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });
    });

    describe("takeWhile", function () {
        it("takes while the guard is true", function () {
            var iterator = new Iterator([1, 2, 3, 4, 5, 6])
            .takeWhile(function (n) {
                return n < 4;
            });
            expectCommonIterator(iterator);
        });
    });

    describe("iterateFlatten", function () {
        it("flattens iterators", function () {
            var iterator = Iterator([
                Iterator([1, 2]),
                Iterator([3, 4]),
                Iterator([5, 6])
            ]).iterateFlatten();
            expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 3, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 4, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 5, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 6, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });
    });

    describe("iterateZip", function () {
        it("zips iterators", function () {
            var iterator = Iterator([0, 'A', 'x']).iterateZip(
                Iterator([1, 'B', 'y', 'I']),
                Iterator([2, 'C'])
            );
            expect(Object.equals(iterator.next(), {
                value: [0, 1, 2],
                index: 0, done: false
            })).toBe(true);
            expect(Object.equals(iterator.next(), {
                value: ["A", "B", "C"],
                index: 1, done: false
            })).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });
    });

    describe("iterateUnzip", function () {
        it("unzips iterators", function () {
            var iterator = Iterator([
                Iterator([0, 'A', 'x']),
                Iterator([1, 'B', 'y', 'I']),
                Iterator([2, 'C'])
            ]).iterateUnzip();
            expect(Object.equals(iterator.next(), {
                value: [0, 1, 2],
                index: 0, done: false
            })).toBe(true);
            expect(Object.equals(iterator.next(), {
                value: ["A", "B", "C"],
                index: 1, done: false
            })).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });
    });

    describe("iterateEnumerate", function () {
        it("should enumerate an array", function () {
            var iterator = Iterator([1, 2, 3]).iterateEnumerate();
            expect(Object.equals(iterator.next(), {value: [0, 1], index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: [1, 2], index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: [2, 3], index: 2, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });
    });

    describe("iterateConcat", function () {
        it("concats iterators", function () {
            var iterator = Iterator([1, 2]).iterateConcat(
                Iterator([3, 4]),
                Iterator([5, 6])
            );
            expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 3, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 4, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 5, index: 0, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: 6, index: 1, done: false})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
            expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        });
    });

}

describe("Iterator.cycle", function () {

    it("cycles an array", function () {
        var iterator = Iterator.cycle([1, 2, 3]);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 3, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 3, index: 2, done: false})).toBe(true);
    });

    it("cycles an array twice", function () {
        var iterator = Iterator.cycle([1, 2], 2);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

    it("cycles zero times", function () {
        var iterator = Iterator.cycle([1, 2, 3], 0);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

describe("Iterator.concat", function () {

    it("concats iterators", function () {
        var iterator = Iterator.concat(
            Iterator([1, 2]),
            Iterator([3, 4]),
            Iterator([5, 6])
        );
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 3, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 4, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 5, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 6, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

describe("Iterator.flatten", function () {

    it("flattens iterators", function () {
        var iterator = Iterator.flatten([
            Iterator([1, 2]),
            Iterator([3, 4]),
            Iterator([5, 6])
        ]);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 3, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 4, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 5, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 6, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

describe("Iterator.unzip", function () {

    it("unzips iterators", function () {
        var iterator = Iterator.unzip([
            Iterator([0, 'A', 'x']),
            Iterator([1, 'B', 'y', 'I']),
            Iterator([2, 'C'])
        ]);
        expect(Object.equals(iterator.next(), {
            value: [0, 1, 2],
            index: 0, done: false
        })).toBe(true);
        expect(Object.equals(iterator.next(), {
            value: ["A", "B", "C"],
            index: 1, done: false
        })).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

describe("Iterator.zip", function () {

    it("zips iterators", function () {
        var iterator = Iterator.zip(
            Iterator([0, 'A', 'x']),
            Iterator([1, 'B', 'y', 'I']),
            Iterator([2, 'C'])
        );
        expect(Object.equals(iterator.next(), {
            value: [0, 1, 2],
            index: 0, done: false
        })).toBe(true);
        expect(Object.equals(iterator.next(), {
            value: ["A", "B", "C"],
            index: 1, done: false
        })).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

describe("Iterator.range", function () {

    it("iterates a range", function () {
        var iterator = new Iterator.range(3);
        expect(Object.equals(iterator.next(), {value: 0, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 1, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

    it("iterates an offset range", function () {
        var iterator = new Iterator.range(1, 4);
        expectCommonIterator(iterator);
    });

    it("iterates an offset, strided range", function () {
        var iterator = new Iterator.range(0, 5, 2);
        expect(Object.equals(iterator.next(), {value: 0, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 4, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

describe("Iterator.count", function () {

    it("iterates an open range", function () {
        var iterator = new Iterator.count();
        expect(Object.equals(iterator.next(), {value: 0, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 1, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 3, index: 3, done: false})).toBe(true);
    });

    it("iterates an open range starting with one", function () {
        var iterator = new Iterator.count(1);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 3, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 4, index: 3, done: false})).toBe(true);
    });

    it("iterates an open range with stride", function () {
        var iterator = new Iterator.count(0, 2);
        expect(Object.equals(iterator.next(), {value: 0, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 2, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 4, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 6, index: 3, done: false})).toBe(true);
    });

});

describe("Iterator.repeat", function () {

    it("repeats a value indefinitely", function () {
        var iterator = Iterator.repeat(1);
        for (var index = 0; index < 10; index++) {
            expect(Object.equals(iterator.next(), {value: 1, index: index, done: false})).toBe(true);
        }
    });

    it("repeats a value some times", function () {
        var iterator = Iterator.repeat(1, 3);
        expect(Object.equals(iterator.next(), {value: 1, index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 1, index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: 1, index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

describe("Iterator.enumerate", function () {

    it("should enumerate an array", function () {
        var iterator = Iterator.enumerate([1, 2, 3]);
        expect(Object.equals(iterator.next(), {value: [0, 1], index: 0, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: [1, 2], index: 1, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: [2, 3], index: 2, done: false})).toBe(true);
        expect(Object.equals(iterator.next(), {value: undefined, index: undefined, done: true})).toBe(true);
    });

});

