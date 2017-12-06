"use strict";

var LfuSet = require("./lfu-set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("pop-observe/observable-object");
var equalsOperator = require("pop-equals");
var hashOperator = require("pop-hash");
var copy = require("./copy");

module.exports = LfuMap;

function LfuMap(values, maxLength, equals, hash, getDefault) {
    if (!(this instanceof LfuMap)) {
        return new LfuMap(values, maxLength, equals, hash, getDefault);
    }
    equals = equals || equalsOperator;
    hash = hash || hashOperator;
    getDefault = getDefault || this.getDefault;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.store = new LfuSet(
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

LfuMap.LfuMap = LfuMap; // hack for MontageJS

copy(LfuMap.prototype, GenericCollection.prototype);
copy(LfuMap.prototype, GenericMap.prototype);
copy(LfuMap.prototype, ObservableObject.prototype);

LfuMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.maxLength,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

LfuMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.store.log(charmap, stringify);
};

LfuMap.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
};

LfuMap.prototype.observeMapChange = function () {
    return GenericMap.prototype.observeMapChange.apply(this, arguments);
};

LfuMap.prototype.makeMapChangesObservable = function () {
    if (this.dispatchesMapChanges) {
        return;
    }
    // Detect LRU deletions in the LfuSet and emit as MapChanges.
    // Array and Heap have no store.
    // Dict and FastMap define no listeners on their store.
    this.store.observeRangeWillChange(this, "store");
    this.store.observeRangeChange(this, "store");
    this.dispatchMapChanges = true;
};

LfuMap.prototype.handleStoreRangeWillChange = function (plus, minus, index) {
    if (plus.length && minus.length) {  // LRU item pruned
        this.dispatchMapWillChange("delete", minus[0].key, undefined, minus[0].value);
    }
};

LfuMap.prototype.handleStoreRangeChange = function (plus, minus, index) {
    if (plus.length && minus.length) {
        this.dispatchMapChange("delete", minus[0].key, undefined, minus[0].value);
    }
};

