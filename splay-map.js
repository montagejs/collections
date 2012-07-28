
var SplaySet = require("./splay-set");
var Iterable = require("./iterable");

module.exports = SplayMap;

function SplayMap(copy, equals, compare) {
    equals = equals || SplaySet.equals || Object.equals;
    compare = compare || SplaySet.compare || Object.compare;
    this.internal = new SplaySet(
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

SplayMap.prototype.get = function (key) {
    var item = this.internal.get(new Item(key));
    return item && item.value;
};

SplayMap.prototype.set = function (key, value) {
    var item = new Item(key, value);
    var found = this.internal.get(item);
    if (found) { // update
        found.value = value;
    } else { // create
        this.internal.add(item);
    }
};

SplayMap.prototype.has = function (key) {
    return this.internal.has(new Item(key));
};

SplayMap.prototype['delete'] = function (key) {
    this.internal['delete'](new Item(key));
};

SplayMap.prototype.reduce = function (callback, basis, thisp) {
    return this.internal.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

SplayMap.prototype.forEach = Iterable.forEach;
SplayMap.prototype.map = Iterable.map;
SplayMap.prototype.filter = Iterable.filter;
SplayMap.prototype.every = Iterable.every;
SplayMap.prototype.some = Iterable.some;
SplayMap.prototype.all = Iterable.all;
SplayMap.prototype.any = Iterable.any;
SplayMap.prototype.min = Iterable.min;
SplayMap.prototype.max = Iterable.max;
SplayMap.prototype.count = Iterable.count;
SplayMap.prototype.sum = Iterable.sum;
SplayMap.prototype.average = Iterable.average;
SplayMap.prototype.flatten = Iterable.flatten;

SplayMap.prototype.log = function (stringifyItem, charmap) {
    this.internal.log(null, function (item, leader) {
        return leader + ' ' + item.key + ': ' + item.value;
    });
};

function Item(key, value) {
    this.key = key;
    this.value = value;
}

