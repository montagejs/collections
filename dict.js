"use strict";

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var PropertyChanges = require("./listen/property-changes");

// Burgled from https://github.com/domenic/dict

module.exports = Dict;
function Dict(values, getDefault) {
    if (!(this instanceof Dict)) {
        return new Dict(values, getDefault);
    }
    getDefault = getDefault || Function.noop;
    this.getDefault = getDefault;
    this.store = Object.create(null);
    this.length = 0;
    this.addEach(values);
}

Dict.Dict = Dict; // hack so require("dict").Dict will work in MontageJS.

Object.addEach(Dict.prototype, GenericCollection.prototype);
Object.addEach(Dict.prototype, GenericMap.prototype);
Object.addEach(Dict.prototype, PropertyChanges.prototype);

Dict.prototype.constructClone = function (values) {
    return new this.constructor(values, this.getDefault);
};

Dict.prototype.assertString = function (key) {
    if (typeof key !== "string") {
        throw new TypeError("key must be a string but Got " + key);
    }
}

Object.defineProperty(Dict.prototype,Dict.prototype.mangledProtoKey,{writable:true});

Dict.prototype.get = function (key, defaultValue) {
    this.assertString(key);
    if (key === "__proto__") {
        if (this.hasOwnProperty("$__proto__")) {
            return this["$__proto__"];
        } else if (arguments.length > 1) {
            return defaultValue;
        } else {
            return this.getDefault(key);
        }
    }
    else {
        if (key in this.store) {
            return this.store[key];
        } else if (arguments.length > 1) {
            return defaultValue;
        } else {
            return this.getDefault(key);
        }
    }
};

Dict.prototype.set = function (key, value) {
    this.assertString(key);
    if (key === "__proto__") {
        if (this.hasOwnProperty("$__proto__")) { // update
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this["$__proto__"]);
            }
            this["$__proto__"] = value;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, value);
            }
            return false;
        } else { // create
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, undefined);
            }
            this.length++;
            this["$__proto__"] = value;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, value);
            }
            return true;
        }
    }
    else {
        if (key in this.store) { // update
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this.store[key]);
            }
            this.store[key] = value;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, value);
            }
            return false;
        } else { // create
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, undefined);
            }
            this.length++;
            this.store[key] = value;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, value);
            }
            return true;
        }
    }
};

Dict.prototype.has = function (key) {
    this.assertString(key);
    return (key === "__proto__") ? this.hasOwnProperty("$__proto__") : (key in this.store);
};

Dict.prototype["delete"] = function (key) {
    this.assertString(key);
    if (key === "__proto__") {
        if (this.hasOwnProperty("$__proto__")) {
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this["$__proto__"]);
            }
            delete this["$__proto__"];
            this.length--;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, undefined);
            }
            return true;
        }
        return false;
    }
    else {
        if (key in this.store) {
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this.store[key]);
            }
            delete this.store[key];
            this.length--;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, undefined);
            }
            return true;
        }
        return false;
    }
};

Dict.prototype.clear = function () {
    var key;
    delete this["$__proto__"];
    for (key in this.store) {
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, this.store[key]);
        }
        delete this.store[key];
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
    }
    this.length = 0;
};

Dict.prototype.reduce = function (callback, basis, thisp) {
    if(this.hasOwnProperty("$__proto__")) {
        basis = callback.call(thisp, basis, "$__proto__", "__proto__", this);
    }
    var store = this.store;
    for (var key in this.store) {
        basis = callback.call(thisp, basis, store[key], key, this);
    }
    return basis;
};

Dict.prototype.reduceRight = function (callback, basis, thisp) {
    var self = this;
    var store = this.store;
    basis = Object.keys(this.store).reduceRight(function (basis, key) {
        return callback.call(thisp, basis, store[key], key, self);
    }, basis);
    
    if(this.hasOwnProperty("$__proto__")) {
        return callback.call(thisp, basis, this["$__proto__"], "__proto__", self);
    }
    return basis;
};

Dict.prototype.one = function () {
    var key;
    for (key in this.store) {
        return this.store[key];
    }
    return this["$__proto__"];
};

Dict.prototype.toJSON = function () {
    return this.toObject();
};
