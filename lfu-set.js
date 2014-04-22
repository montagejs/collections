"use strict";

// Based on http://dhruvbird.com/lfu.pdf

var Shim = require("./shim");
var Set = require("./set");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");

module.exports = LfuSet;

function LfuSet(values, capacity, equals, hash, getDefault) {
    if (!(this instanceof LfuSet)) {
        return new LfuSet(values, capacity, equals, hash, getDefault);
    }
    capacity = capacity || Infinity;
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    getDefault = getDefault || Function.noop;

    // TODO
    this.store = new Set(
        undefined,
        function valueEqual(a, b) {
            return equals(a.value, b.value);
        },
        function valueHash(node) {
            return hash(node.value);
        }
    );
    this.frequencyHead = new this.FrequencyNode(0);

    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.capacity = capacity;
    this.length = 0;
    this.addEach(values);
}

LfuSet.LfuSet = LfuSet; // hack so require("lfu-set").LfuSet will work in MontageJS

Object.addEach(LfuSet.prototype, GenericCollection.prototype);
Object.addEach(LfuSet.prototype, GenericSet.prototype);
Object.addEach(LfuSet.prototype, PropertyChanges.prototype);
Object.addEach(LfuSet.prototype, RangeChanges.prototype);

LfuSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.capacity,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

LfuSet.prototype.has = function (value) {
    return this.store.has(new this.Node(value));
};

LfuSet.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("LfuSet#get does not support second argument: equals");
    }

    var node = this.store.get(new this.Node(value));
    if (node !== undefined) {
        var freq = node.parent;
        var nextFreq = node.parent.next;
        if (nextFreq.value !== freq.value + 1) {
            nextFreq = new this.FrequencyNode(freq.value + 1, freq, nextFreq);
        }

        nextFreq.items.add(node);
        node.parent = nextFreq;
        freq.items["delete"](node);

        if (freq.items.length === 0) {
            freq.prev.next = freq.next;
            freq.next.prev = freq.prev;
        }

        return node.value;
    } else {
        return this.getDefault(value);
    }
};

LfuSet.prototype.add = function (value) {
    // if the value already exists, get it so that its frequency increases
    if (this.has(value)) {
        this.get(value);
        return false;
    }

    var plus = [], minus = [], leastFrequentNode, leastFrequent;
    if (this.capacity > 0) {
        plus.push(value);
        if (this.length + 1 > this.capacity) {
            leastFrequentNode = this.frequencyHead.next;
            leastFrequent = leastFrequentNode.items.order.head.next.value;
            minus.push(leastFrequent.value);
        }
        if (this.dispatchesRangeChanges) {
            this.dispatchBeforeRangeChange(plus, minus, 0);
        }

        // removal must happen before addition, otherwise we could remove
        // the value we are about to add
        if (minus.length > 0) {
            this.store["delete"](leastFrequent);
            leastFrequentNode.items["delete"](leastFrequent);
            // Don't remove the frequencyNode with value of 1, because we
            // are about to use it again in the addition.
            if (leastFrequentNode.value !== 1 && leastFrequentNode.items.length === 0) {
                this.frequencyHead.next = leastFrequentNode.next;
                leastFrequentNode.next.prev = this.frequencyHead;
            }
        }

        var node = new this.Node(value);
        var freq = this.frequencyHead.next;
        if (freq.value !== 1) {
            freq = new this.FrequencyNode(1, this.frequencyHead, freq);
        }
        this.store.add(node);
        freq.items.add(node);
        node.parent = freq;

        this.length = this.length + plus.length - minus.length;

        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(plus, minus, 0);
        }
    }

    // whether it grew
    return plus.length !== minus.length;
};

LfuSet.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("LfuSet#delete does not support second argument: equals");
    }

    var node = this.store.get(new this.Node(value));
    var found = !!node;
    if (found) {
        if (this.dispatchesRangeChanges) {
            this.dispatchBeforeRangeChange([], [value], 0);
        }
        var freq = node.parent;

        this.store["delete"](node);
        freq.items["delete"](node);
        if (freq.items.length === 0) {
            freq.prev.next = freq.next;
            freq.next.prev = freq.prev;
        }
        this.length--;

        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange([], [value], 0);
        }
    }

    return found;
};

LfuSet.prototype.one = function () {
    if (this.length > 0) {
        return this.frequencyHead.next.items.one().value;
    }
};

LfuSet.prototype.clear = function () {
    this.store.clear();
    this.frequencyHead.next = this.frequencyHead;
    this.length = 0;
};

LfuSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var index = 0;
    var freq = this.frequencyHead.next;

    while (freq.value !== 0) {
        var set = freq.items;
        basis = set.reduce(function (basis, node) {
            return callback.call(thisp, basis, node.value, index++, this);
        }, basis, this);

        freq = freq.next;
    }

    return basis;
};

LfuSet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var index = this.length - 1;
    var freq = this.frequencyHead.prev;

    while (freq.value !== 0) {
        var set = freq.items;
        basis = set.reduceRight(function (basis, node) {
            return callback.call(thisp, basis, node.value, index--, this);
        }, basis, this);

        freq = freq.prev;
    }

    return basis;
};

LfuSet.prototype.iterate = function () {
    return this.store.map(function (node) {
        return node.value;
    }).iterate();
};

LfuSet.prototype.Node = Node;

function Node(value, parent) {
    this.value = value;
    this.parent = parent;
}

LfuSet.prototype.FrequencyNode = FrequencyNode;

function FrequencyNode(value, prev, next) {
    this.value = value;
    this.items = new Set();
    this.prev = prev || this;
    this.next = next || this;
    if (prev) {
        prev.next = this;
    }
    if (next) {
        next.prev = this;
    }
}
