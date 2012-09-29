
var List = require("./list");
var Reducible = require("./reducible");
var Observable = require("./observable");
var Operators = require("./operators");
var TreeLog = require("./tree-log");
var Iterator = require("./iterator");

var object_has = Object.prototype.hasOwnProperty;

module.exports = Set;

function Set(values, equals, hash) {
    if (!(this instanceof Set)) {
        return new Set(values, equals, hash);
    }
    equals = equals || Set.equals || Operators.equals;
    hash = hash || Set.hash || Operators.hash;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.buckets = {};
    this.length = 0;
    this.addEach(values);
}

Set.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.contentHash);
};

Set.prototype.Bucket = List;

Set.prototype.has = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    return object_has.call(buckets, hash) && buckets[hash].has(value);
};

Set.prototype.get = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (object_has.call(buckets, hash)) {
        return buckets[hash].get(value);
    }
    return this.getDefault(value);
};

Set.prototype.getDefault = function () {
};

Set.prototype['delete'] = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (object_has.call(buckets, hash)) {
        var bucket = buckets[hash];
        if (bucket["delete"](value)) {
            if (this.isObserved) {
                this.dispatchBeforeContentChange([], [value]);
            }
            this.length--;
            if (bucket.length === 0) {
                delete buckets[hash];
            }
            if (this.isObserved) {
                this.dispatchContentChange([], [value]);
            }
            return true;
        }
    }
    return false;
};

Set.prototype.wipe = function () {
    var buckets = this.buckets;
    for (var hash in buckets) {
        delete buckets[hash];
    }
    this.length = 0;
};

Set.prototype.add = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (!object_has.call(buckets, hash)) {
        buckets[hash] = new this.Bucket(null, this.contentEquals);
    }
    if (!buckets[hash].has(value)) {
        if (this.isObserved) {
            this.dispatchBeforeContentChange([value], []);
        }
        buckets[hash].add(value);
        this.length++;
        if (this.isObserved) {
            this.dispatchContentChange([value], []);
        }
    }
};

Set.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var buckets = this.buckets;
    return Object.keys(buckets).reduce(function (basis, hash) {
        var bucket = buckets[hash];
        return bucket.reduce(callback, basis, thisp);
    }, basis);
};

Set.prototype.addEach = Reducible.addEach;
Set.prototype.forEach = Reducible.forEach;
Set.prototype.map = Reducible.map;
Set.prototype.toArray = Reducible.toArray;
Set.prototype.filter = Reducible.filter;
Set.prototype.every = Reducible.every;
Set.prototype.some = Reducible.some;
Set.prototype.all = Reducible.all;
Set.prototype.any = Reducible.any;
Set.prototype.min = Reducible.min;
Set.prototype.max = Reducible.max;
Set.prototype.count = Reducible.count;
Set.prototype.sum = Reducible.sum;
Set.prototype.average = Reducible.average;
Set.prototype.concat = Reducible.concat;
Set.prototype.flatten = Reducible.flatten;
Set.prototype.zip = Reducible.zip;
Set.prototype.sorted = Reducible.sorted;
Set.prototype.clone = Reducible.clone;

Set.prototype.getContentChangeDescriptor = Observable.getContentChangeDescriptor;
Set.prototype.addContentChangeListener = Observable.addContentChangeListener;
Set.prototype.removeContentChangeListener = Observable.removeContentChangeListener;
Set.prototype.dispatchContentChange = Observable.dispatchContentChange;
Set.prototype.addBeforeContentChangeListener = Observable.addBeforeContentChangeListener;
Set.prototype.removeBeforeContentChangeListener = Observable.removeBeforeContentChangeListener;
Set.prototype.dispatchBeforeContentChange = Observable.dispatchBeforeContentChange;

Set.prototype.equals = function (that) {
    var self = this;
    return (
        Object(that) === that &&
        typeof that.reduce === "function" &&
        typeof that.length === "number" &&
        this.length === that.length &&
        that.reduce(function (equals, value) {
            return equals && self.has(value);
        }, true)
    );
};

// TODO compare, equals (order agnostic)

Set.prototype.iterate = function () {
    var buckets = this.buckets;
    var hashes = Object.keys(buckets);
    return Iterator.concat(hashes.map(function (hash) {
        return buckets[hash].iterate();
    }));
};

Set.prototype.log = function (charmap, stringify) {
    charmap = charmap || TreeLog.unicodeSharp;
    stringify = stringify || this.stringify;

    var buckets = this.buckets;
    var hashes = Object.keys(buckets);
    hashes.forEach(function (hash, index) {
        var branch;
        var leader;
        if (index === hashes.length - 1) {
            branch = charmap.fromAbove;
            leader = ' ';
        } else {
            branch = charmap.fromBoth;
            leader = charmap.strafe;
        }
        var bucket = buckets[hash];
        console.log(branch + charmap.through + charmap.branchDown + ' ' + hash);
        bucket.forEach(function (value, node) {
            var branch;
            if (node === bucket.head.prev) {
                branch = charmap.fromAbove;
            } else {
                branch = charmap.fromBoth;
            }
            console.log(stringify(
                value,
                leader + ' ' + branch + charmap.through + charmap.through + ' ',
                leader + '     '
            ));
        });
    });
};

Set.prototype.stringify = function (value, leader) {
    if (Object(value) === value) {
        return leader + JSON.stringify(value);
    } else {
        return leader + value;
    }
};

