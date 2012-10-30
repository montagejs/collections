"use strict";

require("./object");
var SortedArraySet = require("./sorted-array-set");
var Reducible = require("./reducible");
var AbstractMap = require("./abstract-map");

module.exports = SortedArrayMap;

function SortedArrayMap(values, equals, compare, content) {
    if (!(this instanceof SortedArrayMap)) {
        return new SortedArrayMap(values, equals, compare, content);
    }
    equals = equals || Object.equals;
    compare = compare || Object.compare;
    content = content || Function.noop;
    this.contentEquals = equals;
    this.contentCompare = compare;
    this.content = content;
    this.contentSet = new SortedArraySet(
        null,
        function keysEqual(a, b) {
            return equals(a.key, b.key);
        },
        function compareKeys(a, b) {
            return compare(a.key, b.key);
        }
    );
    this.length = 0;
    this.addEach(values);
}

SortedArrayMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.content
    );
};

SortedArrayMap.prototype.addEach = AbstractMap.addEach;
SortedArrayMap.prototype.has = AbstractMap.has;
SortedArrayMap.prototype.get = AbstractMap.get;
SortedArrayMap.prototype.set = AbstractMap.set;
SortedArrayMap.prototype['delete'] = AbstractMap['delete'];
SortedArrayMap.prototype.clear = AbstractMap.clear;
SortedArrayMap.prototype.reduce = AbstractMap.reduce;
SortedArrayMap.prototype.keys = AbstractMap.keys;
SortedArrayMap.prototype.values = AbstractMap.values;
SortedArrayMap.prototype.items = AbstractMap.items;
SortedArrayMap.prototype.Item = AbstractMap.Item;

SortedArrayMap.prototype.forEach = Reducible.forEach;
SortedArrayMap.prototype.map = Reducible.map;
SortedArrayMap.prototype.toArray = Reducible.toArray;
SortedArrayMap.prototype.toObject = Reducible.toObject;
SortedArrayMap.prototype.filter = Reducible.filter;
SortedArrayMap.prototype.every = Reducible.every;
SortedArrayMap.prototype.some = Reducible.some;
SortedArrayMap.prototype.all = Reducible.all;
SortedArrayMap.prototype.any = Reducible.any;
SortedArrayMap.prototype.min = Reducible.min;
SortedArrayMap.prototype.max = Reducible.max;
SortedArrayMap.prototype.sum = Reducible.sum;
SortedArrayMap.prototype.average = Reducible.average;
SortedArrayMap.prototype.flatten = Reducible.flatten;
SortedArrayMap.prototype.zip = Reducible.zip;
SortedArrayMap.prototype.clone = Reducible.clone;

