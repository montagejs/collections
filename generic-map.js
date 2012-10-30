"use strict";

var GenericMap = exports;

// all of these methods depend on the constructor providing an `contentSet`

GenericMap.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            // copy map-alikes
            if (typeof values.keys === "function") {
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
}

GenericMap.get = function (key, defaultValue) {
    var item = this.contentSet.get(new this.Item(key));
    if (item) {
        return item.value;
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.content(key);
    }
};

GenericMap.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.contentSet.get(item);
    var grew = false;
    if (found) { // update
        found.value = value;
    } else { // create
        if (this.contentSet.add(item)) {
            this.length++;
            grew = true;
        }
    }
    return grew;
};

GenericMap.has = function (key) {
    return this.contentSet.has(new this.Item(key));
};

GenericMap['delete'] = function (key) {
    if (this.contentSet['delete'](new this.Item(key))) {
        this.length--;
        return true;
    }
    return false;
};

GenericMap.clear = function () {
    this.contentSet.clear();
    this.length = 0;
};

GenericMap.reduce = function (callback, basis, thisp) {
    return this.contentSet.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.reduceRight = function (callback, basis, thisp) {
    return this.contentSet.reduceRight(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.equals = function (that, equals) {
    equals = equals || Object.equals;
    if (this === that) {
        return true;
    } else if (Object.can(that, "every")) {
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

GenericMap.keys = function () {
    return this.map(getKey);
};

function getKey(value, key) {
    return key;
}

GenericMap.values = function () {
    return this.map(getValue);
};

function getValue(value) {
    return value;
}

GenericMap.items = function () {
    return this.map(getItem);
};

function getItem(value, key) {
    return [key, value];
}

GenericMap.Item = Item;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

