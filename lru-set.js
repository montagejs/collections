
var Set = require("./set");
var Reducible = require("./reducible");
var Observable = require("./observable");
var Operators = require("./operators");

module.exports = LruSet;

function LruSet(values, maxLength, equals, hash, content) {
    if (!(this instanceof LruSet)) {
        return new LruSet(values, maxLength, equals, hash);
    }
    maxLength = maxLength || Infinity;
    equals = equals || Object.equals || Operators.equals;
    hash = hash || Object.hash || Operators.hash;
    content = content || Operators.getUndefined;
    this.contentSet = new Set(undefined, equals, hash);
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.maxLength = maxLength;
    this.addEach(values);
}

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
    }
    this.contentSet.add(value);
    if (this.contentSet.length > this.maxLength) {
        var eldest = this.contentSet.contentList.head.next;
        this.contentSet["delete"](eldest.value);
    }
};

LruSet.prototype["delete"] = function (value) {
    this.contentSet["delete"](value);
};

LruSet.prototype.wipe = function () {
    this.contentSet.wipe();
};

LruSet.prototype.reduce = function () {
    var set = this.contentSet;
    return set.reduce.apply(set, arguments);
};

LruSet.prototype.reduceRight = function () {
    var set = this.contentSet;
    return set.reduceRight.apply(set, arguments);
};

LruSet.prototype.addEach = Reducible.addEach;
LruSet.prototype.forEach = Reducible.forEach;
LruSet.prototype.map = Reducible.map;
LruSet.prototype.toArray = Reducible.toArray;
LruSet.prototype.filter = Reducible.filter;
LruSet.prototype.every = Reducible.every;
LruSet.prototype.some = Reducible.some;
LruSet.prototype.all = Reducible.all;
LruSet.prototype.any = Reducible.any;
LruSet.prototype.min = Reducible.min;
LruSet.prototype.max = Reducible.max;
LruSet.prototype.count = Reducible.count;
LruSet.prototype.sum = Reducible.sum;
LruSet.prototype.average = Reducible.average;
LruSet.prototype.concat = Reducible.concat;
LruSet.prototype.flatten = Reducible.flatten;
LruSet.prototype.zip = Reducible.zip;
LruSet.prototype.sorted = Reducible.sorted;
LruSet.prototype.clone = Reducible.clone;

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

LruSet.prototype.getContentChangeDescriptor = Observable.getContentChangeDescriptor;
LruSet.prototype.addContentChangeListener = Observable.addContentChangeListener;
LruSet.prototype.removeContentChangeListener = Observable.removeContentChangeListener;
LruSet.prototype.dispatchContentChange = Observable.dispatchContentChange;
LruSet.prototype.addBeforeContentChangeListener = Observable.addBeforeContentChangeListener;
LruSet.prototype.removeBeforeContentChangeListener = Observable.removeBeforeContentChangeListener;
LruSet.prototype.dispatchBeforeContentChange = Observable.dispatchBeforeContentChange;

LruSet.prototype.equals = function (that) {
    return this.contentSet.equals(that);
};

LruSet.prototype.iterate = function () {
    return this.contentSet.iterate();
};

