"use strict";

var Shim = require("./shim");
var LruSet = require("./lru-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("./observable-object");

module.exports = LruMap;

function LruMap(values, maxLength, equals, hash, getDefault) {
    if (!(this instanceof LruMap)) {
        return new LruMap(values, maxLength, equals, hash, getDefault);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    getDefault = getDefault || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.store = new LruSet(
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

LruMap.LruMap = LruMap; // hack so require("lru-map").LruMap will work in MontageJS

Object.addEach(LruMap.prototype, GenericCollection.prototype);
Object.addEach(LruMap.prototype, GenericMap.prototype);
Object.addEach(LruMap.prototype, ObservableObject.prototype);

LruMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.maxLength,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

LruMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.store.log(charmap, stringify);
};

LruMap.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
};

LruMap.prototype.observeMapChange = function () {
    if (!this.dispatchesMapChanges) {
        // Detect LRU deletions in the LruSet and emit as MapChanges.
        // Array and Heap have no store.
        // Dict and FastMap define no listeners on their store.
        var self = this;
        this.store.observeRangeWillChange(function(plus, minus) {
            if (plus.length && minus.length) {  // LRU item pruned
                self.dispatchMapWillChange("delete", minus[0].key, undefined, minus[0].value);
            }
        });
        this.store.observeRangeChange(function(plus, minus) {
            if (plus.length && minus.length) {
                self.dispatchMapChange("delete", minus[0].key, undefined, minus[0].value);
            }
        });
    }
    return GenericMap.prototype.observeMapChange.apply(this, arguments);
};

