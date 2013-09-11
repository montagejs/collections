// tests that are equally applicable to Dict, Map, SortedMap, unbounded LruMap, FastMap

module.exports = describeDict;
function describeDict(Dict) {

    it("should be constructable from entry duples", function () {
        var dict = Dict([['a', 10], ['b', 20]]);
        shouldHaveTheUsualContent(dict);
    });

    it("should be constructable from objects", function () {
        var dict = Dict({a: 10, b: 20});
        shouldHaveTheUsualContent(dict);
    });

    it("should be constructable from dicts", function () {
        var dict = Dict(Dict({a: 10, b: 20}));
        shouldHaveTheUsualContent(dict);
    });

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

    it("should send a value for MapChange events", function () {
        var dict = Dict({a: 1});

        var listener = function(value, key) {
            expect(value).toBe(2);
        };
        dict.addMapChangeListener(listener);
        dict.set('a', 2);
    })
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
    expect(dict.get('c', 30)).toBe(30);

    expect(dict.keys()).toEqual(['a', 'b']);
    expect(dict.values()).toEqual([10, 20]);
    expect(dict.entries()).toEqual([['a', 10], ['b', 20]]);
    expect(dict.reduce(function (basis, value, key) {
        return basis + value;
    }, 0)).toEqual(30);
    expect(dict.reduce(function (basis, value, key) {
        basis.push(key);
        return basis;
    }, [])).toEqual(['a', 'b']);
    expect(dict.length).toBe(2);
}

