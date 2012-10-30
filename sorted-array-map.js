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

Object.addEach(SortedArrayMap.prototype, Reducible);
Object.addEach(SortedArrayMap.prototype, AbstractMap);

SortedArrayMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.content
    );
};

