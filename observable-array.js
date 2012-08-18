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

require("./array");
require("./observable-object");
var WeakMap = require("./weak-map");

var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;

var contentChangeDescriptors = new WeakMap(); // {isActive, willChangeListeners, changeListeners}
var anyOwnPropertyChangeListeners = new WeakMap(); // {willChange, change}

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var array_makeObservable;
if (protoIsSupported) {
    array_makeObservable = function () {
        this.__proto__ = ObservableArray;
    };
} else {
    array_makeObservable = function () {
        Object.defineProperties(this, observableArrayProperties);
    };
}
Array.prototype.makeObservable = array_makeObservable;

Array.prototype.getContentChangeDescriptor = function () {
    if (!contentChangeDescriptors.has(this)) {
        contentChangeDescriptors.set(this, {
            isActive: false,
            changeListeners: [],
            willChangeListeners: []
        });
    }
    return contentChangeDescriptors.get(this);
};

Array.prototype.addContentChangeListener = function (listener, beforeChange) {
    if (!this.isObservable) {
        this.makeObservable();
    }

    var descriptor = this.getContentChangeDescriptor();

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // even if already registered
    listeners.push(listener);
};

Array.prototype.removeContentChangeListener = function (listener, beforeChange) {
    var descriptor = this.getContentChangeDescriptor();

    // before or after
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove listener: does not exist.");
    }

    listeners.splice(index, 1);
};

Array.prototype.dispatchContentChange = function (plus, minus, index, beforeChange) {
    var descriptor = this.getContentChangeDescriptor();

    if (descriptor.isActive) {
        return;
    } else {
        descriptor.isActive = true;
    }

    // before or after
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // dispatch each listener
    try {
        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            // support listener() and listener.handleContentChange() forms
            if (beforeChange) {
                listener = listener.handleContentWillChange || listener.handleEvent || listener;
            } else {
                listener = listener.handleContentChange || listener.handleEvent || listener;
            }
            if (listener.call) {
                listener.call(listener, plus, minus, index, beforeChange);
            }
        }
    } finally {
        descriptor.isActive = false;
    }
};

Array.prototype.addBeforeContentChangeListener = function (listener) {
    return this.addContentChangeListener(listener, true);
};

Array.prototype.removeBeforeContentChangeListener = function (listener) {
    return this.removeContentChangeListener(listener, true);
};

Array.prototype.dispatchBeforeContentChange = function (plus, minus, index) {
    return this.dispatchContentChange(plus, minus, index, true);
};

Array.prototype.addEachContentChangeListener = function (listener, before) {
    var self = this;

    // initialize
    for (var i = 0; i < this.length; i++) {
        Object.addOwnPropertyChangeListener(this, i, listener, before);
    }

    // before content changes, add listeners for the new properties
    var beforeContentChangeListener = function (plus, minus, index) {
        var diff = plus.length - minus.length;
        if (diff > 0) {
            for (var i = self.length; i < self.length + diff; i++) {
                Object.addOwnPropertyChangeListener(self, i, listener, before);
            }
        }
    };
    self.addBeforeContentChangeListener(beforeContentChangeListener);

    // after content changes, remove listeners for those properties
    var contentChangeListener = function (plus, minus, index) {
        var diff = plus.length - minus.length;
        if (diff < 0) {
            for (var i = self.length; i < self.length - diff; i++) {
                Object.removeOwnPropertyChangeListener(self, i, listener, before);
            }
        }
    };
    self.addContentChangeListener(contentChangeListener);

    // associate the given listener function with the produced
    // listener functions for change and willChange events so
    // they can be removed later
    anyOwnPropertyChangeListeners.set(listener, {
        willChange: beforeContentChangeListener,
        change: contentChangeListener
    });

};

Array.prototype.removeEachContentChangeListener = function (listener, before) {

    // remove the listeners for each property change
    for (var i = 0; i < this.length; i++) {
        Object.removeOwnPropertyChangeListener(this, i, listener, before);
    }

    // remove the manufactured listeners for content changes
    var listeners = anyOwnPropertyChangeListeners.get(listener);
    this.removeBeforeContentChangeListener(listeners.willChange);
    this.removeContentChangeListener(listeners.change);

};

Array.prototype.addBeforeEachContentChangeListener = function (listener) {
    return this.addEachContentChangeListener(listener, true);
};

Array.prototype.removeBeforeEachContentChangeListener = function (listener) {
    return this.removeEachContentChangeListener(listener, true);
};

var observableArrayProperties = {

    isObservable: {
        value: true,
        writable: true,
        configurable: true
    },

    makeObservable: {
        value: noop, // idempotent
        writable: true,
        configurable: true
    },

    reverse: {
        value: function reverse() {

            // dispatch before change events
            this.dispatchBeforeContentChange(this, this, 0);
            for (var i = 0; i < this.length; i++) {
                Object.dispatchBeforeOwnPropertyChange(this, i, this[i]);
            }

            // actual work
            array_reverse.call(this);

            // dispatch after change events
            for (var i = 0; i < this.length; i++) {
                Object.dispatchOwnPropertyChange(this, i, this[i]);
            }
            this.dispatchContentChange(this, this, 0);

            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {

            // dispatch before change events
            this.dispatchBeforeContentChange(this, this, 0);
            for (var i = 0; i < this.length; i++) {
                Object.dispatchBeforeOwnPropertyChange(this, i, this[i]);
            }

            // actual work
            array_sort.apply(this, arguments);

            // dispatch after change events
            for (var i = 0; i < this.length; i++) {
                Object.dispatchOwnPropertyChange(this, i, this[i]);
            }
            this.dispatchContentChange(this, this, 0);

            return this;
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, length) {
            var minus = array_slice.call(this, start, start + length);
            var plus = array_slice.call(arguments, 2);
            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = this.length + diff;
            var longest = Math.max(oldLength, newLength);

            // dispatch before change events
            if (diff) {
                Object.dispatchBeforeOwnPropertyChange(this, "length", this.length);
            }
            this.dispatchBeforeContentChange(plus, minus, start);
            if (diff === 0) { // substring replacement
                for (var i = start; i < start + plus.length; i++) {
                    Object.dispatchBeforeOwnPropertyChange(this, i, this[i]);
                }
            } else if (Object.hasOwnPropertyChangeDescriptor(this)) {
                // all subsequent values changed or shifted.
                // avoid (longest - start) long walks if there are no
                // registered descriptors.
                for (var i = start; i < longest; i++) {
                    Object.dispatchBeforeOwnPropertyChange(this, i, this[i]);
                }
            }

            // actual work
            var result = array_splice.apply(this, arguments);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start; i < start + plus.length; i++) {
                    Object.dispatchOwnPropertyChange(this, i, this[i]);
                }
            } else if (Object.hasOwnPropertyChangeDescriptor(this)) {
                // all subsequent values changed or shifted.
                // avoid (longest - start) long walks if there are no
                // registered descriptors.
                for (var i = start; i < longest; i++) {
                    Object.dispatchOwnPropertyChange(this, i, this[i]);
                }
            }
            // in addEachContentChange, the content change event may remove
            // some of the above dispatched listeners, so contentChange must
            // occur after ownPropertyChanges
            this.dispatchContentChange(plus, minus, start);
            if (diff) {
                Object.dispatchOwnPropertyChange(this, "length", this.length);
            }

            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    set: {
        value: function set(index, value) {
            this.splice(index, 1, value);
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

    wipe: {
        value: function wipe() {
            return this.splice(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var ObservableArray = Object.create(Array.prototype, observableArrayProperties);

function noop () {}

