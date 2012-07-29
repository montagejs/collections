
var Set = require("./set");
var Reducible = require("./reducible");
var Operators = require("./operators");
var AbstractMap = require("./abstract-map");

module.exports = Map;

function Map(copy, equals, hash) {
    equals = equals || this.equals || Object.equals || Operators.equals;
    hash = hash || this.hash || Object.hash || Operators.hash;
    if (!(this instanceof Map)) {
        return new Map(reserved, options);
    }
    this.internal = new Set(
        undefined,
        function (a, b) {
            return equals(a.key, b.key);
        },
        function (item) {
            return hash(item.key);
        }
    );
    if (copy) {
        // use Object.forEach sham if available
        if (Object.forEach) {
            Object.forEach(copy, function (value, key) {
                this.set(key, value);
            }, this);
        } else {
            copy.forEach(function (value, key) {
                this.set(key, value);
            }, this);
        }
    }
}

Map.prototype.has = AbstractMap.has;
Map.prototype.get = AbstractMap.get;
Map.prototype.set = AbstractMap.set;
Map.prototype['delete'] = AbstractMap['delete'];
Map.prototype.reduce = AbstractMap.reduce;
Map.prototype.keys = AbstractMap.keys;
Map.prototype.values = AbstractMap.values;
Map.prototype.items = AbstractMap.items;
Map.prototype.Item = AbstractMap.Item;

Map.prototype.forEach = Reducible.forEach;
Map.prototype.map = Reducible.map;
Map.prototype.toArray = Reducible.toArray;
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
Map.prototype.flatten = Reducible.flatten;

Map.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.internal.log(charmap, stringify);
};

Map.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
}

