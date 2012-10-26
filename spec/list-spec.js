
var List = require("../list");
var describeDequeue = require("./dequeue");

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
    // List(values).wipe()
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

