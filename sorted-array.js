"use strict";

module.exports = SortedArray;

var GenericCollection = require("./generic-collection");
var ObservableObject = require("pop-observe/observable-object");
var ObservableRange = require("pop-observe/observable-range");
var equalsOperator = require("pop-equals");
var compareOperator = require("pop-compare");
var hasOperator = require("pop-has");
var iterateOperator = require("pop-iterate");
var clear = require("pop-clear");
var swap = require("pop-swap/swap");
var copy = require("./copy");

function SortedArray(values, equals, compare, getDefault) {
    if (!(this instanceof SortedArray)) {
        return new SortedArray(values, equals, compare, getDefault);
    }
    if (Array.isArray(values)) {
        this.array = values;
        values = values.splice(0, values.length);
    } else {
        this.array = [];
    }
    this.contentEquals = equals || equalsOperator;
    this.contentCompare = compare || compareOperator;
    this.getDefault = getDefault || noop;

    this.length = 0;
    this.addEach(values);
}

// hack for MontageJS
SortedArray.SortedArray = SortedArray;

copy(SortedArray.prototype, GenericCollection.prototype);
copy(SortedArray.prototype, ObservableObject.prototype);
copy(SortedArray.prototype, ObservableRange.prototype);

SortedArray.prototype.isSorted = true;

function search(array, value, compare) {
    var first = 0;
    var last = array.length - 1;
    while (first <= last) {
        var middle = (first + last) >> 1; // Math.floor( / 2)
        var comparison = compare(value, array[middle]);
        if (comparison > 0) {
            first = middle + 1;
        } else if (comparison < 0) {
            last = middle - 1;
        } else {
            return middle;
        }
    }
    return -(first + 1);
}

function searchFirst(array, value, compare, equals) {
    var index = search(array, value, compare);
    if (index < 0) {
        return -1;
    } else {
        while (index > 0 && equals(value, array[index - 1])) {
            index--;
        }
        if (!equals(value, array[index])) {
            return -1;
        } else {
            return index;
        }
    }
}

function searchLast(array, value, compare, equals) {
    var index = search(array, value, compare);
    if (index < 0) {
        return -1;
    } else {
        while (index < array.length - 1 && equals(value, array[index + 1])) {
            index++;
        }
        if (!equals(value, array[index])) {
            return -1;
        } else {
            return index;
        }
    }
}

function searchForInsertionIndex(array, value, compare) {
    var index = search(array, value, compare);
    if (index < 0) {
        return -index - 1;
    } else {
        var last = array.length - 1;
        while (index < last && compare(value, array[index + 1]) === 0) {
            index++;
        }
        return index;
    }
}

SortedArray.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.getDefault
    );
};

SortedArray.prototype.has = function (value, equals) {
    if (equals) {
        return hasOperator(this.array, value, equals);
    } else {
        var index = search(this.array, value, this.contentCompare);
        return index >= 0 && this.contentEquals(this.array[index], value);
    }
};

SortedArray.prototype.get = function (value) {
    var index = searchFirst(this.array, value, this.contentCompare, this.contentEquals);
    if (index !== -1) {
        return this.array[index];
    } else {
        return this.getDefault(value);
    }
};

SortedArray.prototype.add = function (value) {
    var index = searchForInsertionIndex(this.array, value, this.contentCompare);
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeWillChange([value], [], index);
    }
    this.array.splice(index, 0, value);
    this.length++;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([value], [], index);
    }
    return true;
};

SortedArray.prototype["delete"] = function (value) {
    var index = searchFirst(this.array, value, this.contentCompare, this.contentEquals);
    if (index !== -1) {
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeWillChange([], [value], index);
        }
        this.array.splice(index, 1);
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange([], [value], index);
        }
        return true;
    } else {
        return false;
    }
};

SortedArray.prototype.indexOf = function (value) {
    return searchFirst(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.lastIndexOf = function (value) {
    return searchLast(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.findValue = function (value) {
    return searchFirst(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.findLastValue = function (value) {
    return searchLast(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.push = function () {
    this.addEach(arguments);
};

SortedArray.prototype.unshift = function () {
    this.addEach(arguments);
};

SortedArray.prototype.pop = function () {
    var value = this.array.pop();
    this.length = this.array.length;
    return value;
};

SortedArray.prototype.shift = function () {
    var value = this.array.shift();
    this.length = this.array.length;
    return value;
};

SortedArray.prototype.slice = function () {
    return this.array.slice.apply(this.array, arguments);
};

SortedArray.prototype.splice = function (index, length /*...plus*/) {
    return this.swap(index, length, Array.prototype.slice.call(arguments, 2));
};

SortedArray.prototype.swap = function (index, length, plus) {
    if (index === undefined && length === undefined) {
        return [];
    }
    index = index || 0;
    if (index < 0) {
        index += this.length;
    }
    if (length === undefined) {
        length = Infinity;
    }
    var minus = this.slice(index, index + length);
    plus = plus || [];
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeWillChange(plus, minus, index);
    }
    swap(this.array, index, length, plus);
    this.length += plus.length - length;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, index);
    }
    return minus;
};

SortedArray.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    return this.array.reduce(function (basis, value, key) {
        return callback.call(thisp, basis, value, key, this);
    }, basis, this);
};

SortedArray.prototype.reduceRight = function () {
    var thisp = arguments[2];
    return this.array.reduceRight(function (basis, value, key) {
        return callback.call(thisp, basis, value, key, this);
    }, basis, this);
};

SortedArray.prototype.min = function () {
    if (this.length) {
        return this.array[0];
    }
};

SortedArray.prototype.max = function () {
    if (this.length) {
        return this.array[this.length - 1];
    }
};

SortedArray.prototype.one = function () {
    return this.array[0];
};

SortedArray.prototype.clear = function () {
    var minus;
    if (this.dispatchesRangeChanges) {
        minus = this.array.slice();
        this.dispatchRangeWillChange([], minus, 0);
    }
    this.length = 0;
    clear(this.array);
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([], minus, 0);
    }
};

SortedArray.prototype.equals = function (that, equals) {
    return equalsOperator(this.array, that, equals);
};

SortedArray.prototype.compare = function (that, compare) {
    return compareOperator(this.array, that, compare);
};

SortedArray.prototype.iterate = function (start, stop, step) {
    return iterateOperator(this.array, start, stop, step);
};

function noop() {}

