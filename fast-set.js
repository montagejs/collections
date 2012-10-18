
var List = require("./list");
var Reducible = require("./reducible");
var Observable = require("./observable");
var Operators = require("./operators");
var TreeLog = require("./tree-log");
var Iterator = require("./iterator");

var object_has = Object.prototype.hasOwnProperty;

module.exports = FastSet;

function FastSet(values, equals, hash, content) {
    if (!(this instanceof FastSet)) {
        return new FastSet(values, equals, hash);
    }
    equals = equals || Object.equals || Operators.equals;
    hash = hash || Object.hash || Operators.hash;
    content = content || Operators.getUndefined;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.buckets = {};
    this.length = 0;
    this.addEach(values);
}

FastSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.content
    );
};

FastSet.prototype.Bucket = List;

FastSet.prototype.has = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    return object_has.call(buckets, hash) && buckets[hash].has(value);
};

FastSet.prototype.get = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (object_has.call(buckets, hash)) {
        return buckets[hash].get(value);
    }
    return this.content(value);
};

FastSet.prototype['delete'] = function (value) {
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

FastSet.prototype.wipe = function () {
    var buckets = this.buckets;
    for (var hash in buckets) {
        delete buckets[hash];
    }
    this.length = 0;
};

FastSet.prototype.add = function (value) {
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

FastSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var buckets = this.buckets;
    return Object.keys(buckets).reduce(function (basis, hash) {
        var bucket = buckets[hash];
        return bucket.reduce(callback, basis, thisp);
    }, basis);
};

FastSet.prototype.addEach = Reducible.addEach;
FastSet.prototype.forEach = Reducible.forEach;
FastSet.prototype.map = Reducible.map;
FastSet.prototype.toArray = Reducible.toArray;
FastSet.prototype.filter = Reducible.filter;
FastSet.prototype.every = Reducible.every;
FastSet.prototype.some = Reducible.some;
FastSet.prototype.all = Reducible.all;
FastSet.prototype.any = Reducible.any;
FastSet.prototype.min = Reducible.min;
FastSet.prototype.max = Reducible.max;
FastSet.prototype.count = Reducible.count;
FastSet.prototype.sum = Reducible.sum;
FastSet.prototype.average = Reducible.average;
FastSet.prototype.concat = Reducible.concat;
FastSet.prototype.flatten = Reducible.flatten;
FastSet.prototype.zip = Reducible.zip;
FastSet.prototype.sorted = Reducible.sorted;
FastSet.prototype.clone = Reducible.clone;

FastSet.prototype.getContentChangeDescriptor = Observable.getContentChangeDescriptor;
FastSet.prototype.addContentChangeListener = Observable.addContentChangeListener;
FastSet.prototype.removeContentChangeListener = Observable.removeContentChangeListener;
FastSet.prototype.dispatchContentChange = Observable.dispatchContentChange;
FastSet.prototype.addBeforeContentChangeListener = Observable.addBeforeContentChangeListener;
FastSet.prototype.removeBeforeContentChangeListener = Observable.removeBeforeContentChangeListener;
FastSet.prototype.dispatchBeforeContentChange = Observable.dispatchBeforeContentChange;

FastSet.prototype.equals = function (that) {
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

FastSet.prototype.iterate = function () {
    var buckets = this.buckets;
    var hashes = Object.keys(buckets);
    return Iterator.concat(hashes.map(function (hash) {
        return buckets[hash].iterate();
    }));
};

FastSet.prototype.log = function (charmap, stringify) {
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

FastSet.prototype.stringify = function (value, leader) {
    if (Object(value) === value) {
        return leader + JSON.stringify(value);
    } else {
        return leader + value;
    }
};

