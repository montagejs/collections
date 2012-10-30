"use strict";

require("./object");
var Set = require("./fast-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");

module.exports = FastMap;

function FastMap(values, equals, hash, content) {
    if (!(this instanceof FastMap)) {
        return new FastMap(values, equals, hash);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    content = content || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.contentSet = new Set(
        undefined,
        function keysEqual(a, b) {
            return equals(a.key, b.key);
        },
        function keyHash(item) {
            return hash(item.key);
        }
    );
    this.length = 0;
    this.addEach(values);
}

Object.addEach(FastMap.prototype, GenericCollection);
Object.addEach(FastMap.prototype, GenericMap);

FastMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.content
    );
};

FastMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.contentSet.log(charmap, stringify);
};

FastMap.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
}

