
var SortedSet = require("./sorted-set");
var Reducible = require("./reducible");
var Operators = require("./operators");

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

SortedMap.prototype.get = function (key) {
    var item = this.internal.get(new this.Item(key));
    return item && item.value;
};

SortedMap.prototype.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.internal.get(item);
    if (found) { // update
        found.value = value;
    } else { // create
        this.internal.add(item);
    }
};

SortedMap.prototype.has = function (key) {
    return this.internal.has(new this.Item(key));
};

SortedMap.prototype['delete'] = function (key) {
    this.internal['delete'](new this.Item(key));
};

SortedMap.prototype.reduce = function (callback, basis, thisp) {
    return this.internal.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

// TODO keys, values, items

SortedMap.prototype.forEach = Reducible.forEach;
SortedMap.prototype.map = Reducible.map;
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

SortedMap.prototype.keys = function () {
    return this.map(getKey);
};

function getKey(value, key) {
    return key;
}

SortedMap.prototype.values = function () {
    return this.map(getValue);
};

function getValue(value) {
    return value;
}

SortedMap.prototype.items = function () {
    return this.map(getItem);
};

function getItem(value, key) {
    return [key, value];
}

SortedMap.prototype.log = function (charmap, stringifyItem) {
    stringifyItem = stringifyItem || this.stringifyItem;
    this.internal.log(charmap, stringifyItem);
};

SortedMap.prototype.stringifyItem = function (item, leader) {
    return leader + ' ' + item.key + ': ' + item.value;
};

SortedMap.prototype.Item = Item;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

