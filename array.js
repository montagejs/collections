"use strict";

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

require("./array-shim");
require("./object");
var GenericCollection = require("./generic-collection");

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

Object.addEach(Array.prototype, GenericCollection);

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

Array.prototype.clear = function () {
    this.length = 0;
    return this;
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

