
var SortedSet = require("./sorted-set");
var Reducible = require("./reducible");
var Operators = require("./operators");
var AbstractMap = require("./abstract-map");

module.exports = SortedMap;

function SortedMap(values, equals, compare) {
    equals = equals || Object.equals || Operators.equals;
    compare = compare || Object.compare || Operators.compare;
    this.contentEquals = equals;
    this.contentCompare = compare;
    this.internal = new SortedSet(
        null,
        function (a, b) {
            return equals(a.key, b.key);
        },
        function (a, b) {
            return compare(a.key, b.key);
        }
    );
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            values.forEach(this.add, this);
        } else {
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
    }
}

SortedMap.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.contentCompare);
};

SortedMap.prototype.has = AbstractMap.has;
SortedMap.prototype.get = AbstractMap.get;
SortedMap.prototype.getDefault = AbstractMap.getDefault;
SortedMap.prototype.set = AbstractMap.set;
SortedMap.prototype.add = AbstractMap.add;
SortedMap.prototype['delete'] = AbstractMap['delete'];
SortedMap.prototype.wipe = AbstractMap.wipe;
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
SortedMap.prototype.zip = Reducible.zip;
SortedMap.prototype.clone = Reducible.clone;

SortedMap.prototype.log = function (charmap, stringifyItem) {
    stringifyItem = stringifyItem || this.stringifyItem;
    this.internal.log(charmap, stringifyItem);
};

SortedMap.prototype.stringifyItem = function (item, leader) {
    return leader + ' ' + item.key + ': ' + item.value;
};


