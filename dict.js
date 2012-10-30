"use strict";

require("./object");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");

// Burgled from https://github.com/domenic/dict

module.exports = Dict;
function Dict(values, content) {
    if (!(this instanceof Dict)) {
        return new Dict(values, content);
    }
    content = content || Function.noop;
    this.content = content;
    this.store = {};
    this.length = 0;
    this.addEach(values);
}

function mangle(key) {
    return "~" + key;
}

function unmangle(mangled) {
    return mangled.slice(1);
}

Object.addEach(Dict.prototype, GenericCollection);
Object.addEach(Dict.prototype, GenericMap);

Dict.prototype.constructClone = function (values) {
    return new this.constructor(values, this.mangle, this.content);
};

Dict.prototype.assertString = function (key) {
    if (typeof key !== "string") {
        throw new TypeError("key must be a string.");
    }
}

Dict.prototype.get = function (key, defaultValue) {
    this.assertString(key);
    var mangled = mangle(key);
    if (mangled in this.store) {
        return this.store[mangled];
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.content();
    }
};

Dict.prototype.set = function (key, value) {
    this.assertString(key);
    var mangled = mangle(key);
    if (!(mangled in this.store)) {
        this.length++;
        this.store[mangled] = value;
        return true;
    } else {
        this.store[mangled] = value;
        return false;
    }
};

Dict.prototype.has = function (key) {
    this.assertString(key);
    var mangled = mangle(key);
    return mangled in this.store;
};

Dict.prototype["delete"] = function (key) {
    this.assertString(key);
    var mangled = mangle(key);
    if (mangled in this.store) {
        delete this.store[mangle(key)];
        this.length--;
        return true;
    }
    return false;
};

Dict.prototype.clear = function () {
    for (var mangled in this.store) {
        delete this.store[mangled];
    }
    this.length = 0;
};

Dict.prototype.reduce = function (callback, basis, thisp) {
    for (var mangled in this.store) {
        basis = callback.call(thisp, basis, this.store[mangled], unmangle(mangled), this);
    }
    return basis;
};

