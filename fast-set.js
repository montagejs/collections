"use strict";

require("./object");
var Dict = require("./dict");
var List = require("./list");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var Observable = require("./observable");
var TreeLog = require("./tree-log");
var Iterator = require("./iterator");

var object_has = Object.prototype.hasOwnProperty;

module.exports = FastSet;

function FastSet(values, equals, hash, content) {
    if (!(this instanceof FastSet)) {
        return new FastSet(values, equals, hash);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    content = content || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.content = content;
    this.buckets = new this.Buckets(null, this.Bucket);
    this.length = 0;
    this.addEach(values);
}

Object.addEach(FastSet.prototype, GenericCollection);
Object.addEach(FastSet.prototype, GenericSet);
Object.addEach(FastSet.prototype, Observable);

FastSet.prototype.Buckets = Dict;
FastSet.prototype.Bucket = List;

FastSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.content
    );
};

FastSet.prototype.has = function (value) {
    var hash = this.contentHash(value);
    return this.buckets.get(hash).has(value);
};

FastSet.prototype.get = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        return buckets.get(hash).get(value);
    } else {
        return this.content(value);
    }
};

FastSet.prototype['delete'] = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        var bucket = buckets.get(hash);
        if (bucket["delete"](value)) {
            if (this.isObserved) {
                this.dispatchBeforeContentChange([], [value]);
            }
            this.length--;
            if (bucket.length === 0) {
                buckets["delete"](hash);
            }
            if (this.isObserved) {
                this.dispatchContentChange([], [value]);
            }
            return true;
        }
    }
    return false;
};

FastSet.prototype.clear = function () {
    this.buckets.clear();
    this.length = 0;
};

FastSet.prototype.add = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (!buckets.has(hash)) {
        buckets.set(hash, new this.Bucket(null, this.contentEquals));
    }
    if (!buckets.get(hash).has(value)) {
        if (this.isObserved) {
            this.dispatchBeforeContentChange([value], []);
        }
        buckets.get(hash).add(value);
        this.length++;
        if (this.isObserved) {
            this.dispatchContentChange([value], []);
        }
        return true;
    }
    return false;
};

FastSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var buckets = this.buckets;
    return buckets.reduce(function (basis, bucket) {
        return bucket.reduce(function (basis, value) {
            return callback.call(thisp, basis, value, value, this);
        }, basis, this);
    }, basis, this);
};

FastSet.prototype.iterate = function () {
    var buckets = this.buckets;
    var hashes = buckets.keys();
    return Iterator.concat(hashes.map(function (hash) {
        return buckets.get(hash).iterate();
    }));
};

FastSet.prototype.log = function (charmap, logNode, callback, thisp) {
    charmap = charmap || TreeLog.unicodeSharp;
    logNode = logNode || this.logNode;
    if (!callback) {
        callback = console.log;
        thisp = console;
    }
    callback = callback.bind(thisp);

    var buckets = this.buckets;
    var hashes = buckets.keys();
    hashes.forEach(function (hash, index) {
        var branch;
        var leader;
        if (index === 0) {
            branch = charmap.branchDown;
            leader = charmap.strafe;
        } else if (index === hashes.length - 1) {
            branch = charmap.fromAbove;
            leader = ' ';
        } else {
            branch = charmap.fromBoth;
            leader = charmap.strafe;
        }
        var bucket = buckets.get(hash);
        callback.call(thisp, branch + charmap.through + charmap.branchDown + ' ' + hash);
        bucket.forEach(function (value, node) {
            var branch;
            if (node === bucket.head.prev) {
                branch = charmap.fromAbove;
            } else {
                branch = charmap.fromBoth;
            }
            logNode(
                value,
                function (line) {
                    callback.call(thisp, leader + ' ' + branch + charmap.through + charmap.through + ' ' + line);
                },
                function (line) {
                    callback.call(thisp, leader + '     ' + line);
                }
            );
        });
    });
};

FastSet.prototype.logNode = function (node, callback, thisp) {
    var value = node.value;
    if (Object(value) === value) {
        callback.call(thisp, JSON.stringify(value));
    } else {
        callback.call(thisp, value);
    }
};

