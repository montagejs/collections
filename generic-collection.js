"use strict";

require("./object");

var GenericCollection = exports;

GenericCollection.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            values.forEach(this.add, this);
        } else if (typeof values.length === "number") {
            // Array-like objects that do not implement forEach, ergo,
            // Arguments
            for (var i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        } else {
            Object.keys(values).forEach(function (key) {
                this.add(values[key], key);
            }, this);
        }
    }
};

GenericCollection.deleteEach = function (values) {
    values.forEach(function (value) {
        this["delete"](value);
    }, this);
};

// all of the following functions are implemented in terms of "reduce".
// some need "constructClone".

GenericCollection.forEach = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (undefined, value, key, object, depth) {
        callback.call(thisp, value, key, object, depth);
    }, undefined);
};

GenericCollection.map = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = [];
    this.reduce(function (undefined, value, key, object, depth) {
        result.push(callback.call(thisp, value, key, object, depth));
    }, undefined);
    return result;
};

GenericCollection.toArray = function () {
    return this.map(identity);
};

// this depends on stringable keys, which apply to Array and Iterator
// because they have numeric keys and all Maps since they may use
// strings as keys.  List, Set, and SortedSet have nodes for keys, so
// toObject would not be meaningful.
GenericCollection.toObject = function () {
    var object = {};
    this.reduce(function (undefined, value, key) {
        object[key] = value;
    }, undefined);
    return object;
};

GenericCollection.filter = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = this.constructClone();
    this.reduce(function (undefined, value, key, object, depth) {
        if (callback.call(thisp, value, key, object, depth)) {
            result.add(value);
        }
    }, undefined);
    return result;
};

GenericCollection.every = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result && callback.call(thisp, value, key, object, depth);
    }, true);
};

GenericCollection.some = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result || callback.call(thisp, value, key, object, depth);
    }, false);
};

GenericCollection.all = function () {
    return this.every(Boolean);
};

GenericCollection.any = function () {
    return this.some(Boolean);
};

GenericCollection.min = function (compare) {
    compare = this.contentCompare || Object.compare;
    return this.reduce(function (result, value) {
        return compare(value, result) < 0 ? value : result;
    }, Infinity);
};

GenericCollection.max = function (compare) {
    compare = this.contentCompare || Object.compare;
    return this.reduce(function (result, value) {
        return compare(value, result) > 0 ? value : result;
    }, -Infinity);
};

GenericCollection.sum = function (zero) {
    zero = zero === undefined ? 0 : zero;
    return this.reduce(add, zero);
};

function add(a, b) {
    return a + b;
}

GenericCollection.average = function (zero) {
    var sum = zero === undefined ? 0 : zero;
    var count = zero === undefined ? 0 : zero;
    this.reduce(function (undefined, value) {
        sum += value;
        count += 1;
    }, undefined);
    return sum / count;
};

GenericCollection.concat = function () {
    var result = this.constructClone(this);
    for (var i = 0; i < arguments.length; i++) {
        result.addEach(arguments[i]);
    }
    return result;
};

GenericCollection.flatten = function () {
    return this.reduce(flattenReducer, this.constructClone());
};

function flattenReducer(result, array) {
    array.forEach(thisPush, result);
    return result;
}

function thisPush(value) {
    this.push(value);
}

GenericCollection.zip = function () {
    var table = Array.prototype.slice.call(arguments);
    table.unshift(this);
    return transpose(table);
}

function transpose(table) {
    var transpose = [];
    var length = Infinity;
    // compute shortest row
    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        if (row.length < length) {
            length = row.length;
        }
    }
    for (var i = 0; i < table.length; i++) {
        var j = 0;
        table[i].reduce(function (undefined, value) {
            if (j < length) {
                transpose[j] = transpose[j] || [];
                transpose[j][i] = value;
            }
            j++;
        }, undefined);
    }
    return transpose;
}

GenericCollection.sorted = function (compare, by, order) {
    compare = compare || this.contentCompare || Object.compare;
    // account for comparators generated by Function.by
    if (compare.by) {
        by = compare.by;
        compare = compare.compare || this.contentCompare || Object.compare;
    } else {
        by = by || identity;
    }
    if (order === undefined)
        order = 1;
    return this.map(function (item) {
        return {
            by: by(item),
            value: item
        };
    })
    .sort(function (a, b) {
        return compare(a.by, b.by) * order;
    })
    .map(function (pair) {
        return pair.value;
    });
};

GenericCollection.reversed = function () {
    return this.constructClone(this).reverse();
};

GenericCollection.clone = function (depth, memo) {
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    var clone = this.constructClone();
    this.forEach(function (value, key) {
        if (Object.clone) {
            value = Object.clone(value, depth - 1, memo);
        }
        clone.set(key, value);
    }, this);
    return clone;
};

function identity(value) {
    return value;
}

