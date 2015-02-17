/*
 Based in part on observable arrays from Motorola Mobility’s Montage
 Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 3-Clause BSD License
 https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

/*
 This module is responsible for observing changes to owned properties of
 objects and changes to the content of arrays caused by method calls.
 The interface for observing array content changes establishes the methods
 necessary for any collection with observable content.
 */

require("../shim");
var List = require("../list");
var PropertyChanges = require("./property-changes");
var RangeChanges = require("./range-changes");
var MapChanges = require("./map-changes");
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;
var array_swap = Array.prototype.swap;
var array_push = Array.prototype.push;

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var array_makeObservable;
if (protoIsSupported) {
    array_makeObservable = function () {
        this.__proto__ = ChangeDispatchArray;
    };
} else {
    array_makeObservable = function () {
        Object.defineProperties(this, observableArrayProperties);
    };
}

Object.defineProperty(Array.prototype, "makeObservable", {
    value: array_makeObservable,
    writable: true,
    configurable: true,
    enumerable: false
});

function defineEach(prototype) {
    for (var name in prototype) {
        Object.defineProperty(Array.prototype, name, {
            value: prototype[name],
            writable: true,
            configurable: true,
            enumerable: false
        });
    }
}

defineEach(PropertyChanges.prototype);

//This is a no-op test in property-changes.js - PropertyChanges.prototype.makePropertyObservable, so might as well not pay the price every time....
Object.defineProperty(Array.prototype, "makePropertyObservable", {
    value: function(){},
    writable: true,
    configurable: true,
    enumerable: false
});

defineEach(RangeChanges.prototype);
defineEach(MapChanges.prototype);

var observableArrayProperties = {

    isObservable: {
        value: true,
        writable: true,
        configurable: true
    },

    makeObservable: {
        value: Function.noop, // idempotent
        writable: true,
        configurable: true
    },

    reverse: {
        value: function reverse() {

            var reversed = this.constructClone(this);
            reversed.reverse();
            this.swap(0, this.length, reversed);

            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {
            var index, length;
            // dispatch before change events
            this.dispatchBeforeRangeChange(this, this, 0);
            for (index = 0, length = this.length; index < length; index++) {
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, index, this[index]);
                this.dispatchBeforeMapChange(index, this[index]);
            }

            // actual work
            array_sort.apply(this, arguments);

            // dispatch after change events
            for (index = 0, length = this.length; index < length; index++) {
                PropertyChanges.dispatchOwnPropertyChange(this, index, this[index]);
                this.dispatchMapChange(index, this[index]);
            }
            this.dispatchRangeChange(this, this, 0);

            return this;
        },
        writable: true,
        configurable: true
    },

    _dispatchBeforeOwnPropertyChange: {
        value: function _dispatchBeforeOwnPropertyChange(start, length) {
            for (var i = start, countI = start+length; i < countI; i++) {
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, i, this[i]);
                this.dispatchBeforeMapChange(i, this[i]);
            }
        }
    },

    _dispatchOwnPropertyChange: {
        value: function _dispatchOwnPropertyChange(start, length) {
            for (var i = start, countI = start+length; i < countI; i++) {
                this.dispatchOwnPropertyChange(i, this[i]);
                this.dispatchMapChange(i, this[i]);
            }
        }
    },

    swap: {
        value: function swap(start, length, plus) {
            var hasOwnPropertyChangeDescriptor, i, j;
            if (plus) {
                if (!Array.isArray(plus)) {
                    plus = array_slice.call(plus);
                }
            } else {
                plus = Array.empty;
            }

            if (start < 0) {
                start = this.length + start;
            } else if (start > this.length) {
                var holes = start - this.length;
                var newPlus = Array(holes + plus.length);
                for (i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            var minus;
            if (length === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = Array.empty;
            } else {
                minus = array_slice.call(this, start, start + length);
            }
            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);

            // dispatch before change events
            if (diff) {
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, "length", this.length);
            }
            this.dispatchBeforeRangeChange(plus, minus, start);
            if (diff === 0) { // substring replacement
                this._dispatchBeforeOwnPropertyChange(start, plus.length);
            } else if ((hasOwnPropertyChangeDescriptor = PropertyChanges.hasOwnPropertyChangeDescriptor(this))) {
                // all subsequent values changed or shifted.
                // avoid (longest - start) long walks if there are no
                // registered descriptors.
                this._dispatchBeforeOwnPropertyChange(start, longest-start);
            }

            // actual work
            if (start > oldLength) {
                this.length = start;
            }
            var result = array_swap.call(this, start, length, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                this._dispatchOwnPropertyChange(start,plus.length);
            } else if (hasOwnPropertyChangeDescriptor) {
                // all subsequent values changed or shifted.
                // avoid (longest - start) long walks if there are no
                // registered descriptors.
                this._dispatchOwnPropertyChange(start,longest-start);
            }
            this.dispatchRangeChange(plus, minus, start);
            if (diff) {
                this.dispatchOwnPropertyChange("length", this.length);
            }

            return result;
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, length) {
            // start parameter should be min(start, this.length)
            // http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.12
            if (start > this.length) {
                start = this.length;
            }
            return this.swap.call(this, start, length, array_slice.call(arguments, 2));
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    set: {
        value: function set(index, value) {
            this.swap(index, index >= this.length ? 0 : 1, [value]);
            return true;
        },
        writable: true,
        configurable: true
    },

    shift: {
        value: function shift() {
            return this.splice(0, 1)[0];
        },
        writable: true,
        configurable: true
    },

    pop: {
        value: function pop() {
            if (this.length) {
                return this.splice(this.length - 1, 1)[0];
            }
        },
        writable: true,
        configurable: true
    },

    push: {
        value: function push(arg) {
            var start = this.length,
                addedCount = arguments.length,
                argArray,
                hasOwnPropertyChangeDescriptor;

            argArray = addedCount === 1 ? [arguments[0]] : Array.apply(null, arguments);

            if(addedCount > 0) {
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, "length", start);
                this.dispatchBeforeRangeChange(argArray, Array.empty, start);

                if(hasOwnPropertyChangeDescriptor = PropertyChanges.hasOwnPropertyChangeDescriptor(this)) {
                    this._dispatchBeforeOwnPropertyChange(start, addedCount);
                }
            }

            array_push.apply(this,arguments);

            if (addedCount > 0) {
                if (hasOwnPropertyChangeDescriptor) {
                    this._dispatchOwnPropertyChange(start,addedCount);
                }
                this.dispatchRangeChange(argArray,Array.empty, start);
                this.dispatchOwnPropertyChange("length", this.length);
            }

        },
        writable: true,
        configurable: true
    },

    unshift: {
        value: function unshift(arg) {
            if (arguments.length === 1) {
                return this.splice(0, 0, arg);
            } else {
                var args = array_slice.call(arguments);
                return this.swap(0, 0, args);
            }
        },
        writable: true,
        configurable: true
    },

    clear: {
        value: function clear() {
            return this.splice(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var ChangeDispatchArray = Object.create(Array.prototype, observableArrayProperties);
exports.observableArrayProperties = observableArrayProperties;

