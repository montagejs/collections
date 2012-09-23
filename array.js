
/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

require("./array-shim");
var Reducible = require("./reducible");
var Operators = require("./operators");

Array.empty = [];
if (Object.freeze) {
    Object.freeze(Array.empty);
}

Array.from = function (values) {
    var array = [];
    array.addEach(values);
    return array;
};

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
    return this;
};

Array.prototype.add = function (value) {
    this.push(value);
};

Array.prototype['delete'] = function (value, equals) {
    var index = this.find(value, equals);
    if (index !== -1) {
        this.splice(index, 1);
    }
};

Array.prototype.find = function (value, equals) {
    equals = equals || this.contentEquals || Object.equals || Operators.equals;
    for (var index = 0; index < this.length; index++) {
        if (index in this && equals(this[index], value)) {
            return index;
        }
    }
    return -1;
};

Array.prototype.findLast = function (value, equals) {
    equals = equals || this.contentEquals || Object.equals || Operators.equals;
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
    return this.splice.apply(this, [index, length].concat(plus));
};

Array.prototype.toArray = Reducible.toArray;
Array.prototype.toObject = Reducible.toArray;
Array.prototype.addEach = Reducible.addEach;
Array.prototype.equals = Reducible.equals;
Array.prototype.compare = Reducible.compare;
Array.prototype.any = Reducible.any;
Array.prototype.all = Reducible.all;
Array.prototype.min = Reducible.min;
Array.prototype.max = Reducible.max;
Array.prototype.sum = Reducible.sum;
Array.prototype.average = Reducible.average;
Array.prototype.unique = Reducible.unique;
Array.prototype.flatten = Reducible.flatten;
Array.prototype.sorted = Reducible.sorted;
Array.prototype.reversed = Reducible.reversed;
Array.prototype.clone = Reducible.clone;

Array.prototype.count = function () {
    return this.length;
};

Array.prototype.one = function () {
    if (this.length === 0) {
        throw new Error("Can't get one element from empty array");
    }
    return this[0];
};

Array.prototype.only = function () {
    if (this.length !== 1) {
        throw new Error(
            "Can't get only element of array with " +
            this.length + " elements."
        );
    }
    return this[0];
};

Array.prototype.wipe = function () {
    this.length = 0;
    return this;
};

Array.prototype.iterate = function (start, end) {
    return new ArrayIterator(this, start, end);
};

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

