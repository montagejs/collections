
var Set = require("./set");
var Reducible = require("./reducible");
var Operators = require("./operators");
var AbstractMap = require("./abstract-map");

module.exports = Map;

function Map(values, equals, hash) {
    if (!(this instanceof Map)) {
        return new Map(values, equals, hash);
    }
    equals = equals || Object.equals || Operators.equals;
    hash = hash || Object.hash || Operators.hash;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.itemSet = new Set(
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

Map.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash
    );
};

Map.prototype.has = AbstractMap.has;
Map.prototype.get = AbstractMap.get;
Map.prototype.getDefault = AbstractMap.getDefault;
Map.prototype.set = AbstractMap.set;
Map.prototype.add = AbstractMap.add;
Map.prototype['delete'] = AbstractMap['delete'];
Map.prototype.wipe = AbstractMap.wipe;
Map.prototype.reduce = AbstractMap.reduce;
Map.prototype.keys = AbstractMap.keys;
Map.prototype.values = AbstractMap.values;
Map.prototype.items = AbstractMap.items;
Map.prototype.Item = AbstractMap.Item;

Map.prototype.addEach = Reducible.addEach;
Map.prototype.forEach = Reducible.forEach;
Map.prototype.map = Reducible.map;
Map.prototype.toArray = Reducible.toArray;
Map.prototype.toObject = Reducible.toObject;
Map.prototype.filter = Reducible.filter;
Map.prototype.every = Reducible.every;
Map.prototype.some = Reducible.some;
Map.prototype.all = Reducible.all;
Map.prototype.any = Reducible.any;
Map.prototype.min = Reducible.min;
Map.prototype.max = Reducible.max;
Map.prototype.count = Reducible.count;
Map.prototype.sum = Reducible.sum;
Map.prototype.average = Reducible.average;
Map.prototype.concat = Reducible.concat;
Map.prototype.flatten = Reducible.flatten;
Map.prototype.sorted = Reducible.sorted;
Map.prototype.zip = Reducible.zip;
Map.prototype.clone = Reducible.clone;

Map.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.itemSet.log(charmap, stringify);
};

Map.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
}

