"use strict";

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

var Function = require("./shim-function");
var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");
var WeakMap = require("./weak-map");

module.exports = Array;

Array.empty = [];
if (Object.freeze) {
    Object.freeze(Array.empty);
}

Array.from = function (values) {
    var array = [];
    array.addEach(values);
    return array;
};

Array.prototype.addEach = GenericCollection.prototype.addEach;
Array.prototype.deleteEach = GenericCollection.prototype.deleteEach;
Array.prototype.toArray = GenericCollection.prototype.toArray;
Array.prototype.toObject = GenericCollection.prototype.toObject;
Array.prototype.all = GenericCollection.prototype.all;
Array.prototype.any = GenericCollection.prototype.any;
Array.prototype.min = GenericCollection.prototype.min;
Array.prototype.max = GenericCollection.prototype.max;
Array.prototype.sum = GenericCollection.prototype.sum;
Array.prototype.average = GenericCollection.prototype.average;
Array.prototype.only = GenericCollection.prototype.only;
Array.prototype.flatten = GenericCollection.prototype.flatten;
Array.prototype.zip = GenericCollection.prototype.zip;
Array.prototype.sorted = GenericCollection.prototype.sorted;
Array.prototype.reversed = GenericCollection.prototype.reversed;

Array.prototype.constructClone = function (values) {
    var clone = new this.constructor();
    clone.addEach(values);
    return clone;
};

Array.prototype.has = function (value, equals) {
    return this.find(value, equals) !== -1;
};

Array.prototype.get = function (index) {
    if (+index !== index)
        throw new Error("Indicies must be numbers");
    return this[index];
};

Array.prototype.set = function (index, value) {
    this.splice(index, 1, value);
    return true;
};

Array.prototype.add = function (value) {
    this.push(value);
    return true;
};

Array.prototype['delete'] = function (value, equals) {
    var index = this.find(value, equals);
    if (index !== -1) {
        this.splice(index, 1);
        return true;
    }
    return false;
};

Array.prototype.find = function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    for (var index = 0; index < this.length; index++) {
        if (index in this && equals(this[index], value)) {
            return index;
        }
    }
    return -1;
};

Array.prototype.findLast = function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    var index = this.length;
    do {
        index--;
        if (index in this && equals(this[index], value)) {
            return index;
        }
    } while (index > 0);
    return -1;
};

Array.prototype.swap = function (index, length, plus) {
    var args = Array.prototype.slice.call(arguments, 0, 2);
    if (plus) {
        args.push.apply(args, plus);
    }
    return this.splice.apply(this, args);
};

Array.prototype.one = function () {
    if (this.length === 0) {
        throw new Error("Can't get one element from empty array.");
    }
    for (var i in this) {
        if (Object.owns(this, i)) {
            return this[i];
        }
    }
};

Array.prototype.clear = function () {
    this.length = 0;
    return this;
};

Array.prototype.compare = function (that, compare) {
    compare = compare || Object.compare;
    var i;
    var length;
    var lhs;
    var rhs;
    var relative;

    if (this === that) {
        return 0;
    }

    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.compare.call(this, that, compare);
    }

    length = Math.min(this.length, that.length);

    for (i = 0; i < length; i++) {
        if (i in this) {
            if (!(i in that)) {
                return -1;
            } else {
                lhs = this[i];
                rhs = that[i];
                relative = compare(lhs, rhs);
                if (relative) {
                    return relative;
                }
            }
        } else if (i in that) {
            return 1;
        }
    }

    return this.length - that.length;
};

Array.prototype.equals = function (that) {
    var equals = equals || Object.equals;
    var i = 0;
    var length = this.length;
    var left;
    var right;

    if (this === that) {
        return true;
    }
    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.equals.call(this, that);
    }

    if (length !== that.length) {
        return false;
    } else {
        for (; i < length; ++i) {
            if (i in this) {
                left = this[i];
                right = that[i];
                if (left !== right && (left && right && !equals(left, right))) {
                    return false;
                }
            } else {
                if (i in that) {
                    return false;
                }
            }
        }
    }
    return true;
};

Array.prototype.clone = function (depth, memo) {
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    memo = memo || new WeakMap();
    var clone = [];
    for (var i in this) {
        if (Object.owns(this, i)) {
            clone[i] = Object.clone(this[i], depth - 1, memo);
        }
    };
    return clone;
};

Array.prototype.iterate = function (start, end) {
    return new ArrayIterator(this, start, end);
};

Array.prototype.Iterator = ArrayIterator;

function ArrayIterator(array, start, end) {
    this.array = array;
    this.start = start == null ? 0 : start;
    this.end = end;
};

ArrayIterator.prototype.next = function () {
    if (this.start === (this.end == null ? this.array.length : this.end)) {
        throw StopIteration;
    } else {
        return this.array[this.start++];
    }
};

