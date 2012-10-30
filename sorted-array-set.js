"use strict";

module.exports = SortedArraySet;

require("./object");
var SortedArray = require("./sorted-array");
var GenericSet = require("./generic-set");

function SortedArraySet(values, equals, compare, content) {
    if (!(this instanceof SortedArraySet)) {
        return new SortedArraySet(values, equals, compare, content);
    }
    SortedArray.call(this, values, equals, compare, content);
}

SortedArraySet.prototype = Object.create(SortedArray.prototype);

SortedArraySet.prototype.constructor = SortedArraySet;

Object.addEach(SortedArraySet.prototype, GenericSet);

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
        return callback.call(thisp, basis, value, value, self, index);
    }, basis);
};

SortedArraySet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var self = this;
    var thisp = arguments[2];
    return this.array.reduceRight(function (basis, value, index) {
        return callback.call(thisp, basis, value, value, self, index);
    }, basis);
};

