"use strict";

var ObservableMap = require("pop-observe/observable-map");
var ObservableObject = require("pop-observe/observable-object");
var Iterator = require("./iterator");
var equalsOperator = require("pop-equals");
var compareOperator = require("pop-compare");
var copy = require("./copy");

module.exports = GenericMap;
function GenericMap() {
    throw new Error("Can't construct. GenericMap is a mixin.");
}

copy(GenericMap.prototype, ObservableMap.prototype);
copy(GenericMap.prototype, ObservableObject.prototype);

// all of these methods depend on the constructor providing a `store` set

GenericMap.prototype.isMap = true;

GenericMap.prototype.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            // copy map-alikes
            if (values.isMap === true) {
                values.forEach(function (value, key) {
                    this.set(key, value);
                }, this);
            // iterate key value pairs of other iterables
            } else {
                values.forEach(function (pair) {
                    this.set(pair[0], pair[1]);
                }, this);
            }
        } else {
            // copy other objects as map-alikes
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
    }
    return this;
}

GenericMap.prototype.get = function (key, defaultValue) {
    var item = this.store.get(new this.Item(key));
    if (item) {
        return item.value;
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.getDefault(key);
    }
};

GenericMap.prototype.getDefault = function () {
};

GenericMap.prototype.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.store.get(item);
    var grew = false;
    if (found) { // update
        var from;
        if (this.dispatchesMapChanges) {
            from = found.value;
            this.dispatchMapWillChange("update", key, value, from);
        }
        found.value = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("update", key, value, from);
        }
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchMapWillChange("create", key, value);
        }
        if (this.store.add(item)) {
            this.length++;
            grew = true;
        }
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("create", key, value);
        }
    }
    return grew;
};

GenericMap.prototype.add = function (value, key) {
    return this.set(key, value);
};

GenericMap.prototype.has = function (key) {
    return this.store.has(new this.Item(key));
};

GenericMap.prototype['delete'] = function (key) {
    var item = new this.Item(key);
    if (this.store.has(item)) {
        var from;
        if (this.dispatchesMapChanges) {
            from = this.store.get(item).value;
            this.dispatchMapWillChange("delete", key, void 0, from);
        }
        this.store["delete"](item);
        this.length--;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("delete", key, void 0, from);
        }
        return true;
    }
    return false;
};

GenericMap.prototype.clear = function () {
    var from;
    if (this.dispatchesMapChanges) {
        this.forEach(function (value, key) {
            this.dispatchMapWillChange("delete", key, void 0, value);
        }, this);
        from = this.constructClone(this);
    }
    this.store.clear();
    this.length = 0;
    if (this.dispatchesMapChanges) {
        from.forEach(function (value, key) {
            this.dispatchMapChange("delete", key, void 0, value);
        }, this);
    }
};

GenericMap.prototype.iterate = function () {
    return new this.Iterator(this);
};

GenericMap.prototype.reduce = function (callback, basis, thisp) {
    return this.store.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.reduceRight = function (callback, basis, thisp) {
    return this.store.reduceRight(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.keys = function () {
    return this.map(function (value, key) {
        return key;
    });
};

GenericMap.prototype.values = function () {
    return this.map(identity);
};

GenericMap.prototype.entries = function () {
    return this.map(function (value, key) {
        return [key, value];
    });
};

GenericMap.prototype.equals = function (that, equals) {
    equals = equals || equalsOperator;
    if (this === that) {
        return true;
    } else if (that && typeof that.every === "function") {
        return that.length === this.length && that.every(function (value, key) {
            return equals(this.get(key), value);
        }, this);
    } else {
        var keys = Object.keys(that);
        return keys.length === this.length && Object.keys(that).every(function (key) {
            return equals(this.get(key), that[key]);
        }, this);
    }
};

GenericMap.prototype.Item = Item;
GenericMap.prototype.Iterator = GenericMapIterator;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

Item.prototype.equals = function (that) {
    return equalsOperator(this.key, that.key) && equalsOperator(this.value, that.value);
};

Item.prototype.compare = function (that) {
    return compareOperator(this.key, that.key);
};

function GenericMapIterator(map) {
    this.storeIterator = new Iterator(map.store);
}

GenericMapIterator.prototype = Object.create(Iterator.prototype);
GenericMapIterator.prototype.constructor = GenericMapIterator;

GenericMapIterator.prototype.next = function () {
    var iteration = this.storeIterator.next();
    if (iteration.done) {
        return iteration;
    } else {
        return new Iterator.Iteration(
            iteration.value.value,
            iteration.value.key
        );
    }
};

function identity(value) { return value; }
