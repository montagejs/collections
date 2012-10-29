
var List = require("../list");
var describeDequeue = require("./dequeue");
var describeCollection = require("./collection");

describe("List", function () {
    // new List()
    // List()
    // List(values)
    // List(values, equals)
    // List(values, null, content)
    // List(values).find(value)
    // List(values, equals).find(value)
    // List(values, equals).find(value, equals)
    // List(values).findLast(value)
    // List(values, equals).findLast(value)
    // List(values, equals).findLast(value, equals)
    // List(values).has(value)
    // List(values).has(value, equals)
    // List(values).get(value)
    // List(values, equals).get(value)
    // List(values, equals).get(value, equals)
    // List(values).delete(value)
    // List(values, equals).delete(value)
    // List(values, equals).delete(value, equals)
    // List(values).cleare()
    // List(values).reverse()
    // List(values).reduce(callback, basis, thisp)
    // List(values).reduceRight(callback, basis, thisp)
    // List(values).equals(list)
    // List(values).equals(array)
    // List([only]).only()
    // List([]).only()
    // List(many).only()
    // List([]).one()
    // List([one]).one()
    // List(many).one()
    // List(values).iterate()
    // List(values) node.delete()
    // List(values) node.addBefore(node)
    // List(values) node.addAfter(node)

    // List(values).{add,remove}ContentChangeListener
    //      add
    //      delete
    //      push
    //      pop
    //      shift
    //      unshift
    //      splice
    //      swap
    // List(values).{add,remove}BeforeContentChangeListener
    //      add
    //      delete
    //      push
    //      pop
    //      shift
    //      unshift
    //      splice
    //      swap

    // push, pop, shift, unshift, slice, splice with numeric indicies
    describeDequeue(List);
    describeDequeue(function (values) {
        return new List(values);
    });

    // construction, has, add, get, delete
    function newList(values) {
        return new List(values);
    }

    [List, newList].forEach(function (List) {
        describeCollection(List, [1, 2, 3, 4], true);
        describeCollection(List, [{}, {}, {}, {}], true);
    });

    describe("find()", function () {

        it("should find every value in a list", function () {
            var list = List([1, 2, 3, 4]);
            expect(list.find(1)).toBe(list.head.next);
            expect(list.find(2)).toBe(list.head.next.next);
            expect(list.find(3)).toBe(list.head.next.next.next);
            expect(list.find(4)).toBe(list.head.next.next.next.next);
            expect(list.find(4)).toBe(list.head.prev);
            expect(list.find(3)).toBe(list.head.prev.prev);
            expect(list.find(2)).toBe(list.head.prev.prev.prev);
            expect(list.find(1)).toBe(list.head.prev.prev.prev.prev);
        });

        it("should the first of equivalent values", function () {
            var list = List([0, 1, 1, 0]);
            expect(list.find(0)).toBe(list.head.next);
            expect(list.find(1)).toBe(list.head.next.next);
        });

    });

    describe("findLast()", function () {

        it("should find every value in a list", function () {
            var list = List([1, 2, 3, 4]);
            expect(list.findLast(1)).toBe(list.head.next);
            expect(list.findLast(2)).toBe(list.head.next.next);
            expect(list.findLast(3)).toBe(list.head.next.next.next);
            expect(list.findLast(4)).toBe(list.head.next.next.next.next);
            expect(list.findLast(4)).toBe(list.head.prev);
            expect(list.findLast(3)).toBe(list.head.prev.prev);
            expect(list.findLast(2)).toBe(list.head.prev.prev.prev);
            expect(list.findLast(1)).toBe(list.head.prev.prev.prev.prev);
        });

        it("should prefer later equivalent values", function () {
            var list = List([0, 1, 1, 0]);
            expect(list.findLast(0)).toBe(list.head.prev);
            expect(list.findLast(1)).toBe(list.head.prev.prev);
        });

    });

    // additional constraints on splice with regard to how it behaves when the
    // offset is provided as a node instead of a number
    describe("splice() with nodes", function () {

        it("should splice to end with only an offset argument", function () {
            var collection = List([1, 2, 3, 4]);
            expect(collection.splice(collection.find(3))).toEqual([3, 4]);
            expect(collection.toArray()).toEqual([1, 2]);
        });

        it("should splice nothing with no length", function () {
            var collection = List([1, 2, 3, 4]);
            expect(collection.splice(collection.find(3), 0)).toEqual([]);
            expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        });

        it("should splice one value", function () {
            var collection = List([1, 2, 3, 4]);
            expect(collection.splice(collection.find(3), 1)).toEqual([3]);
            expect(collection.toArray()).toEqual([1, 2, 4]);
        });

        it("should splice all values", function () {
            var collection = List([1, 2, 3, 4]);
            expect(collection.splice(collection.head.next, collection.length)).toEqual([1, 2, 3, 4]);
            expect(collection.toArray()).toEqual([]);
        });

        it("should splice all values with implied length", function () {
            var collection = List([1, 2, 3, 4]);
            expect(collection.splice(collection.head.next)).toEqual([1, 2, 3, 4]);
            expect(collection.toArray()).toEqual([]);
        });

    });

});

