"use strict";

require("./object");
var List = require("./list");
var FastSet = require("./fast-set");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var Observable = require("./observable");

module.exports = Set;

function Set(values, equals, hash, content) {
    if (!(this instanceof Set)) {
        return new Set(values, equals, hash);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    content = content || Function.noop;
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

Object.addEach(Set.prototype, GenericCollection);
Object.addEach(Set.prototype, GenericSet);
Object.addEach(Set.prototype, Observable);

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
    this.length = 0;
};

Set.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var list = this.contentList;
    return list.reduce(function (basis, value) {
        return callback.call(thisp, basis, value, value, this);
    }, basis, this);
};

Set.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var list = this.contentList;
    return list.reduceRight(function (basis, value) {
        return callback.call(thisp, basis, value, value, this);
    }, basis, this);
};

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

Set.prototype.iterate = function () {
    return this.contentList.iterate();
};

Set.prototype.log = function () {
    var set = this.contentSet;
    return set.log.apply(set, arguments);
};

