/*jshint node: true*/
/*global -WeakMap*/
"use strict";

// XXX Note: exceptions thrown from handlers and handler cancelers may
// interfere with dispatching to subsequent handlers of any change in progress.
// It is unlikely that plans are recoverable once an exception interferes with
// change dispatch. The internal records should not be corrupt, but observers
// might miss an intermediate property change.

require("./shim-array");
require("./shim-object");
var WeakMap = require("weak-map");

var observersByObject = new WeakMap();
var observerFreeList = [];
var observerToFreeList = [];
var superObjectDescriptors = new WeakMap();
var dispatching = false;

exports.observePropertyChange = observePropertyChange;
function observePropertyChange(object, name, handler, note, capture) {
    makePropertyObservable(object, name);
    var observers = getPropertyChangeObservers(object, name, capture);

    var observer;
    if (observerFreeList.length) {
        observer = observerFreeList.pop();
    } else {
        observer = new PropertyChangeObserver();
    }

    observer.object = object;
    observer.propertyName = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method names.

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var specificChangeMethodName = "handle" + propertyName + "PropertyChange";
        var genericChangeMethodName = "handlePropertyChange";
        if (handler[specificChangeMethodName]) {
            observer.handlerChangeMethodName = specificChangeMethodName;
        } else if (handler[genericChangeMethodName]) {
            observer.handlerChangeMethodName = genericChangeMethodName;
        } else if (handler.call) {
            observer.handlerChangeMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    } else {
        var specificWillChangeMethodName = "handle" + propertyName + "PropertyWillChange";
        var genericWillChangeMethodName = "handlePropertyWillChange";
        if (handler[specificWillChangeMethodName]) {
            observer.handlerChangeMethodName = specificWillChangeMethodName;
        } else if (handler[genericWillChangeMethodName]) {
            observer.handlerChangeMethodName = genericWillChangeMethodName;
        } else if (handler.call) {
            observer.handlerChangeMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    }

    observers.push(observer);

    // TODO issue warnings if the number of handler records exceeds some
    // concerning quantity as a harbinger of a memory leak.
    // TODO Note that if this is garbage collected without ever being called,
    // it probably indicates a programming error.
    return observer;
}

exports.observePropertyWillChange = observePropertyWillChange;
function observePropertyWillChange(object, name, handler, note) {
    return observePropertyChange(object, name, handler, note, true);
}

exports.dispatchPropertyChange = dispatchPropertyChange;
function dispatchPropertyChange(object, name, plus, minus, capture) {
    if (!dispatching) {
        return startPropertyChangeDispatchContext(object, name, plus, minus, capture);
    }
    var observers = getPropertyChangeObservers(object, name, capture).slice();
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(plus, minus);
    }
}

exports.dispatchPropertyWillChange = dispatchPropertyWillChange;
function dispatchPropertyWillChange(object, name, plus, minus) {
    dispatchPropertyChange(object, name, plus, minus, true);
}

function startPropertyChangeDispatchContext(object, name, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchPropertyChange(object, name, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Property change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Property change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
}

exports.getPropertyChangeObservers = getPropertyChangeObservers;
function getPropertyChangeObservers(object, name, capture) {
    if (!observersByObject.has(object)) {
        observersByObject.set(object, Object.create(null));
    }
    var observersByKey = observersByObject.get(object);
    var phase = capture ? "WillChange" : "Change";
    var key = name + phase;
    if (!Object.owns(observersByKey, key)) {
        observersByKey[key] = [];
    }
    return observersByKey[key];
}

exports.getPropertyWillChangeObservers = getPropertyWillChangeObservers;
function getPropertyWillChangeObservers(object, name) {
    return getPropertyChangeObservers(object, name, true);
}

exports.PropertyChangeObserver = PropertyChangeObserver;
function PropertyChangeObserver() {
    this.initialize();
    // Object.seal(this); // Maybe one day, this won't deoptimize.
}

PropertyChangeObserver.prototype.initialize = function () {
    this.object = null;
    this.propertyName = null;
    // Peer observers, from which to pluck itself upon cancelation.
    this.observers = null;
    // On which to dispatch property change notifications.
    this.handler = null;
    // Precomputed handler method name for change dispatch
    this.handlerChangeMethodName = null;
    // Returned by the last property change notification, which must be
    // canceled before the next change notification, or when this observer is
    // finally canceled.
    this.childObserver = null;
    // For the discretionary use of the user, perhaps to track why this
    // observer has been created, or whether this observer should be
    // serialized.
    this.note = null;
    // Whether this observer dispatches before a change occurs, or after
    this.capture = null;
    // The last known value
    this.value = null;
};

PropertyChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.propertyName) + " on " + this.object +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.initialize();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

PropertyChangeObserver.prototype.dispatch = function (plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    // Retain the last seen value for debugging
    if (this.capture) {
        this.value = minus;
    } else {
        this.value = plus;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }
    var changeMethodName = this.handlerChangeMethodName;
    if (handler[changeMethodName]) {
        childObserver = handler[changeMethodName](plus, minus, this.propertyName, this.object);
    } else if (handler.call) {
        childObserver = handler.call(this, plus, minus, this.propertyName, this.object);
    } else {
        throw new Error(
            "Can't dispatch " + JSON.stringify(changeMethodName) + " property change on " + object
        );
    }
    this.childObserver = childObserver;
    return this;
};

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

    if (superObjectDescriptors.has(object)) {
        return;
    }

    superPropertyDescriptors = {};
    superObjectDescriptors.set(object, superPropertyDescriptors);
    var superPropertyDescriptors = superObjectDescriptors.get(object);

    if (Object.owns(superPropertyDescriptors, name)) {
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

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus, minus);

            superDescriptor.value = plus;
            state[name] = plus;

            // XXX plan interference hazard:
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

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus, minus);

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
            // TODO spec
            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus, minus);

            return plus;
        },
        enumerable: superDescriptor.enumerable,
        configurable: true
    };
}

