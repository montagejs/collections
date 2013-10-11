/*jshint node: true*/
/*global -WeakMap*/
"use strict";

require("./shim-object");
var WeakMap = require("weak-map");

var handlerRecordsByObject = new WeakMap();
var handlerRecordFreeList = [];
var superObjectDescriptors = new WeakMap();

/**
 */
exports.observeProperty = observeProperty;
function observeProperty(object, name, handler, note) {
    makePropertyObservable(object, name);
    var handlers = getPropertyChangeObservers(object, name);
    var handlerRecord;
    if (handlerRecordFreeList.length) {
        handlerRecord = handlerRecordFreeList.pop();
        handlerRecord.handler = handler;
        handlerRecord.note = note;
    } else {
        handlerRecord = {handler: handler, note: note, innerCancel: null};
    }
    handlers.push(handlerRecord);
    return function cancelPropertyObserver() {
        var index = handlers.indexOf(handlerRecord);
        if (index >= 0) {
            if (handlerRecord.innerCancel) {
                handlerRecord.innerCancel();
            }
            handlers.splice(index, 1);
            handlerRecord.handler = null;
            handlerRecord.note = null;
            handlerRecord.innerCancel = null;
            handlerRecordFreeList.push(handlerRecord);
        }
    };
}

/**
 */
exports.dispatchPropertyChange = dispatchPropertyChange;
function dispatchPropertyChange(object, name, plus, minus) {
    var specificHandlerMethodName = "handle" + name.slice(0, 1).toUpperCase() + name.slice(1) + "Change";
    var handlers = getPropertyChangeObservers(object, name);
    for (var index = 0; index < handlers.length; index++) {
        var handlerRecord = handlers[index];
        var handler = handlerRecord.handler;
        var cancel = handler.innerCancel;
        handler.innerCancel = null;
        if (cancel) {
            cancel();
        }
        if (handler[specificHandlerMethodName]) {
            cancel = handler[specificHandlerMethodName](name, plus, minus, object);
        } else if (handler.propertyChange) {
            cancel = handler.propertyChange(name, plus, minus, object);
        } else if (typeof handler === "function") {
            cancel = handler(name, plus, minus, object);
        } else {
            throw new Error(
                "Can't dispatch to " + JSON.stringify(specificHandlerMethodName) +
                " or handlePropertyChange " +
                " on " + object
            );
        }
        handler.innerCancel = cancel;
    }
}

/**
 */
exports.getPropertyChangeObservers = getPropertyChangeObservers;
function getPropertyChangeObservers(object, name) {
    if (!handlerRecordsByObject.has(object)) {
        handlerRecordsByObject.set(object, {});
    }
    var handlersByName = handlerRecordsByObject.get(object);
    if (!Object.owns(handlersByName, name)) {
        handlersByName[name] = [];
    }
    return handlersByName[name];
}

/**
 */
exports.makePropertyObservable = makePropertyObservable;
function makePropertyObservable(object, name) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(object)) {
        return;
    }

    if (!Object.isExtensible(object, name)) {
        return;
    }

    // memoize super property descriptor table
    if (!superObjectDescriptors.has(object)) {
        superPropertyDescriptors = {};
        superObjectDescriptors.set(object, superPropertyDescriptors);
    }
    var superPropertyDescriptors = superObjectDescriptors.get(object);

    if (Object.owns.call(superPropertyDescriptors, name)) {
        // if we have already recorded an super property descriptor,
        // we have already installed the observer, so short-here
        return;
    }

    var superDescriptor = getSuperPropertyDescriptor(object, name);

    if (!superDescriptor.configurable) {
        return;
    }

    // memoize the descriptor so we know not to install another layer.  we
    // could use it to uninstall the observer, but we do not to avoid GC
    // thrashing.
    superPropertyDescriptors[name] = superDescriptor;

    // give up *after* storing the super property descriptor so it
    // can be restored by uninstall.  Unwritable properties are
    // silently not overriden.  Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!superDescriptor.writable && !superDescriptor.set) {
        return;
    }

    // we put a __state__ property on every object where we're intercepting
    // changes, so that folks can easily see the present value in their
    // run-time inspector
    var state;
    if (typeof object.__state__ === "object") {
        state = object.__state__;
    } else {
        state = {};
        if (Object.isExtensible(object, "__state__")) {
            Object.defineProperty(object, "__state__", {
                value: state,
                writable: true,
                enumerable: false
            });
        }
    }
    state[name] = object[name];

    var thunk;
    // in both of these new descriptor variants, we reuse the super
    // descriptor to either store the current value or apply getters
    // and setters.  this is handy since we can reuse the super
    // descriptor if we uninstall the observer.  We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ('value' in superDescriptor) {
        thunk = makeValuePropertyThunk(name, state, superDescriptor);
    } else { // 'get' or 'set', but not necessarily both
        thunk = makeGetSetPropertyThunk(name, state, superDescriptor);
    }

    Object.defineProperty(object, name, thunk);
}

function getSuperPropertyDescriptor(object, name) {
    // walk up the prototype chain to find a property descriptor for
    // the property name
    var superDescriptor;
    var superObject = object;
    do {
        superDescriptor = Object.getOwnPropertyDescriptor(superObject, name);
        if (superDescriptor) {
            break;
        }
        superObject = Object.getPrototypeOf(superObject);
    } while (superObject);
    // or default to an undefined value
    return superDescriptor || {
        value: undefined,
        enumerable: true,
        writable: true,
        configurable: true
    };

}

function makeValuePropertyThunk(name, state, superDescriptor) {
    return {
        get: function () {
            return superDescriptor.value;
        },
        set: function (plus) {
            if (plus === superDescriptor.value) {
                return plus;
            }
            var minus = superDescriptor.value;
            superDescriptor.value = plus;
            state[name] = plus;
            dispatchPropertyChange(this, name, plus, minus);
            return plus;
        },
        enumerable: superDescriptor.enumerable,
        configurable: true
    };
}

function makeGetSetPropertyThunk(name, state, superDescriptor) {
    return {
        get: function () {
            if (superDescriptor.get) {
                return superDescriptor.get.apply(this, arguments);
            }
        },
        set: function (plus) {
            var minus;

            // get the actual former value if possible
            if (superDescriptor.get) {
                minus = superDescriptor.get.apply(this, arguments);
            }

            // call through to actual setter
            if (superDescriptor.set) {
                superDescriptor.set.apply(this, arguments);
            }

            // use getter, if possible, to discover whether the set
            // was successful
            if (superDescriptor.get) {
                plus = superDescriptor.get.apply(this, arguments);
                state[name] = plus;
            }

            // if it has not changed, suppress a notification
            if (plus === minus) {
                return plus;
            }

            // dispatch the new value: the given value if there is
            // no getter, or the actual value if there is one
            dispatchPropertyChange(this, name, plus, minus);

            return plus;
        },
        enumerable: superDescriptor.enumerable,
        configurable: true
    };
}

