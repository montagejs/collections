
var Deque = require("collections/deque");
var describeDeque = require("./deque");
var describeOrder = require("./order");
var describeToJson = require("./to-json");

describe("Deque-spec", function () {

    it("just the facts", function () {
        var deque = new Deque();
        expect(deque.length).toBe(0);
        expect(deque.capacity).toBe(16);

        deque.push(10);
        expect(deque.length).toBe(1);
        expect(deque.shift()).toBe(10);
        expect(deque.length).toBe(0);

        deque.push(20);
        expect(deque.length).toBe(1);
        deque.push(30);
        expect(deque.length).toBe(2);
        expect(deque.shift()).toBe(20);
        expect(deque.length).toBe(1);
        expect(deque.shift()).toBe(30);
        expect(deque.length).toBe(0);

        expect(deque.capacity).toBe(16);

    });

    it("grows", function () {
        var deque = Deque();

        for (var i = 0; i < 16; i++) {
            expect(deque.length).toBe(i);
            deque.push(i);
            expect(deque.capacity).toBe(16);
        }
        deque.push(i);
        expect(deque.capacity).toBe(64);
    });

    it("initializes", function () {
        var deque = new Deque([1, 2, 3]);
        expect(deque.length).toBe(3);
        expect(deque.shift()).toBe(1);
        expect(deque.shift()).toBe(2);
        expect(deque.shift()).toBe(3);
    });

    it("does not get in a funk", function () {
        var deque = Deque();
        expect(deque.shift()).toBe(undefined);
        deque.push(4);
        expect(deque.shift()).toBe(4);
    });

    it("dispatches range changes", function () {
        var spy = jasmine.createSpy();
        var handler = function (plus, minus, value) {
            spy(plus, minus, value); // ignore last arg
        };
        var deque = Deque();
        deque.addRangeChangeListener(handler);
        deque.push(1);
        deque.push(2, 3);
        deque.pop();
        deque.shift();
        deque.unshift(4, 5);
        deque.removeRangeChangeListener(handler);
        deque.shift();
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            [[1], [], 0],
            [[2, 3], [], 1],
            [[], [3], 2],
            [[], [1], 0],
            [[4, 5], [], 0]
        ]);
    });

    // from https://github.com/petkaantonov/deque

    describe('get', function () {
        it("should return undefined on nonsensical argument", function() {
            var a = new Deque([1,2,3,4]);
            expect(a.get(-5)).toBe(void 0);
            expect(a.get(-100)).toBe(void 0);
            expect(a.get(void 0)).toBe(void 0);
            expect(a.get("1")).toBe(void 0);
            expect(a.get(NaN)).toBe(void 0);
            expect(a.get(Infinity)).toBe(void 0);
            expect(a.get(-Infinity)).toBe(void 0);
            expect(a.get(1.5)).toBe(void 0);
            expect(a.get(4)).toBe(void 0);
        });


        it("should support positive indexing", function() {
            var a = new Deque([1,2,3,4]);
            expect(a.get(0)).toBe(1);
            expect(a.get(1)).toBe(2);
            expect(a.get(2)).toBe(3);
            expect(a.get(3)).toBe(4);
        });

        it("should support negative indexing", function() {
            var a = new Deque([1,2,3,4]);
            expect(a.get(-1)).toBe(4);
            expect(a.get(-2)).toBe(3);
            expect(a.get(-3)).toBe(2);
            expect(a.get(-4)).toBe(1);
        });
    });

    describeDeque(Deque);
    describeOrder(Deque);
    describeToJson(Deque, [1, 2, 3, 4]);

});

