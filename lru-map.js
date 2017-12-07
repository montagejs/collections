"use strict";

var LruSet = require("./lru-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("./observable-object");
var equalsOperator = require("./operators/equals");
var hashOperator = require("./operators/hash");
var addEach = require("./operators/add-each");

module.exports = LruMap;

function LruMap(values, capacity, equals, hash, getDefault) {
    if (!(this instanceof LruMap)) {
        return new LruMap(values, capacity, equals, hash, getDefault);
    }
    equals = equals || equalsOperator;
    hash = hash || hashOperator;
    getDefault = getDefault || this.getDefault;
    this.capacity = capacity || Infinity;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.store = new LruSet(
        undefined,
        capacity,
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

LruMap.from = GenericCollection.from;

addEach(LruMap.prototype, GenericCollection.prototype);
addEach(LruMap.prototype, GenericMap.prototype);
addEach(LruMap.prototype, ObservableObject.prototype);

Object.defineProperty(LruMap.prototype,"size",GenericCollection._sizePropertyDescriptor);

LruMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.capacity,
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
        this.store.observeRangeWillChange(this, "store");
        this.store.observeRangeChange(this, "store");
    }
    return GenericMap.prototype.observeMapChange.apply(this, arguments);
};

LruMap.prototype.handleStoreRangeWillChange = function (plus, minus, index) {
    if (plus.length && minus.length) {  // LRU item pruned
        this.dispatchMapWillChange("delete", minus[0].key, undefined, minus[0].value);
    }
};

LruMap.prototype.handleStoreRangeChange = function (plus, minus, index) {
    if (plus.length && minus.length) {
        this.dispatchMapChange("delete", minus[0].key, undefined, minus[0].value);
    }
    MapChanges.prototype.addMapChangeListener.apply(this, arguments);
};
