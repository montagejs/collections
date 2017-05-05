// Array, List, Set, FastSet, unbounded LruSet.
// SortedSet does not qualify since these objects are incomparable.
// Array#get() behaves like a Map, not a Set, so it is excluded from those
// tests.

module.exports = describeCollection;
function describeCollection(Collection, values, setLike) {

    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    function shouldHaveTheUsualContent(collection) {
        expect(collection.has(a)).toBe(true);
        expect(collection.has(b)).toBe(true);
        expect(collection.has(c)).toBe(true);
        expect(collection.has(d)).toBe(false);
        if (setLike) {
            expect(collection.get(a)).toBe(a);
            expect(collection.get(b)).toBe(b);
            expect(collection.get(c)).toBe(c);
            expect(collection.get(d)).toBe(undefined);
        }
        expect(collection.length).toBe(3);
    }

    it("should be constructable from an array", function () {
        var collection = Collection.from([a, b, c]);
        shouldHaveTheUsualContent(collection);
    });

    it("should be constructable from an foreachable", function () {
        var collection = Collection.from({
            forEach: function (callback, thisp) {
                callback.call(thisp, a);
                callback.call(thisp, b);
                callback.call(thisp, c);
            }
        });
        shouldHaveTheUsualContent(collection);
    });

    describe("add", function () {
        it("should add values to a collection", function () {
            var collection = new Collection();
            // expect(collection.add(a)).toBe(true);
            // expect(collection.add(b)).toBe(true);
            // expect(collection.add(c)).toBe(true);
            collection.add(a);
            collection.add(b);
            collection.add(c);
            shouldHaveTheUsualContent(collection);
        });
    });

    describe("delete", function () {

        it("should remove a value from the beginning of a collection", function () {
            var collection = Collection.from([d, a, b, c]);
            expect(collection.delete(d)).toBe(true);
            shouldHaveTheUsualContent(collection);
        });

        it("should remove a value from the middle of a collection", function () {
            var collection = Collection.from([a, d, b, c]);
            expect(collection.delete(d)).toBe(true);
            shouldHaveTheUsualContent(collection);
        });

        it("should remove a value from the end of a collection", function () {
            var collection = Collection.from([a, b, c, d]);
            expect(collection.delete(d)).toBe(true);
            shouldHaveTheUsualContent(collection);
        });

        it("should fail to remove a value not in a collection", function () {
            var collection = Collection.from([a, b, c]);
            expect(collection.delete(d)).toBe(false);
            shouldHaveTheUsualContent(collection);
        });

    });

    describe("one", function () {
        it("should return a value in the collection", function () {
            var collection = Collection.from([a, b, c, d]);
            expect(collection.has(collection.one())).toBe(true);
        });

        it("should throw an error for an empty collection", function () {
            var collection = new Collection();
            expect(collection.one()).toBe(undefined);
        });
    });

    describe("only", function () {

        it("should return a value in the collection", function () {
            var collection = Collection.from([a]);
            expect(collection.only()).toBe(a);
        });

        it("should be undefined if there are no values in the collection", function () {
            expect(new Collection().only()).toBeUndefined();
        });

        it("should be undefined if there are many values in the collection", function () {
            expect(Collection.from([a, b]).only()).toBeUndefined();
        });

    });

    describe("clear", function () {
        it("should delete all values", function () {
            var collection = Collection.from([a, b, c, d]);
            expect(collection.length).toBe(4);
            collection.clear();
            expect(collection.toArray()).toEqual([]);
            expect(collection.length).toBe(0);
        });
    });

}
