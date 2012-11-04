"use strict";

var Shim = require("./shim");
var SortedSet = require("./sorted-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var PropertyChanges = require("./listen/property-changes");

module.exports = SortedMap;

function SortedMap(values, equals, compare, content) {
    if (!(this instanceof SortedMap)) {
        return new SortedMap(values, equals, compare, content);
    }
    equals = equals || Object.equals;
    compare = compare || Object.compare;
    content = content || Function.noop;
    this.contentEquals = equals;
    this.contentCompare = compare;
    this.content = content;
    this.store = new SortedSet(
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

Object.addEach(SortedMap.prototype, GenericCollection.prototype);
Object.addEach(SortedMap.prototype, GenericMap.prototype);
// GenericMap overrides GenericCollection, particularly addEach
Object.addEach(SortedMap.prototype, PropertyChanges.prototype);

SortedMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.content
    );
};

SortedMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.store.log(charmap, stringify);
};

SortedMap.prototype.report = function (callback, thisp, charmap, stringify) {
    stringify = stringify || this.stringify;
    this.store.report(callback, thisp, charmap, stringify);
};

SortedMap.prototype.stringify = function (callback, thisp, node, leader) {
    callback.call(thisp, leader + ' ' + node.value.key + ': ' + node.value.value);
};

