"use strict";

var Set = require("./fast-set");
var Reducible = require("./reducible");
var Operators = require("./operators");
var AbstractMap = require("./abstract-map");

module.exports = FastMap;

function FastMap(values, equals, hash, content) {
    if (!(this instanceof FastMap)) {
        return new FastMap(values, equals, hash);
    }
    equals = equals || Object.equals || Operators.equals;
    hash = hash || Object.hash || Operators.hash;
    content = content || Operators.getUndefined;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.contentSet = new Set(
        undefined,
        function (a, b) {
            return equals(a.key, b.key);
        },
        function (item) {
            return hash(item.key);
        }
    );
    this.addEach(values);
}

FastMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.content
    );
};

FastMap.prototype.addEach = AbstractMap.addEach;
FastMap.prototype.has = AbstractMap.has;
FastMap.prototype.get = AbstractMap.get;
FastMap.prototype.set = AbstractMap.set;
FastMap.prototype['delete'] = AbstractMap['delete'];
FastMap.prototype.clear = AbstractMap.clear;
FastMap.prototype.reduce = AbstractMap.reduce;
FastMap.prototype.keys = AbstractMap.keys;
FastMap.prototype.values = AbstractMap.values;
FastMap.prototype.items = AbstractMap.items;
FastMap.prototype.Item = AbstractMap.Item;

FastMap.prototype.forEach = Reducible.forEach;
FastMap.prototype.map = Reducible.map;
FastMap.prototype.toArray = Reducible.toArray;
FastMap.prototype.toObject = Reducible.toObject;
FastMap.prototype.filter = Reducible.filter;
FastMap.prototype.every = Reducible.every;
FastMap.prototype.some = Reducible.some;
FastMap.prototype.all = Reducible.all;
FastMap.prototype.any = Reducible.any;
FastMap.prototype.min = Reducible.min;
FastMap.prototype.max = Reducible.max;
FastMap.prototype.sum = Reducible.sum;
FastMap.prototype.average = Reducible.average;
FastMap.prototype.concat = Reducible.concat;
FastMap.prototype.flatten = Reducible.flatten;
FastMap.prototype.sorted = Reducible.sorted;
FastMap.prototype.zip = Reducible.zip;
FastMap.prototype.clone = Reducible.clone;

FastMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.contentSet.log(charmap, stringify);
};

FastMap.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
}

