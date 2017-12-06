"use strict";

var SortedArraySet = require("./sorted-array-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("pop-observe/observable-object");
var equalsOperator = require("pop-equals");
var compareOperator = require("pop-compare");
var copy = require("./copy");

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

// hack for MontageJS
SortedArrayMap.SortedArrayMap = SortedArrayMap;

copy(SortedArrayMap.prototype, GenericCollection.prototype);
copy(SortedArrayMap.prototype, GenericMap.prototype);
copy(SortedArrayMap.prototype, ObservableObject.prototype);

SortedArrayMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.getDefault
    );
};

