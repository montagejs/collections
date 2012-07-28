
var SortedSet = require("./sorted-set");
var Iterable = require("./iterable");

module.exports = SortedMap;

function SortedMap(copy, equals, compare) {
    equals = equals || SortedSet.equals || Object.equals;
    compare = compare || SortedSet.compare || Object.compare;
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
    var item = this.internal.get(new this.constructor.Item(key));
    return item && item.value;
};

SortedMap.prototype.set = function (key, value) {
    var item = new this.constructor.Item(key, value);
    var found = this.internal.get(item);
    if (found) { // update
        found.value = value;
    } else { // create
        this.internal.add(item);
    }
};

SortedMap.prototype.has = function (key) {
    return this.internal.has(new this.constructor.Item(key));
};

SortedMap.prototype['delete'] = function (key) {
    this.internal['delete'](new this.constructor.Item(key));
};

SortedMap.prototype.reduce = function (callback, basis, thisp) {
    return this.internal.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

SortedMap.prototype.forEach = Iterable.forEach;
SortedMap.prototype.map = Iterable.map;
SortedMap.prototype.filter = Iterable.filter;
SortedMap.prototype.every = Iterable.every;
SortedMap.prototype.some = Iterable.some;
SortedMap.prototype.all = Iterable.all;
SortedMap.prototype.any = Iterable.any;
SortedMap.prototype.min = Iterable.min;
SortedMap.prototype.max = Iterable.max;
SortedMap.prototype.count = Iterable.count;
SortedMap.prototype.sum = Iterable.sum;
SortedMap.prototype.average = Iterable.average;
SortedMap.prototype.flatten = Iterable.flatten;

SortedMap.prototype.log = function (charmap, stringify) {
    // TODO use stringify
    this.internal.log(charmap, function (item, leader) {
        return leader + ' ' + item.key + ': ' + item.value;
    });
};

SortedMap.Item = Item;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

