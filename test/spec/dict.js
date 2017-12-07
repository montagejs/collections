// tests that are equally applicable to Dict, Map, SortedMap, unbounded LruMap, FastMap

module.exports = describeDict;
function describeDict(Dict) {
    describe('as Dist', function () {

    it("should be able to delete keys", function () {
        var dict = Dict.from({a: 10, b: 20, c: 30});
        expect(dict.delete('c')).toBe(true);
        expect(dict.delete('c')).toBe(false);
        shouldHaveTheUsualContent(dict);
    });

    it("should be constructable from entry duples", function () {
        var dict = new Dict([['a', 10], ['b', 20]]);
        shouldHaveTheUsualContent(dict);
    });

    it("should be constructable from objects", function () {
        var dict = Dict.from({a: 10, b: 20});
        shouldHaveTheUsualContent(dict);
    });

    it("should be constructable from dicts", function () {
        var dict = new Dict(Dict.from({a: 10, b: 20}));
        shouldHaveTheUsualContent(dict);
    });

    it("should be able to contain hasOwnProperty", function () {
        var dict = new Dict();
        dict.set("hasOwnProperty", 10);
        expect(dict.get("hasOwnProperty")).toBe(10);
        expect(dict.delete("hasOwnProperty")).toBe(true);
        expect(dict.length).toBe(0);
        expect(dict.delete("hasOwnProperty")).toBe(false);
    });

    it("should be able to contain __proto__", function () {
        var dict = new Dict();
        dict.set("__proto__", 10);
        expect(dict.get("__proto__")).toBe(10);
        expect(dict.delete("__proto__")).toBe(true);
        expect(dict.length).toBe(0);
        expect(dict.delete("__proto__")).toBe(false);
    });

    it("should send a value for MapChange events", function () {
        var dict = Dict.from({a: 1});

        describe("delete", function () {
            it("should be able to delete keys", function () {
                var dict = Dict({a: 10, b: 20, c: 30});
                expect(dict.delete('c')).toBe(true);
                expect(dict.delete('c')).toBe(false);
                shouldHaveTheUsualContent(dict);
            });
        });

        it("should be able to contain hasOwnProperty", function () {
            var dict = Dict();
            expect(dict.set("hasOwnProperty", 10)).toBe(true);
            expect(dict.get("hasOwnProperty")).toBe(10);
            expect(dict.delete("hasOwnProperty")).toBe(true);
            expect(dict.length).toBe(0);
            expect(dict.delete("hasOwnProperty")).toBe(false);
        });

        it("should be able to contain __proto__", function () {
            var dict = Dict();
            expect(dict.set("__proto__", 10)).toBe(true);
            expect(dict.get("__proto__")).toBe(10);
            expect(dict.delete("__proto__")).toBe(true);
            expect(dict.length).toBe(0);
            expect(dict.delete("__proto__")).toBe(false);
        });

        describe("getDefault", function () {

            it("can be overridden on the prototype", function () {

                var called = false;

                function Memo() {
                    Dict.call(this);
                }

                Memo.prototype = Object.create(Dict.prototype);
                Memo.prototype.constructor = Memo;

                Memo.prototype.getDefault = function (key) {
                    called = true;
                    this.set(key, key + "!");
                    return this.get(key);
                };

                var memo = new Memo();

                called = false;
                expect(memo.get("hi")).toBe("hi!");
                expect(called).toBe(true);

                called = false;
                expect(memo.get("hi")).toBe("hi!");
                expect(called).toBe(false);

            });

        });

        describe("iterate", function () {
            it("should iterate a dictionary", function () {
                var dict = new Dict({a: 10, b: 20, c: 30});
                var iterator = dict.iterate();
                expect(iterator.next()).toEqual({value: 10, index: "a", done: false});
            });
        });

        describe("some", function () {
            it("can enumerate the content of a dict", function () {
                var dict = new Dict({only: 10});
                expect(dict.some(function (value, key) {
                    expect(key).toBe("only");
                    expect(value).toBe(10);
                    return value === 10;
                })).toBe(true);
            });
        });

    });
    
    });
}

function shouldHaveTheUsualContent(dict) {
    expect(dict.has('a')).toBe(true);
    expect(dict.has('b')).toBe(true);
    expect(dict.has('c')).toBe(false);
    expect(dict.has('__proto__')).toBe(false);
    expect(dict.has('hasOwnProperty')).toBe(false);

    expect(dict.get('a')).toBe(10);
    expect(dict.get('b')).toBe(20);
    expect(dict.get('c')).toBe(undefined);

/*
<<<<<<< HEAD:test/spec/dict.js
    var mapIter = dict.keys(), key, keys = [];
    while (key = mapIter.next().value) {
        keys.push(key);
    }
    expect(dict.keysArray()).toEqual(['a', 'b']);

    expect(dict.valuesArray()).toEqual([10, 20]);
    expect(dict.entriesArray()).toEqual([['a', 10], ['b', 20]]);
=======
*/
    expect(dict.keys().toArray()).toEqual(['a', 'b']);
    expect(dict.values().toArray()).toEqual([10, 20]);
    expect(dict.entries().toArray()).toEqual([['a', 10], ['b', 20]]);
//>>>>>>> v2:spec/dict.js
    expect(dict.reduce(function (basis, value, key) {
        return basis + value;
    }, 0)).toEqual(30);
    expect(dict.reduce(function (basis, value, key) {
        basis.push(key);
        return basis;
    }, [])).toEqual(['a', 'b']);
    expect(dict.length).toBe(2);
}
