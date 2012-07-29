
var SortedSet = require("./sorted-set");
var Reducible = require("./reducible");
var Operators = require("./operators");
var AbstractMap = require("./abstract-map");

module.exports = SortedMap;

function SortedMap(copy, equals, compare) {
    equals = equals || this.equals || Object.equals || Operators.equals;
    compare = compare || this.compare || Object.compare || Operators.compare;
    this.internal = new SortedSet(
        null,
        function (a, b) {
            return equals(a.key, b.key);
        },
        function (a, b) {
            return compare(a.key, b.key);
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

SortedMap.prototype.has = AbstractMap.has;
SortedMap.prototype.get = AbstractMap.get;
SortedMap.prototype.set = AbstractMap.set;
SortedMap.prototype['delete'] = AbstractMap['delete'];
SortedMap.prototype.reduce = AbstractMap.reduce;
SortedMap.prototype.keys = AbstractMap.keys;
SortedMap.prototype.values = AbstractMap.values;
SortedMap.prototype.items = AbstractMap.items;
SortedMap.prototype.Item = AbstractMap.Item;

SortedMap.prototype.forEach = Reducible.forEach;
SortedMap.prototype.map = Reducible.map;
SortedMap.prototype.toArray = Reducible.toArray;
SortedMap.prototype.filter = Reducible.filter;
SortedMap.prototype.every = Reducible.every;
SortedMap.prototype.some = Reducible.some;
SortedMap.prototype.all = Reducible.all;
SortedMap.prototype.any = Reducible.any;
SortedMap.prototype.min = Reducible.min;
SortedMap.prototype.max = Reducible.max;
SortedMap.prototype.count = Reducible.count;
SortedMap.prototype.sum = Reducible.sum;
SortedMap.prototype.average = Reducible.average;
SortedMap.prototype.flatten = Reducible.flatten;

SortedMap.prototype.log = function (charmap, stringifyItem) {
    stringifyItem = stringifyItem || this.stringifyItem;
    this.internal.log(charmap, stringifyItem);
};

SortedMap.prototype.stringifyItem = function (item, leader) {
    return leader + ' ' + item.key + ': ' + item.value;
};


