"use strict";

var Set = require("./set");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var ObservableObject = require("./observable-object");
var equalsOperator = require("./operators/equals");
var hashOperator = require("./operators/hash");
var addEach = require("./operators/add-each");

module.exports = Map;

function Map(values, equals, hash, getDefault) {
    if (!(this instanceof Map)) {
        return new Map(values, equals, hash, getDefault);
    }
    equals = equals || equalsOperator;
    hash = hash || hashOperator;
    getDefault = getDefault || this.getDefault;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.store = new Set(
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

Map.Map = Map; // hack so require("map").Map will work in MontageJS

Map.from = GenericCollection.from;

addEach(Map.prototype, GenericCollection.prototype);
addEach(Map.prototype, GenericMap.prototype); // overrides GenericCollection
addEach(Map.prototype, ObservableObject.prototype);

Map.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

Map.prototype.equals = function (that, equals) {
    equals = equals || Object.equals;
    if (this === that) {
        return true;
    } else if (that && typeof that.every === "function") {
        return that.size === this.size && that.every(function (value, key) {
            return equals(this.get(key), value);
        }, this);
    } else {
        var keys = Object.keys(that);
        return keys.length === this.size && Object.keys(that).every(function (key) {
            return equals(this.get(key), that[key]);
        }, this);
    }
};

Map.prototype.log = function (charmap, logNode, callback, thisp) {
    logNode = logNode || this.logNode;
    this.store.log(charmap, function (node, log, logBefore) {
        logNode(node.value.value, log, logBefore);
    }, callback, thisp);
};

Map.prototype.logNode = function (node, log) {
    log(' key: ' + node.key);
    log(' value: ' + node.value);
};