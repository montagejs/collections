"use strict";

var SortedSet = require("./sorted-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("./observable-object");
var equalsOperator = require("./operators/equals");
var compareOperator = require("./operators/compare");
var addEach = require("./operators/add-each");

module.exports = SortedMap;

function SortedMap(values, equals, compare, getDefault) {
    if (!(this instanceof SortedMap)) {
        return new SortedMap(values, equals, compare, getDefault);
    }
    equals = equals || equalsOperator;
    compare = compare || compareOperator;
    getDefault = getDefault || this.getDefault;
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

SortedMap.from = GenericCollection.from;

addEach(SortedMap.prototype, GenericCollection.prototype);
addEach(SortedMap.prototype, GenericMap.prototype);
addEach(SortedMap.prototype, ObservableObject.prototype);
Object.defineProperty(SortedMap.prototype,"size",GenericCollection._sizePropertyDescriptor);

SortedMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.getDefault
    );
};
SortedMap.prototype.iterate = function () {
    return this.store.iterate();
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
