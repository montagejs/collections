"use strict";

var Shim = require("./shim");
var Set = require("./set");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var PropertyChanges = require("./listen/property-changes");

module.exports = LruSet;

function LruSet(values, maxLength, equals, hash, content) {
    if (!(this instanceof LruSet)) {
        return new LruSet(values, maxLength, equals, hash);
    }
    maxLength = maxLength || Infinity;
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    content = content || Function.noop;
    this.store = new Set(undefined, equals, hash);
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.maxLength = maxLength;
    this.length = 0;
    this.addEach(values);
}

Object.addEach(LruSet.prototype, GenericCollection.prototype);
Object.addEach(LruSet.prototype, GenericSet.prototype);
Object.addEach(LruSet.prototype, PropertyChanges.prototype);

LruSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.maxLength,
        this.contentEquals,
        this.contentHash,
        this.content
    );
};

LruSet.prototype.has = function (value) {
    return this.store.has(value);
};

LruSet.prototype.get = function (value) {
    value = this.store.get(value);
    if (value !== undefined) {
        this.store["delete"](value);
        this.store.add(value);
    } else {
        value = this.content();
    }
    return value;
};

LruSet.prototype.add = function (value) {
    if (this.store.has(value)) {
        this.store["delete"](value);
        this.length--;
    }
    this.store.add(value);
    this.length++;
    if (this.store.length > this.maxLength) {
        var eldest = this.store.order.head.next;
        this.store["delete"](eldest.value);
        this.length--;
        return false;
    }
    return true;
};

LruSet.prototype["delete"] = function (value) {
    if (this.store["delete"](value)) {
        this.length--;
        return true;
    }
    return false;
};

LruSet.prototype.one = function () {
    if (this.length === 0) {
        throw new Error("Can't get one value from empty collection.");
    }
    return this.store.one();
};

LruSet.prototype.clear = function () {
    this.store.clear();
    this.length = 0;
};

LruSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var set = this.store;
    return set.reduce(function (basis, value) {
        return callback.call(thisp, basis, value, value, this);
    }, basis, this);
};

LruSet.prototype.reduceRight = function () {
    var thisp = arguments[2];
    var set = this.store;
    return set.reduceRight(function (basis, value) {
        return callback.call(thisp, basis, value, value, this);
    }, basis, this);
};

LruSet.prototype.iterate = function () {
    return this.store.iterate();
};

