"use strict";

require("./object");
var Set = require("./set");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var Observable = require("./observable");

module.exports = LruSet;

function LruSet(values, maxLength, equals, hash, content) {
    if (!(this instanceof LruSet)) {
        return new LruSet(values, maxLength, equals, hash);
    }
    maxLength = maxLength || Infinity;
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    content = content || Function.noop;
    this.contentSet = new Set(undefined, equals, hash);
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.maxLength = maxLength;
    this.length = 0;
    this.addEach(values);
}

Object.addEach(LruSet.prototype, GenericCollection);
Object.addEach(LruSet.prototype, GenericSet);
Object.addEach(LruSet.prototype, Observable);

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
    return this.contentSet.has(value);
};

LruSet.prototype.get = function (value) {
    value = this.contentSet.get(value);
    if (value !== undefined) {
        this.contentSet["delete"](value);
        this.contentSet.add(value);
    } else {
        value = this.content();
    }
    return value;
};

LruSet.prototype.add = function (value) {
    if (this.contentSet.has(value)) {
        this.contentSet["delete"](value);
        this.length--;
    }
    this.contentSet.add(value);
    this.length++;
    if (this.contentSet.length > this.maxLength) {
        var eldest = this.contentSet.contentList.head.next;
        this.contentSet["delete"](eldest.value);
        this.length--;
        return false;
    }
    return true;
};

LruSet.prototype["delete"] = function (value) {
    if (this.contentSet["delete"](value)) {
        this.length--;
        return true;
    }
    return false;
};

LruSet.prototype.clear = function () {
    this.contentSet.clear();
    this.length = 0;
};

LruSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var set = this.contentSet;
    return set.reduce(function (basis, value) {
        return callback.call(thisp, basis, value, value, this);
    }, basis, this);
};

LruSet.prototype.reduceRight = function () {
    var thisp = arguments[2];
    var set = this.contentSet;
    return set.reduceRight(function (basis, value) {
        return callback.call(thisp, basis, value, value, this);
    }, basis, this);
};

LruSet.prototype.makeObservable = function () {
    var self = this;
    this.contentSet.addBeforeContentChangeListener(function () {
        self.dispatchBeforeContentChange.apply(self, arguments);
    });
    this.contentSet.addContentChangeListener(function () {
        self.dispatchContentChange.apply(self, arguments);
    });
    this.isObservable = true;
};

LruSet.prototype.iterate = function () {
    return this.contentSet.iterate();
};

