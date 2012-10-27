"use strict";

var List = require("./list");
var FastSet = require("./fast-set");
var Reducible = require("./reducible");
var Observable = require("./observable");
var Operators = require("./operators");

module.exports = Set;

function Set(values, equals, hash, content) {
    if (!(this instanceof Set)) {
        return new Set(values, equals, hash);
    }
    equals = equals || Object.equals || Operators.equals;
    hash = hash || Object.hash || Operators.hash;
    content = content || Operators.getUndefined;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.contentList = new List(undefined, equals); // of values in insertion order
    this.content = content;
    this.contentSet = new FastSet( // set of nodes from list, by value
        undefined,
        function (a, b) {
            return equals(a.value, b.value);
        },
        function (node) {
            return hash(node.value);
        }
    );
    this.length = 0;
    this.addEach(values);
}

Set.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.contentHash, this.content);
};

Set.prototype.has = function (value) {
    var node = new this.contentList.Node(value);
    return this.contentSet.has(node);
};

Set.prototype.get = function (value) {
    var node = new this.contentList.Node(value);
    node = this.contentSet.get(node);
    if (node) {
        return node.value;
    } else {
        return this.content(value);
    }
};

Set.prototype.add = function (value) {
    var node = new this.contentList.Node(value);
    if (!this.contentSet.has(node)) {
        this.contentList.add(value);
        node = this.contentList.head.prev;
        this.contentSet.add(node);
        this.length++;
        return true;
    }
    return false;
};

Set.prototype["delete"] = function (value) {
    var node = new this.contentList.Node(value);
    if (this.contentSet.has(node)) {
        var node = this.contentSet.get(node);
        this.contentSet["delete"](node); // removes from the set
        node["delete"](); // removes the node from the list in place
        this.length--;
        return true;
    }
    return false;
};

Set.prototype.clear = function () {
    this.contentSet.clear();
    this.contentList.clear();
};

Set.prototype.reduce = function () {
    var list = this.contentList;
    return list.reduce.apply(list, arguments);
};

Set.prototype.reduceRight = function () {
    var list = this.contentList;
    return list.reduceRight.apply(list, arguments);
};

Set.prototype.addEach = Reducible.addEach;
Set.prototype.forEach = Reducible.forEach;
Set.prototype.map = Reducible.map;
Set.prototype.toArray = Reducible.toArray;
Set.prototype.filter = Reducible.filter;
Set.prototype.every = Reducible.every;
Set.prototype.some = Reducible.some;
Set.prototype.all = Reducible.all;
Set.prototype.any = Reducible.any;
Set.prototype.min = Reducible.min;
Set.prototype.max = Reducible.max;
Set.prototype.sum = Reducible.sum;
Set.prototype.average = Reducible.average;
Set.prototype.concat = Reducible.concat;
Set.prototype.flatten = Reducible.flatten;
Set.prototype.zip = Reducible.zip;
Set.prototype.sorted = Reducible.sorted;
Set.prototype.clone = Reducible.clone;

Set.prototype.makeObservable = function () {
    var self = this;
    this.contentSet.addBeforeContentChangeListener(function () {
        self.dispatchBeforeContentChange.apply(self, arguments);
    });
    this.contentSet.addContentChangeListener(function () {
        self.dispatchContentChange.apply(self, arguments);
    });
    this.isObservable = true;
};

Set.prototype.getContentChangeDescriptor = Observable.getContentChangeDescriptor;
Set.prototype.addContentChangeListener = Observable.addContentChangeListener;
Set.prototype.removeContentChangeListener = Observable.removeContentChangeListener;
Set.prototype.dispatchContentChange = Observable.dispatchContentChange;
Set.prototype.addBeforeContentChangeListener = Observable.addBeforeContentChangeListener;
Set.prototype.removeBeforeContentChangeListener = Observable.removeBeforeContentChangeListener;
Set.prototype.dispatchBeforeContentChange = Observable.dispatchBeforeContentChange;

Set.prototype.equals = function (that) {
    return this.contentSet.equals(that);
};

Set.prototype.iterate = function () {
    return this.contentList.iterate();
};

Set.prototype.log = function () {
    var set = this.contentSet;
    return set.log.apply(set, arguments);
};

