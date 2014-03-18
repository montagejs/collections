
/*
 * Based in part on observable arrays from Motorola Mobility’s Montage
 * Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 * 3-Clause BSD License
 * https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

/**
 * This module is responsible for observing changes to owned properties of
 * objects and changes to the content of arrays caused by method calls. The
 * interface for observing array content changes establishes the methods
 * necessary for any collection with observable content.
 */

require("./shim");
var WeakMap = require("weak-map");

var observedLengthForObject = new WeakMap();

var ObservableObject = require("./observable-object");
var ObservableRange = require("./observable-range");
var ObservableMap = require("./observable-map");

var array_swap = Array.prototype.swap;
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;

var observableArrayProperties = {

    makeRangeChangesObservable: {
        value: Function.noop, // idempotent
        writable: true,
        configurable: true
    },

    makeMapChangesObservable: {
        value: function () {
            this.makeIndexObservable(Infinity);
        },
        writable: true,
        configurable: true
    },

    makePropertyObservable: {
        value: function (index) {
            // Is a valid array index:
            if (~~index === index && index >= 0) { // Note: NaN !== NaN, ~~"foo" !== "foo"
                this.makeIndexObservable(index);
            }
            // Does not call through to super because property dispatch on
            // Arrays is handled by the mutation methods, particularly swap,
            // not by property descriptor thunks.
        },
        writable: true,
        configurable: true
    },

    makeIndexObservable: {
        value: function (index) {
            var maxObservedIndex = observedLengthForObject.get(this) || 0;
            if (index >= maxObservedIndex) {
                observedLengthForObject.set(this, index + 1);
            }
        },
        writable: true,
        configurable: true
    },

    swap: {
        value: function swap(start, minusLength, plus) {
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
                for (var i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            if (start + minusLength > this.length) {
                // Truncate minus length if it extends beyond the length
                minusLength = this.length - start;
            } else if (minusLength < 0) {
                // It is the JavaScript way.
                minusLength = 0;
            }

            var minus;
            if (minusLength === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = Array.empty;
            } else {
                minus = array_slice.call(this, start, start + minusLength);
            }

            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);
            var observedLength = Math.min(longest, observedLengthForObject.get(this) || 0);

            // dispatch before change events
            if (diff) {
                this.dispatchPropertyWillChange("length", newLength, oldLength);
            }
            this.dispatchRangeWillChange(plus, minus, start);
            if (diff === 0) {
                // Substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        this.dispatchPropertyWillChange(i, plus[j], minus[j]);
                        this.dispatchMapWillChange("update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < plus.length) {
                            if (plus[j] !== this[i]) {
                                this.dispatchPropertyWillChange(i, plus[j], this[i]);
                                this.dispatchMapWillChange("update", i, plus[j], this[i]);
                            }
                        } else {
                            if (this[i - diff] !== this[i]) {
                                this.dispatchPropertyWillChange(i, this[i - diff], this[i]);
                                this.dispatchMapWillChange("update", i, this[i - diff], this[i]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < plus.length) {
                            if (plus[j] !== void 0) {
                                this.dispatchPropertyWillChange(i, plus[j]);
                            }
                            this.dispatchMapWillChange("create", i, plus[j]);
                        } else {
                            if (this[i - diff] !== void 0) {
                                this.dispatchPropertyWillChange(i, this[i - diff]);
                            }
                            this.dispatchMapWillChange("create", i, this[i - diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (this[i] !== void 0) {
                            this.dispatchPropertyWillChange(i, void 0, this[i]);
                        }
                        this.dispatchMapWillChange("delete", i, void 0, this[i]);
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            // actual work
            array_swap.call(this, start, minusLength, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        this.dispatchPropertyChange(i, plus[j], minus[j]);
                        this.dispatchMapChange("update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                this.dispatchPropertyChange(i, this[i], minus[j]);
                                this.dispatchMapChange("update", i, this[i], minus[j]);
                            }
                        } else {
                            if (this[i] !== this[i + diff]) {
                                this.dispatchPropertyChange(i, this[i], this[i + diff]);
                                this.dispatchMapChange("update", i, this[i], this[i + diff]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                this.dispatchPropertyChange(i, this[i], minus[j]);
                            }
                            this.dispatchMapChange("create", i, this[i], minus[j]);
                        } else {
                            if (this[i] !== this[i + diff]) {
                                this.dispatchPropertyChange(i, this[i], this[i + diff]);
                            }
                            this.dispatchMapChange("create", i, this[i], this[i + diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (j < minus.length) {
                            if (minus[j] !== void 0) {
                                this.dispatchPropertyChange(i, void 0, minus[j]);
                            }
                            this.dispatchMapChange("delete", i, void 0, minus[j]);
                        } else {
                            if (this[i + diff] !== void 0) {
                                this.dispatchPropertyChange(i, void 0, this[i + diff]);
                            }
                            this.dispatchMapChange("delete", i, void 0, this[i + diff]);
                        }
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            this.dispatchRangeChange(plus, minus, start);
            if (diff) {
                this.dispatchPropertyChange("length", newLength, oldLength);
            }
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, minusLength) {
            if (start > this.length) {
                start = this.length;
            }
            var result = this.slice(start, start + minusLength);
            this.swap.call(this, start, minusLength, array_slice.call(arguments, 2));
            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

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
            var sorted = this.constructClone(this);
            array_sort.apply(sorted, arguments);
            this.swap(0, this.length, sorted);
            return this;
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
            if (arguments.length === 1) {
                return this.splice(this.length, 0, arg);
            } else {
                var args = array_slice.call(arguments);
                return this.swap(this.length, 0, args);
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

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var array_makeObservable;
var observableArrayPrototype = Object.create(Array.prototype, observableArrayProperties);
if (protoIsSupported) {
    array_makeObservable = function () {
        this.__proto__ = observableArrayPrototype;
    };
} else {
    array_makeObservable = function () {
        Object.defineProperties(this, observableArrayProperties);
    };
}

defineEach(ObservableObject.prototype);
defineEach(ObservableRange.prototype);
defineEach(ObservableMap.prototype);

// Overrides ObservableRange
Object.defineProperty(Array.prototype, "makeRangeChangesObservable", {
    value: array_makeObservable,
    writable: true,
    configurable: true,
    enumerable: false
});

// Overrides ObservableMap
Object.defineProperty(Array.prototype, "makeMapChangesObservable", {
    value: function () {
        array_makeObservable.call(this);
        observableArrayPrototype.makeMapChangesObservable.call(this);
    },
    writable: true,
    configurable: true,
    enumerable: false
});

// Overrides ObservableObject
Object.defineProperty(Array.prototype, "makePropertyObservable", {
    value: function (name) {
        array_makeObservable.call(this);
        observableArrayPrototype.makePropertyObservable.call(this, name);
    },
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

