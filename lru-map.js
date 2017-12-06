"use strict";

var LruSet = require("./lru-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("pop-observe/observable-object");
var equalsOperator = require("pop-equals");
var hashOperator = require("pop-hash");
var copy = require("./copy");

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

LruMap.LruMap = LruMap; // hack for MontageJS

copy(LruMap.prototype, GenericCollection.prototype);
copy(LruMap.prototype, GenericMap.prototype);
copy(LruMap.prototype, ObservableObject.prototype);

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
};

