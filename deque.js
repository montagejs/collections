"use strict";


var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");
var ObservableRange = require("./observable-range");
var ObservableObject = require("./observable-object");
var Iterator = require("./iterator");
var addEach = require("./operators/add-each");
var equalsOperator = require("./operators/equals");

// by Petka Antonov
// https://github.com/petkaantonov/deque/blob/master/js/deque.js
// Deque specifically uses
// http://en.wikipedia.org/wiki/Circular_buffer#Use_a_Fill_Count
// 1. Incrementally maintained length
// 2. Modulus avoided by using only powers of two for the capacity

module.exports = Deque;
function Deque(values, capacity) {
    if (!(this instanceof Deque)) {
        return new Deque(values, capacity);
    }
    this.capacity = this.snap(capacity);
    this.init();
    this.length = 0;
    this.front = 0;
    this.addEach(values);
}

addEach(Deque.prototype, GenericCollection.prototype);
addEach(Deque.prototype, GenericOrder.prototype);
addEach(Deque.prototype, ObservableRange.prototype);
addEach(Deque.prototype, ObservableObject.prototype);

Deque.from = GenericCollection.from;

Deque.prototype.maxCapacity = (1 << 30) | 0;
Deque.prototype.minCapacity = 16;

Deque.prototype.constructClone = function (values) {
    return new this.constructor(values, this.capacity)
};

Deque.prototype.add = function (value) {
    this.push(value);
    return true;
};

Deque.prototype.push = function (value /* or ...values */) {
    var argsLength = arguments.length;
    var length = this.length;

    if (this.dispatchesRangeChanges) {
        var plus = new Array(argsLength);
        for (var argIndex = 0; argIndex < argsLength; ++argIndex) {
            plus[argIndex] = arguments[argIndex];
        }
        var minus = [];
        this.dispatchRangeWillChange(plus, minus, length);
    }

    if (argsLength > 1) {
        var capacity = this.capacity;
        if (length + argsLength > capacity) {
            for (var argIndex = 0; argIndex < argsLength; ++argIndex) {
                this.ensureCapacity(length + 1);
                var j = (this.front + length) & (this.capacity - 1);
                this[j] = arguments[argIndex];
                length++;
                this.length = length;
            }
        }
        else {
            var j = this.front;
            for (var argIndex = 0; argIndex < argsLength; ++argIndex) {
                this[(j + length) & (capacity - 1)] = arguments[argIndex];
                j++;
            }
            this.length = length + argsLength;
        }

    } else if (argsLength === 1) {
        this.ensureCapacity(length + 1);
        var index = (this.front + length) & (this.capacity - 1);
        this[index] = value;
        this.length = length + 1;
    }

    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, length);
    }

    return this.length;
};

Deque.prototype.pop = function () {
    var length = this.length;
    if (length === 0) {
        return;
    }
    var index = (this.front + length - 1) & (this.capacity - 1);
    var result = this[index];

    if (this.dispatchesRangeChanges) {
        this.dispatchRangeWillChange([], [result], length - 1);
    }

    this[index] = void 0;
    this.length = length - 1;

    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([], [result], length - 1);
    }

    return result;
};

Deque.prototype.shift = function () {
    if (this.length !== 0) {
        var front = this.front;
        var result = this[front];

        if (this.dispatchesRangeChanges) {
            this.dispatchRangeWillChange([], [result], 0);
        }

        this[front] = void 0;
        this.front = (front + 1) & (this.capacity - 1);
        this.length--;

        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange([], [result], 0);
        }

        return result;
    }
};

Deque.prototype.unshift = function (value /* or ...values */) {
    var length = this.length;
    var argsLength = arguments.length;

    if (this.dispatchesRangeChanges) {
        var plus = new Array(argsLength);
        for (var argIndex = 0; argIndex < argsLength; ++argIndex) {
            plus[argIndex] = arguments[argIndex];
        }
        var minus = [];
        this.dispatchRangeWillChange(plus, minus, 0);
    }

    if (argsLength > 1) {
        var capacity = this.capacity;
        if (length + argsLength > capacity) {
            for (var argIndex = argsLength - 1; argIndex >= 0; argIndex--) {
                this.ensureCapacity(length + 1);
                var capacity = this.capacity;
                var index = (
                    (
                        (
                            ( this.front - 1 ) &
                            ( capacity - 1)
                        ) ^ capacity
                    ) - capacity
                );
                this[index] = arguments[argIndex];
                length++;
                this.front = index;
                this.length = length;
            }
        } else {
            var front = this.front;
            for (var argIndex = argsLength - 1; argIndex >= 0; argIndex--) {
                var index = (
                    (
                        (
                            (front - 1) &
                            (capacity - 1)
                        ) ^ capacity
                    ) - capacity
                );
                this[index] = arguments[argIndex];
                front = index;
            }
            this.front = front;
            this.length = length + argsLength;
        }
    } else if (argsLength === 1) {
        this.ensureCapacity(length + 1);
        var capacity = this.capacity;
        var index = (
            (
                (
                    (this.front - 1) &
                    (capacity - 1)
                ) ^ capacity
            ) - capacity
        );
        this[index] = value;
        this.length = length + 1;
        this.front = index;
    }

    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, 0);
    }

    return this.length;
};

Deque.prototype.clear = function () {
    this.length = 0;
    this.front = 0;
    this.init();
};

Deque.prototype.ensureCapacity = function (capacity) {
    if (this.capacity < capacity) {
        this.grow(this.snap(this.capacity * 1.5 + 16));
    }
};

Deque.prototype.grow = function (capacity) {
    var oldFront = this.front;
    var oldCapacity = this.capacity;
    var oldContent = new Array(oldCapacity);
    var length = this.length;

    copy(this, 0, oldContent, 0, oldCapacity);
    this.capacity = capacity;
    this.init();
    this.front = 0;
    if (oldFront + length <= oldCapacity) {
        // Can perform direct linear copy.
        copy(oldContent, oldFront, this, 0, length);
    } else {
        // Cannot perform copy directly, perform as much as possible at the
        // end, and then copy the rest to the beginning of the buffer.
        var lengthBeforeWrapping = length - ((oldFront + length) & (oldCapacity - 1));
        copy(oldContent, oldFront, this, 0, lengthBeforeWrapping);
        copy(oldContent, 0, this, lengthBeforeWrapping, length - lengthBeforeWrapping);
    }
};

Deque.prototype.init = function () {
    for (var index = 0; index < this.capacity; ++index) {
        this[index] = void 0;
    }
};

Deque.prototype.snap = function (capacity) {
    if (typeof capacity !== "number") {
        return this.minCapacity;
    }
    return pow2AtLeast(
        Math.min(this.maxCapacity, Math.max(this.minCapacity, capacity))
    );
};

Deque.prototype.one = function () {
    if (this.length > 0) {
        return this[this.front];
    }
};

Deque.prototype.peek = function () {
    if (this.length === 0) {
        return;
    }
    return this[this.front];
};

Deque.prototype.poke = function (value) {
    if (this.length === 0) {
        return;
    }
    this[this.front] = value;
};

Deque.prototype.peekBack = function () {
    var length = this.length;
    if (length === 0) {
        return;
    }
    var index = (this.front + length - 1) & (this.capacity - 1);
    return this[index];
};

Deque.prototype.pokeBack = function (value) {
    var length = this.length;
    if (length === 0) {
        return;
    }
    var index = (this.front + length - 1) & (this.capacity - 1);
    this[index] = value;
};

Deque.prototype.get = function (index) {
    // Domain only includes integers
    if (index !== (index | 0)) {
        return;
    }
    // Support negative indicies
    if (index < 0) {
        index = index + this.length;
    }
    // Out of bounds
    if (index < 0 || index >= this.length) {
        return;
    }
    return this[(this.front + index) & (this.capacity - 1)];
};

Deque.prototype.indexOf = function (value, index) {
    // Default start index at beginning
    if (index == null) {
        index = 0;
    }
    // Support negative indicies
    if (index < 0) {
        index = index + this.length;
    }
    // Left to right walk
    var mask = this.capacity - 1;
    for (; index < this.length; index++) {
        var offset = (this.front + index) & mask;
        if (this[offset] === value) {
            return index;
        }
    }
    return -1;
};

Deque.prototype.lastIndexOf = function (value, index) {
    // Default start position at the end
    if (index == null) {
        index = this.length - 1;
    }
    // Support negative indicies
    if (index < 0) {
        index = index + this.length;
    }
    // Right to left walk
    var mask = this.capacity - 1;
    for (; index >= 0; index--) {
        var offset = (this.front + index) & mask;
        if (this[offset] === value) {
            return index;
        }
    }
    return -1;
}


Deque.prototype.findValue = function (value, equals, index) {
    equals = equals || equalsOperator;
    // Default start index at beginning
    if (index == null) {
        index = 0;
    }
    // Support negative indicies
    if (index < 0) {
        index = index + this.length;
    }
    // Left to right walk
    var mask = this.capacity - 1;
    for (; index < this.length; index++) {
        var offset = (this.front + index) & mask;
        if (equals(value, this[offset])) {
            return index;
        }
    }
    return -1;
};

Deque.prototype.findLastValue = function (value, equals, index) {
    equals = equals || equalsOperator;
    // Default start position at the end
    if (index == null) {
        index = this.length - 1;
    }
    // Support negative indicies
    if (index < 0) {
        index = index + this.length;
    }
    // Right to left walk
    var mask = this.capacity - 1;
    for (; index >= 0; index--) {
        var offset = (this.front + index) & mask;
        if (equals(value, this[offset])) {
            return index;
        }
    }
    return -1;
};

Deque.prototype.has = function (value, equals) {
    equals = equals || equalsOperator;
    // Left to right walk
    var mask = this.capacity - 1;
    for (var index = 0; index < this.length; index++) {
        var offset = (this.front + index) & mask;
        if (this[offset] === value) {
            return true;
        }
    }
    return false;
};

Deque.prototype.reduce = function (callback, basis /*, thisp*/) {
    // TODO account for missing basis argument
    var thisp = arguments[2];
    var mask = this.capacity - 1;
    for (var index = 0; index < this.length; index++) {
        var offset = (this.front + index) & mask;
        basis = callback.call(thisp, basis, this[offset], index, this);
    }
    return basis;
};

Deque.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    // TODO account for missing basis argument
    var thisp = arguments[2];
    var mask = this.capacity - 1;
    for (var index = this.length - 1; index >= 0; index--) {
        var offset = (this.front + index) & mask;
        basis = callback.call(thisp, basis, this[offset], index, this);
    }
    return basis;
};

Deque.prototype.iterate = function (start, stop, step) {
    if (step == null) {
        step = 1;
    }
    if (stop == null) {
        stop = start;
        start = 0;
    }
    if (start == null) {
        start = 0;
    }
    if (step == null) {
        step = 1;
    }
    if (stop == null) {
        stop = this.length;
    }
    return new DequeIterator(this, start, stop, step);
};

function DequeIterator(deque, start, stop, step) {
    this.deque = deque;
    this.start = start;
    this.stop = stop;
    this.step = step;
}

DequeIterator.prototype = Object.create(Iterator.prototype);
DequeIterator.prototype.constructor = DequeIterator;

DequeIterator.prototype.next = function () {
    if (this.start < this.stop) {
        var deque = this.deque;
        var mask = deque.capacity - 1;
        var offset = (deque.front + this.start) & mask;
        var iteration = new Iterator.Iteration(
            deque[offset],
            this.start
        );
        this.start += this.step;
        return iteration;
    } else {
        return Iterator.done;
    }
};

function copy(source, sourceIndex, target, targetIndex, length) {
    for (var index = 0; index < length; ++index) {
        target[index + targetIndex] = source[index + sourceIndex];
    }
}

function pow2AtLeast(n) {
    n = n >>> 0;
    n = n - 1;
    n = n | (n >> 1);
    n = n | (n >> 2);
    n = n | (n >> 4);
    n = n | (n >> 8);
    n = n | (n >> 16);
    return n + 1;
}