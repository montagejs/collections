"use strict";

module.exports = SortedArraySet;

var SortedArray = require("./sorted-array");

function SortedArraySet(values, equals, compare, content) {
    if (!(this instanceof SortedArraySet)) {
        return new SortedArraySet(values, equals, compare, content);
    }
    SortedArray.call(this, values, equals, compare, content);
}

SortedArraySet.prototype = Object.create(SortedArray.prototype);

SortedArraySet.prototype.add = function (value) {
    if (!this.has(value)) {
        SortedArray.prototype.add.call(this, value);
        return true;
    } else {
        return false;
    }
};

