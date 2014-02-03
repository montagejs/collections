"use strict";

var Shim = require("./shim");
var SortedSet = require("./sorted-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("./observable-object");

module.exports = SortedMap;

function SortedMap(values, equals, compare, getDefault) {
    if (!(this instanceof SortedMap)) {
        return new SortedMap(values, equals, compare, getDefault);
    }
    equals = equals || Object.equals;
    compare = compare || Object.compare;
    getDefault = getDefault || Function.noop;
    this.contentEquals = equals;
    this.contentCompare = compare;
    this.getDefault = getDefault;
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

// hack so require("sorted-map").SortedMap will work in MontageJS
SortedMap.SortedMap = SortedMap;

Object.addEach(SortedMap.prototype, GenericCollection.prototype);
Object.addEach(SortedMap.prototype, GenericMap.prototype);
Object.addEach(SortedMap.prototype, ObservableObject.prototype);

SortedMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.getDefault
    );
};

SortedMap.prototype.log = function (charmap, logNode, callback, thisp) {
    logNode = logNode || this.logNode
    this.store.log(charmap, function (node, log, logBefore) {
        logNode(node.value, log, logBefore);
    }, callback, thisp);
};

SortedMap.prototype.logNode = function (node, log) {
    log(" key: " + node.key);
    log(" value: " + node.value);
};

