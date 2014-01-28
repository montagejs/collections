
var Queue = require("../queue");

describe("Queue", function () {

    it("just the facts", function () {
        var queue = new Queue();
        expect(queue.length).toBe(0);
        expect(queue.capacity).toBe(16);

        queue.push(10);
        expect(queue.length).toBe(1);
        expect(queue.shift()).toBe(10);
        expect(queue.length).toBe(0);

        queue.push(20);
        expect(queue.length).toBe(1);
        queue.push(30);
        expect(queue.length).toBe(2);
        expect(queue.shift()).toBe(20);
        expect(queue.length).toBe(1);
        expect(queue.shift()).toBe(30);
        expect(queue.length).toBe(0);

        expect(queue.capacity).toBe(16);

    });

    it("grows", function () {
        var queue = Queue();

        for (var i = 0; i < 16; i++) {
            expect(queue.length).toBe(i);
            queue.push(i);
            expect(queue.capacity).toBe(16);
        }
        queue.push(i);
        expect(queue.capacity).toBe(128);
    });

    it("initializes", function () {
        var queue = new Queue([1, 2, 3]);
        expect(queue.length).toBe(3);
        expect(queue.shift()).toBe(1);
        expect(queue.shift()).toBe(2);
        expect(queue.shift()).toBe(3);
    });

    it("does not get in a funk", function () {
        var queue = Queue();
        expect(queue.shift()).toBe(undefined);
        queue.push(4);
        expect(queue.shift()).toBe(4);
    });

});

