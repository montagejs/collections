"use strict";

var Set = require("./set");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var ObservableObject = require("./observable-object");
var ObservableRange = require("./observable-range");
var equalsOperator = require("./operators/equals");
var hashOperator = require("./operators/hash");
var addEach = require("./operators/add-each");

module.exports = LruSet;

function LruSet(values, capacity, equals, hash, getDefault) {
    if (!(this instanceof LruSet)) {
        return new LruSet(values, capacity, equals, hash, getDefault);
    }
    maxLength = maxLength || Infinity;
    equals = equals || equalsOperator;
    hash = hash || hashOperator;
    getDefault = getDefault || Function.noop;
    this.store = new Set(undefined, equals, hash);
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.capacity = capacity;
    this.length = 0;
    this.addEach(values);
}

LruSet.LruSet = LruSet; // hack so require("lru-set").LruSet will work in MontageJS

LruSet.from = GenericCollection.from;

addEach(LruSet.prototype, GenericCollection.prototype);
addEach(LruSet.prototype, GenericSet.prototype);
addEach(LruSet.prototype, ObservableObject.prototype);
addEach(LruSet.prototype, ObservableRange.prototype);
Object.defineProperty(LruSet.prototype,"size",GenericCollection._sizePropertyDescriptor);

LruSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.capacity,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

LruSet.prototype.has = function (value) {
    return this.store.has(value);
};

LruSet.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("LruSet#get does not support second argument: equals");
    }
    value = this.store.get(value);
    if (value !== undefined) {
        this.store["delete"](value);
        this.store.add(value);
    } else {
        value = this.getDefault(value);
    }
    return value;
};

LruSet.prototype.add = function (value) {
    var found = this.store.has(value);
    var plus = [], minus = [], eldest;
    // if the value already exists, we delete it and add it back again so it
    // appears at the end of the list of values to truncate
    if (found) {    // update
        this.store["delete"](value);
        this.store.add(value);
    } else if (this.capacity > 0) {    // add
        // because minus is constructed before adding value, we must ensure the
        // set has positive length. hence the capacity check.
        plus.push(value);
        if (this.length >= this.capacity) {
            eldest = this.store.order.head.next;
            minus.push(eldest.value);
        }
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeWillChange(plus, minus, 0);
        }
        this.store.add(value);
        if (minus.length > 0) {
            this.store['delete'](eldest.value);
        }
        // only assign to length once to avoid jitter on length observers
        this.length = this.length + plus.length - minus.length;
        // after change
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(plus, minus, 0);
        }
    }
    // whether it grew
    return plus.length !== minus.length;
};

LruSet.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("LruSet#delete does not support second argument: equals");
    }
    var found = this.store.has(value);
    if (found) {
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeWillChange([], [value], 0);
        }
        this.store["delete"](value);
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange([], [value], 0);
        }
    }
    return found;
};

LruSet.prototype.one = function () {
    if (this.length > 0) {
        return this.store.one();
    }
};

LruSet.prototype.clear = function () {
    this.store.clear();
    this.length = 0;
};

LruSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var set = this.store;
    var index = 0;
    return set.reduce(function (basis, value) {
        return callback.call(thisp, basis, value, index++, this);
    }, basis, this);
};

LruSet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var set = this.store;
    var index = this.length - 1;
    return set.reduceRight(function (basis, value) {
        return callback.call(thisp, basis, value, index--, this);
    }, basis, this);
};

LruSet.prototype.iterate = function () {
    return this.store.iterate();
};
