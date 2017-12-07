"use strict";

var SortedArray = require("./sorted-array");
var GenericSet = require("./generic-set");
var ObservableObject = require("./observable-object");
var addEach = require("./operators/add-each");

module.exports = SortedArraySet;

function SortedArraySet(values, equals, compare, getDefault) {
    if (!(this instanceof SortedArraySet)) {
        return new SortedArraySet(values, equals, compare, getDefault);
    }
    SortedArray.call(this, values, equals, compare, getDefault);
}

// hack so require("sorted-array-set".SortedArraySet works in MontageJS
SortedArraySet.SortedArraySet = SortedArraySet;

SortedArraySet.prototype = Object.create(SortedArray.prototype);

SortedArraySet.prototype.constructor = SortedArraySet;

addEach(SortedArraySet.prototype, GenericSet.prototype);
addEach(SortedArraySet.prototype, ObservableObject.prototype);

SortedArraySet.prototype.isSorted = true;

SortedArraySet.from = SortedArray.from;

SortedArraySet.prototype.isSorted = true;

SortedArraySet.prototype.add = function (value) {
    if (!this.has(value)) {
        SortedArray.prototype.add.call(this, value);
        return true;
    } else {
        return false;
    }
};

SortedArraySet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var self = this;
    var thisp = arguments[2];
    return this.array.reduce(function (basis, value, index) {
        return callback.call(thisp, basis, value, index, self);
    }, basis);
};

SortedArraySet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var self = this;
    var thisp = arguments[2];
    return this.array.reduceRight(function (basis, value, index) {
        return callback.call(thisp, basis, value, index, self);
    }, basis);
};
