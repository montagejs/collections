
var LruSet = require("./lru-set");
var Reducible = require("./reducible");
var Operators = require("./operators");
var AbstractMap = require("./abstract-map");

module.exports = LruMap;

function LruMap(values, maxLength, equals, hash, content) {
    if (!(this instanceof LruMap)) {
        return new LruMap(values, maxLength, equals, hash);
    }
    equals = equals || Object.equals || Operators.equals;
    hash = hash || Object.hash || Operators.hash;
    content = content || Operators.getUndefined;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.contentSet = new LruSet(
        undefined,
        maxLength,
        function setContentEquals(a, b) {
            return equals(a.key, b.key);
        },
        function setContentHash(item) {
            return hash(item.key);
        }
    );
    this.addEach(values);
}

LruMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.maxLength,
        this.contentEquals,
        this.contentHash,
        this.content
    );
};

LruMap.prototype.addEach = AbstractMap.addEach;
LruMap.prototype.has = AbstractMap.has;
LruMap.prototype.get = AbstractMap.get;
LruMap.prototype.set = AbstractMap.set;
LruMap.prototype['delete'] = AbstractMap['delete'];
LruMap.prototype.wipe = AbstractMap.wipe;
LruMap.prototype.reduce = AbstractMap.reduce;
LruMap.prototype.keys = AbstractMap.keys;
LruMap.prototype.values = AbstractMap.values;
LruMap.prototype.items = AbstractMap.items;
LruMap.prototype.Item = AbstractMap.Item;

LruMap.prototype.forEach = Reducible.forEach;
LruMap.prototype.map = Reducible.map;
LruMap.prototype.toArray = Reducible.toArray;
LruMap.prototype.toObject = Reducible.toObject;
LruMap.prototype.filter = Reducible.filter;
LruMap.prototype.every = Reducible.every;
LruMap.prototype.some = Reducible.some;
LruMap.prototype.all = Reducible.all;
LruMap.prototype.any = Reducible.any;
LruMap.prototype.min = Reducible.min;
LruMap.prototype.max = Reducible.max;
LruMap.prototype.count = Reducible.count;
LruMap.prototype.sum = Reducible.sum;
LruMap.prototype.average = Reducible.average;
LruMap.prototype.concat = Reducible.concat;
LruMap.prototype.flatten = Reducible.flatten;
LruMap.prototype.sorted = Reducible.sorted;
LruMap.prototype.zip = Reducible.zip;
LruMap.prototype.clone = Reducible.clone;

LruMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.contentSet.log(charmap, stringify);
};

LruMap.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
}

