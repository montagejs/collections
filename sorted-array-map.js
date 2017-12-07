"use strict";

var SortedArraySet = require("./sorted-array-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("./observable-object");
var equalsOperator = require("./operators/equals");
var compareOperator = require("./operators/compare");
var addEach = require("./operators/add-each");

module.exports = SortedArrayMap;

function SortedArrayMap(values, equals, compare, getDefault) {
    if (!(this instanceof SortedArrayMap)) {
        return new SortedArrayMap(values, equals, compare, getDefault);
    }
    equals = equals || equalsOperator;
    compare = compare || compareOperator;
    getDefault = getDefault || this.getDefault;
    this.contentEquals = equals;
    this.contentCompare = compare;
    this.getDefault = getDefault;
    this.store = new SortedArraySet(
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

// hack so require("sorted-array-map").SortedArrayMap will work in MontageJS
SortedArrayMap.SortedArrayMap = SortedArrayMap;

SortedArrayMap.from = GenericCollection.from;

addEach(SortedArrayMap.prototype, GenericCollection.prototype);
addEach(SortedArrayMap.prototype, GenericMap.prototype);
addEach(SortedArrayMap.prototype, ObservableObject.prototype);
SortedArrayMap.prototype.isSorted = true;

SortedArrayMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.getDefault
    );
};
