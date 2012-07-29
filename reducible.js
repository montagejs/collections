
var Reducible = module.exports = {};

var Operators = require("./operators");

// all of the following functions are implemented in terms of "reduce".

Reducible.forEach = function forEach(callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (undefined, value, key, object, depth) {
        callback.call(thisp, value, key, object, depth);
    }, undefined);
};

Reducible.map = function map(callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = [];
    this.reduce(function (undefined, value, key, object, depth) {
        result.push(callback.call(thisp, value, key, object, depth));
    }, undefined);
    return result;
};

Reducible.toArray = function toArray() {
    return this.map(identity);
};

function identity(value) {
    return value;
}

Reducible.filter = function filter(callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = [];
    this.reduce(result, function (undefined, value, key, object, depth) {
        if (callback.call(thisp, value, key, object, depth)) {
            result.push(value);
        }
    }, undefined);
    return result;
};

Reducible.every = function every(callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result && callback.call(thisp, value, key, object, depth);
    }, true);
};

Reducible.some = function some(callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result || callback.call(thisp, value, key, object, depth);
    }, false);
};

Reducible.all = function all() {
    return this.every(Boolean);
};

Reducible.any = function any() {
    return this.some(Boolean);
};

Reducible.min = function min(compare) {
    compare = this.compare || Object.compare || Operators.compare;
    return this.reduce(function (result, value) {
        return compare(value, result) < 0 ? value : result;
    }, Infinity);
};

Reducible.max = function max(compare) {
    compare = this.compare || Object.compare || Operators.compare;
    return this.reduce(function (result, value) {
        return compare(value, result) > 0 ? value : result;
    }, -Infinity);
};

Reducible.count = function count(zero) {
    zero = zero === undefined ? 0 : zero;
    return this.reduce(increment, zero);
};

function increment(value) {
    return value + 1;
}

Reducible.sum = function sum(zero) {
    zero = zero === undefined ? 0 : zero;
    return this.reduce(add, zero);
};

function add(a, b) {
    return a + b;
}

Reducible.average = function average(zero) {
    var sum = zero === undefined ? 0 : zero;
    var count = zero === undefined ? 0 : zero;
    this.reduce(function (undefined, value) {
        sum += value;
        count += 1;
    }, undefined);
    return sum / count;
};

Reducible.flatten = function flatten() {
    return this.reduce(flattenReducer, []);
};

function flattenReducer(result, array) {
    array.forEach(thisPush, result);
    return result;
}

function thisPush(value) {
    this.push(value);
}

// equals
// compare
// zip
// enumerate

