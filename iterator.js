"use strict";

module.exports = Iterator;

var GenericCollection = require("./generic-collection");

// upgrades an iterable to a Iterator
function Iterator(iterable) {

    if (!(this instanceof Iterator)) {
        return new Iterator(iterable);
    }

    if (Array.isArray(iterable) || typeof iterable === "string")
        return Iterator.iterate(iterable);

    iterable = Object(iterable);

    if (iterable instanceof Iterator) {
        return iterable;
    } else if (iterable.next) {
        this.next = function () {
            return iterable.next();
        };
    } else if (iterable.iterate) {
        var iterator = iterable.iterate();
        this.next = function () {
            return iterator.next();
        };
    } else if (Object.prototype.toString.call(iterable) === "[object Function]") {
        this.next = iterable;
    } else {
        throw new TypeError("Cannot iterate");
    }

}

Object.addEach(Iterator.prototype, GenericCollection);

// this is a bit of a cheat so flatten and such work with the generic
// reducible
Iterator.prototype.constructClone = function (values) {
    var clone = [];
    Reducible.addEach.call(clone, values);
    return clone;
};

Iterator.prototype.mapIterator = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        return callback.call(thisp, self.next(), i++, self);
    });
};

Iterator.prototype.filterIterator = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        var value;
        while (true) {
            value = self.next();
            if (callback.call(thisp, value, i++, self))
                return value;
        }
    });
};

Iterator.prototype.reduce = function (callback /*, initial, thisp*/) {
    var self = Iterator(this),
        result = arguments[1],
        thisp = arguments[2],
        i = 0,
        value;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    // first iteration unrolled
    try {
        value = self.next();
        if (arguments.length > 1) {
            result = callback.call(thisp, result, value, i, self);
        } else {
            result = value;
        }
        i++;
    } catch (exception) {
        if (isStopIteration(exception)) {
            if (arguments.length > 1) {
                return arguments[1]; // initial
            } else {
                throw TypeError("cannot reduce a value from an empty iterator with no initial value");
            }
        } else {
            throw exception;
        }
    }

    // remaining entries
    try {
        while (true) {
            value = self.next();
            result = callback.call(thisp, result, value, i, self);
            i++;
        }
    } catch (exception) {
        if (isStopIteration(exception)) {
            return result;
        } else {
            throw exception;
        }
    }

};

Iterator.prototype.every = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        result = true;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    self.mapIterator.apply(self, arguments)
    .forEach(function (value) {
        if (!value) {
            result = false;
            throw StopIteration;
        }
    });

    return result;
};

Iterator.prototype.some = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        result = false;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    self.mapIterator.apply(self, arguments)
    .forEach(function (value) {
        if (value) {
            result = true;
            throw StopIteration;
        }
    });

    return result;
};

Iterator.prototype.concat = function () {
    return Iterator.concat(
        Array.prototype.concat.apply(this, arguments)
    );
};

Iterator.prototype.dropWhile = function (callback /*, thisp */) {
    var self = Iterator(this),
        thisp = arguments[1],
        stopped = false,
        stopValue;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    self.forEach(function (value, i) {
        if (!callback.call(thisp, value, i, self)) {
            stopped = true;
            stopValue = value;
            throw StopIteration;
        }
    });

    if (stopped) {
        return self.constructor([stopValue]).concat(self);
    } else {
        return self.constructor([]);
    }
};

Iterator.prototype.takeWhile = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1];

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    return self.mapIterator(function (value, i) {
        if (!callback.call(thisp, value, i, self))
            throw StopIteration;
        return value;
    });
};

Iterator.prototype.filterIterator = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        var value;
        while (true) {
            value = self.next();
            if (callback.call(thisp, value, i++, self))
                return value;
        }
    });
};

Iterator.prototype.zip = function () {
    return Iterator.transpose(
        Array.prototype.concat.apply(this, arguments)
    );
};

Iterator.prototype.enumerate = function (start) {
    return Iterator.count(start).zip(this);
};

// coerces arrays to iterators
// iterators to self
Iterator.iterate = function (iterable) {
    var start;
    start = 0;
    return new Iterator(function () {
        // advance to next owned entry
        if (typeof iterable === "object") {
            while (!(start in iterable)) {
                // deliberately late bound
                if (start >= iterable.length)
                    throw StopIteration;
                start += 1;
            }
        } else if (start >= iterable.length) {
            throw StopIteration;
        }
        var result = iterable[start];
        start += 1;
        return result;
    });
};

Iterator.cycle = function (cycle, times) {
    if (arguments.length < 2)
        times = Infinity;
    //cycle = Iterator(cycle).toArray();
    var next = function () {
        throw StopIteration;
    };
    return new Iterator(function () {
        var iteration;
        try {
            return next();
        } catch (exception) {
            if (isStopIteration(exception)) {
                if (times <= 0)
                    throw exception;
                times--;
                iteration = Iterator.iterate(cycle);
                next = iteration.next.bind(iteration);
                return next();
            } else {
                throw exception;
            }
        }
    });
};

Iterator.concat = function (iterators) {
    iterators = Iterator(iterators);
    var next = function () {
        throw StopIteration;
    };
    return new Iterator(function (){
        var iteration;
        try {
            return next();
        } catch (exception) {
            if (isStopIteration(exception)) {
                iteration = Iterator(iterators.next());
                next = iteration.next.bind(iteration);
                return next();
            } else {
                throw exception;
            }
        }
    });
};

Iterator.transpose = function (iterators) {
    iterators = Iterator(iterators).map(Iterator);
    if (iterators.length < 1)
        return new Iterator([]);
    return new Iterator(function () {
        var stopped;
        var result = iterators.map(function (iterator) {
            try {
                return iterator.next();
            } catch (exception) {
                if (isStopIteration(exception)) {
                    stopped = true;
                } else {
                    throw exception;
                }
            }
        });
        if (stopped) {
            throw StopIteration;
        }
        return result;
    });
};

Iterator.zip = function () {
    return Iterator.transpose(
        Array.prototype.slice.call(arguments)
    );
};

Iterator.chain = function () {
    return Iterator.concat(
        Array.prototype.slice.call(arguments)
    );
};

Iterator.range = function (start, stop, step) {
    if (arguments.length < 3)
        step = 1;
    if (arguments.length < 2) {
        stop = start;
        start = 0;
    }
    start = start || 0;
    return new Iterator(function () {
        if (start >= stop)
            throw StopIteration;
        if (isNaN(start))
            throw '';
        var result = start;
        start += step;
        return result;
    });
};

Iterator.count = function (start, step) {
    step = step || 1;
    return Iterator.range(start, Infinity, step);
};

Iterator.repeat = function (value, times) {
    if (arguments.length < 2)
        times = Infinity;
    times = +times;
    return new Iterator.range(times).mapIterator(function () {
        return value;
    });
};

// shim isStopIteration
if (typeof isStopIteration === "undefined") {
    global.isStopIteration = function (exception) {
        return Object.prototype.toString.call(exception) === "[object StopIteration]";
    };
}

// shim StopIteration
if (typeof StopIteration === "undefined") {
    global.StopIteration = {};
    Object.prototype.toString = (function (toString) {
        return function () {
            if (
                this === global.StopIteration ||
                this instanceof global.ReturnValue
            )
                return "[object StopIteration]";
            else
                return toString.call(this, arguments);
        };
    })(Object.prototype.toString);
}

// shim ReturnValue
if (typeof ReturnValue === "undefined") {
    global.ReturnValue = function (value) {
        if (!(this instanceof global.ReturnValue))
            return new global.ReturnValue(value);
        this.value = value;
    };
}

