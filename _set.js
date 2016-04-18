"use strict";

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var Set, GlobalSet, CollectionsSet;


if(global.Set !== void 0) {
    GlobalSet = module.exports = global.Set;
    GlobalSet.Set = GlobalSet; // hack so require("set").Set will work in MontageJS

    // use different strategies for making sets observable between Internet
    // Explorer and other browsers.
    var protoIsSupported = {}.__proto__ === Object.prototype,
        set_makeObservable;

    if (protoIsSupported) {
        set_makeObservable = function () {
            this.__proto__ = ChangeDispatchSet;
        };
    } else {
        set_makeObservable = function () {
            Object.defineProperties(this, observableSetProperties);
        };
    }

    Object.defineProperty(GlobalSet.prototype, "makeObservable", {
        value: set_makeObservable,
        writable: true,
        configurable: true,
        enumerable: false
    });

    GlobalSet.prototype.reduce = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        this.forEach(function(value) {
            basis = callback.call(thisp, basis, value, this);
        });
        return basis;
    };

    GlobalSet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        var setIterator = this.values();
        var size = this.size;
        var reverseOrder = new Array(this.size);
        var value, i = 0;
        while ((value = setIterator.next().value)) {
            reverseOrder[--size] = value;
        }
        while (i++ < size) {
            basis = callback.call(thisp, basis, value, this);
        }
        return basis;
    };

    GlobalSet.prototype.equals = function (that, equals) {
        var self = this;
        return (
            that && typeof that.reduce === "function" &&
            this.size === (that.size || that.length) &&
            that.reduce(function (equal, value) {
                return equal && self.has(value, equals);
            }, true)
        );
    };

    GlobalSet.prototype.constructClone = function (values) {
        return new this.constructor(values, this.contentEquals, this.contentHash, this.getDefault);
    };

    GlobalSet.prototype.toJSON = function () {
        return this.entriesArray();
    };

    GlobalSet.prototype.one = function () {
        if (this.size > 0) {
            return this.values().next().value;
        }
        return undefined;
    };

    GlobalSet.prototype.pop = function () {
        if (this.size) {
            var setIterator = this.values(), aValue, value;
            while(aValue = setIterator.next().value) {
                value = aValue;
            }
            this["delete"](value,this.size-1);
            return value;
        }
    };

    GlobalSet.prototype.shift = function () {
        if (this.size) {
            var firstValue = this.values().next().value;
            this["delete"](firstValue,0);
            return firstValue;
        }
    };

    //Backward compatibility:
    Object.defineProperty(GlobalSet.prototype,"length",{
        get: function() {
            return this.size;
        },
        enumerable: true,
        configurable:true
    });

    GlobalSet.from = function (value) {
        var result = (new this);
        result.addEach(value);
        return result;
    };


    var set_clear = GlobalSet.prototype.clear,
        set_add = GlobalSet.prototype.add,
        set_delete = GlobalSet.prototype.delete;

    var observableSetProperties = {
        "__dispatchValueArray": {
            value: void 0,
            writable: true,
            configurable: true
        },
        "_dispatchValueArray": {
            get: function() {
                return this.__dispatchValueArray || (this.__dispatchValueArray = []);
            }
        },
        "_dispatchEmptyArray": {
            value: []
        },
        clear : {
            value: function () {
                var clearing;
                if (this.dispatchesRangeChanges) {
                    clearing = this.toArray();
                    this.dispatchBeforeRangeChange(this._dispatchEmptyArray, clearing, 0);
                }

                set_clear.call(this);

                if (this.dispatchesRangeChanges) {
                    this.dispatchRangeChange(this._dispatchEmptyArray, clearing, 0);
                }
            },
            writable: true,
            configurable: true

        },
        add : {
            value: function (value) {
                if (!this.has(value)) {
                    var index = this.size;
                    this._dispatchValueArray[0] = value;
                    if (this.dispatchesRangeChanges) {
                        this.dispatchBeforeRangeChange(this._dispatchValueArray, this._dispatchEmptyArray, index);
                    }

                    set_add.call(this,value);

                    if (this.dispatchesRangeChanges) {
                        this.dispatchRangeChange(this._dispatchValueArray, this._dispatchEmptyArray, index);
                    }
                    return true;
                }
                return false;
            },
            writable: true,
            configurable: true
        },

        "delete": {
            value: function (value,index) {
                if (this.has(value)) {
                    if(index === undefined) {
                        var setIterator = this.values();
                        index = 0
                        while(setIterator.next().value !== value) {
                            index++;
                        }
                    }
                    this._dispatchValueArray[0] = value;
                    if (this.dispatchesRangeChanges) {
                        this.dispatchBeforeRangeChange(this._dispatchEmptyArray, this._dispatchValueArray, index);
                    }

                    set_delete.call(this,value);

                    if (this.dispatchesRangeChanges) {
                        this.dispatchRangeChange(this._dispatchEmptyArray, this._dispatchValueArray, index);
                    }
                    return true;
                }
                return false;
            }
        }
    };



    Object.addEach(GlobalSet.prototype, GenericCollection.prototype, false);
    Object.addEach(GlobalSet.prototype, GenericSet.prototype, false);

    var ChangeDispatchSet = Object.create(GlobalSet.prototype, observableSetProperties);
}

    var List = require("./_list");
    var FastSet = require("./fast-set");
    var Iterator = require("./iterator");

    CollectionsSet = function CollectionsSet(values, equals, hash, getDefault) {
        if (!(this instanceof CollectionsSet)) {
            return new CollectionsSet(values, equals, hash, getDefault);
        }
        equals = equals || Object.equals;
        hash = hash || Object.hash;
        getDefault = getDefault || Function.noop;
        this.contentEquals = equals;
        this.contentHash = hash;
        this.getDefault = getDefault;
        // a list of values in insertion order, used for all operations that depend
        // on iterating in insertion order
        this.order = new this.Order(undefined, equals);
        // a set of nodes from the order list, indexed by the corresponding value,
        // used for all operations that need to quickly seek  value in the list
        this.store = new this.Store(
            undefined,
            function (a, b) {
                return equals(a.value, b.value);
            },
            function (node) {
                return hash(node.value);
            }
        );
        this.length = 0;
        this.addEach(values);
    }

    CollectionsSet.Set = CollectionsSet; // hack so require("set").Set will work in MontageJS
    CollectionsSet.CollectionsSet = CollectionsSet;

    Object.addEach(CollectionsSet.prototype, GenericCollection.prototype);
    Object.addEach(CollectionsSet.prototype, GenericSet.prototype);

    CollectionsSet.from = GenericCollection.from;

    Object.defineProperty(CollectionsSet.prototype,"size",GenericCollection._sizePropertyDescriptor);

    //Overrides for consistency:
    // Set.prototype.forEach = GenericCollection.prototype.forEach;


    CollectionsSet.prototype.Order = List;
    CollectionsSet.prototype.Store = FastSet;

    CollectionsSet.prototype.constructClone = function (values) {
        return new this.constructor(values, this.contentEquals, this.contentHash, this.getDefault);
    };

    CollectionsSet.prototype.has = function (value) {
        var node = new this.order.Node(value);
        return this.store.has(node);
    };

    CollectionsSet.prototype.get = function (value, equals) {
        if (equals) {
            throw new Error("Set#get does not support second argument: equals");
        }
        var node = new this.order.Node(value);
        node = this.store.get(node);
        if (node) {
            return node.value;
        } else {
            return this.getDefault(value);
        }
    };

    CollectionsSet.prototype.add = function (value) {
        var node = new this.order.Node(value);
        if (!this.store.has(node)) {
            var index = this.length;
            this._dispatchValueArray[0] = value;
            if (this.dispatchesRangeChanges) {
                this.dispatchBeforeRangeChange(this._dispatchValueArray, this._dispatchEmptyArray, index);
            }
            this.order.add(value);
            node = this.order.head.prev;
            this.store.add(node);
            this.length++;
            if (this.dispatchesRangeChanges) {
                this.dispatchRangeChange(this._dispatchValueArray, this._dispatchEmptyArray, index);
            }
            return true;
        }
        return false;
    };

    CollectionsSet.prototype["delete"] = function (value, equals) {
        if (equals) {
            throw new Error("Set#delete does not support second argument: equals");
        }
        var node = new this.order.Node(value);
        if (this.store.has(node)) {
            node = this.store.get(node);
            this._dispatchValueArray[0] = value;
            if (this.dispatchesRangeChanges) {
                this.dispatchBeforeRangeChange(this._dispatchEmptyArray, this._dispatchValueArray, node.index);
            }
            this.store["delete"](node); // removes from the set
            this.order.splice(node, 1); // removes the node from the list
            this.length--;
            if (this.dispatchesRangeChanges) {
                this.dispatchRangeChange(this._dispatchEmptyArray, this._dispatchValueArray, node.index);
            }
            return true;
        }
        return false;
    };

    CollectionsSet.prototype.pop = function () {
        if (this.length) {
            var result = this.order.head.prev.value;
            this["delete"](result);
            return result;
        }
    };

    CollectionsSet.prototype.shift = function () {
        if (this.length) {
            var result = this.order.head.next.value;
            this["delete"](result);
            return result;
        }
    };

    CollectionsSet.prototype.one = function () {
        if (this.length > 0) {
            return this.store.one().value;
        }
    };

    Object.defineProperty(CollectionsSet.prototype,"__dispatchValueArray", {
        value: void 0,
        writable: true,
        configurable: true
    });

    Object.defineProperty(CollectionsSet.prototype,"_dispatchValueArray", {
        get: function() {
            return this.__dispatchValueArray || (this.__dispatchValueArray = []);
        },
        configurable: true
    });
    Object.defineProperty(CollectionsSet.prototype,"_dispatchEmptyArray", {
        value: []
    });

    CollectionsSet.prototype.clear = function () {
        var clearing;
        if (this.dispatchesRangeChanges) {
            clearing = this.toArray();
            this.dispatchBeforeRangeChange(this._dispatchEmptyArray, clearing, 0);
        }
        this.store.clear();
        this.order.clear();
        this.length = 0;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(this._dispatchEmptyArray, clearing, 0);
        }
    };

    CollectionsSet.prototype.reduce = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        var list = this.order;
        var index = 0;
        return list.reduce(function (basis, value) {
            return callback.call(thisp, basis, value, index++, this);
        }, basis, this);
    };

    CollectionsSet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        var list = this.order;
        var index = this.length - 1;
        return list.reduceRight(function (basis, value) {
            return callback.call(thisp, basis, value, index--, this);
        }, basis, this);
    };

    CollectionsSet.prototype.iterate = function () {
        return this.order.iterate();
    };

    CollectionsSet.prototype.values = function () {
        return new Iterator(this);
    };

    CollectionsSet.prototype.log = function () {
        var set = this.store;
        return set.log.apply(set, arguments);
    };

    CollectionsSet.prototype.makeObservable = function () {
        this.order.makeObservable();
    };


if(!GlobalSet) {
    module.exports = CollectionsSet;
}
else {
    GlobalSet.prototype.valuesArray = GenericSet.prototype.valuesArray;
    GlobalSet.prototype.entriesArray = GenericSet.prototype.entriesArray;
    module.exports = GlobalSet;
    GlobalSet.CollectionsSet = CollectionsSet;
}
