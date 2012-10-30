"use strict";

require("./object");
var LruSet = require("./lru-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");

module.exports = LruMap;

function LruMap(values, maxLength, equals, hash, content) {
    if (!(this instanceof LruMap)) {
        return new LruMap(values, maxLength, equals, hash);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    content = content || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.contentSet = new LruSet(
        undefined,
        maxLength,
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

Object.addEach(LruMap.prototype, GenericCollection);
Object.addEach(LruMap.prototype, GenericMap);

LruMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.maxLength,
        this.contentEquals,
        this.contentHash,
        this.content
    );
};

LruMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.contentSet.log(charmap, stringify);
};

LruMap.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
}

