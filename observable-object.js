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

var WeakMap = require("./weak-map");
var List = require("./list");

var object_owns = Object.prototype.hasOwnProperty;

/*
    Object property descriptors carry information necessary for adding,
    removing, dispatching, and shorting events to listeners for property changes
    for a particular key on a particular object.  These descriptors are used
    here for shallow property changes.

    {
        willChangeListeners:Array(Function)
        changeListeners:Array(Function)
    }
*/
var propertyChangeDescriptors = new WeakMap();

// Maybe remove entries from this table if the corresponding object no longer
// has any property change listeners for any key.  However, the cost of
// book-keeping is probably not warranted since it would be rare for an
// observed object to no longer be observed unless it was about to be disposed
// of or reused as an observable.  The only benefit would be in avoiding bulk
// calls to dispatchPropertyChange events on objects that have no listeners.

/*
    To observe shallow property changes for a particular key of a particular
    object, we install a property descriptor on the object that overrides the previous
    descriptor.  The overridden descriptors are stored in this weak map.  The
    weak map associates an object with another object that maps property names
    to property descriptors.

    overriddenObjectDescriptors.get(object)[key]

    We retain the old descriptor for various purposes.  For one, if the property
    is no longer being observed by anyone, we revert the property descriptor to
    the original.  For "value" descriptors, we store the actual value of the
    descriptor on the overridden descriptor, so when the property is reverted, it
    retains the most recently set value.  For "get" and "set" descriptors,
    we observe then forward "get" and "set" operations to the original descriptor.
*/
var overriddenObjectDescriptors = new WeakMap();

Object.getOwnPropertyChangeDescriptor = function (object, key) {
    if (!propertyChangeDescriptors.has(object)) {
        propertyChangeDescriptors.set(object, {});
    }
    var objectPropertyChangeDescriptors = propertyChangeDescriptors.get(object);
    if (!object_owns.call(objectPropertyChangeDescriptors, key)) {
        objectPropertyChangeDescriptors[key] = {
            willChangeListeners: new List(),
            changeListeners: new List()
        };
    }
    return objectPropertyChangeDescriptors[key];
};

Object.hasOwnPropertyChangeDescriptor = function (object, key) {
    if (!propertyChangeDescriptors.has(object)) {
        return false;
    }
    if (!key) {
        return true;
    }
    var objectPropertyChangeDescriptors = propertyChangeDescriptors.get(object);
    if (!object_owns.call(objectPropertyChangeDescriptors, key)) {
        return false;
    }
    return true;
};

Object.addOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (object.makeObservable && !object.isObservable) {
        object.makeObservable(); // particularly for observable arrays
    }
    var descriptor = Object.getOwnPropertyChangeDescriptor(object, key);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    Object.installPropertyObserver(object, key);
    listeners.push(listener);
};

Object.removeOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    var descriptor = Object.getOwnPropertyChangeDescriptor(object, key);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    var node = listeners.findLast(listener);
    if (!node) {
        throw new Error("Can't remove listener: does not exist.");
    }
    listeners.splice(node, 1);
};

Object.dispatchOwnPropertyChange = function (object, key, value, beforeChange) {
    var descriptor = Object.getOwnPropertyChangeDescriptor(object, key);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var changeName = (beforeChange ? "Will" : "") + "Change";
    var genericHandlerName = "handleOwnProperty" + changeName;
    var propertyName = String(key);
    propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
    var specificHandlerName = "handle" + propertyName + changeName;

    // dispatch to each listener
    listeners.forEach(function (listener) {
        listener = (
            listener[specificHandlerName] ||
            listener[genericHandlerName] ||
            listener.handleEvent ||
            listener
        );
        if (listener.call) {
            listener.call(listener, value, key, object);
        }
    });
};

Object.addBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return Object.addOwnPropertyChangeListener(object, key, listener, true);
};

Object.removeBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return Object.removeOwnPropertyChangeListener(object, key, listener, true);
};

Object.dispatchBeforeOwnPropertyChange = function (object, key, value) {
    return Object.dispatchOwnPropertyChange(object, key, value, true);
};

Object.installPropertyObserver = function (object, key) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (object instanceof Array) {
        return;
    }

    // memoize overridden property descriptor table
    if (!overriddenObjectDescriptors.has(object)) {
        overriddenPropertyDescriptors = {};
        overriddenObjectDescriptors.set(object, overriddenPropertyDescriptors);
    }
    var overriddenPropertyDescriptors = overriddenObjectDescriptors.get(object);

    if (object_owns.call(overriddenPropertyDescriptors, key)) {
        // if we have already recorded an overridden property descriptor,
        // we have already installed the observer, so short-here
        return;
    }

    // walk up the prototype chain to find a property descriptor for
    // the property name
    var overriddenDescriptor;
    var attached = object;
    var formerDescriptor = Object.getOwnPropertyDescriptor(attached, key);
    do {
        overriddenDescriptor = Object.getOwnPropertyDescriptor(attached, key);
        if (overriddenDescriptor) {
            break;
        }
        attached = Object.getPrototypeOf(attached);
    } while (attached);
    // or default to an undefined value
    overriddenDescriptor = overriddenDescriptor || {
        value: undefined,
        enumerable: true,
        writable: true,
        configurable: true
    };

    if (!overriddenDescriptor.configurable) {
        throw new Error("Can't observe non-configurable properties");
    }

    // memoize the descriptor so we know not to install another layer,
    // and so we can reuse the overridden descriptor when uninstalling
    overriddenPropertyDescriptors[key] = overriddenDescriptor;

    // give up *after* storing the overridden property descriptor so it
    // can be restored by uninstall.  Unwritable properties are
    // silently not overriden.  Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!overriddenDescriptor.writable && !overriddenDescriptor.set) {
        return;
    }

    var newDescriptor;
    // in both of these new descriptor variants, we reuse the overridden
    // descriptor to either store the current value or apply getters
    // and setters.  this is handy since we can reuse the overridden
    // descriptor if we uninstall the observer.  We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ('value' in overriddenDescriptor) {
        newDescriptor = {
            get: function () {
                return overriddenDescriptor.value
            },
            set: function (value) {
                if (value === overriddenDescriptor.value) {
                    return value;
                }
                Object.dispatchBeforeOwnPropertyChange(object, key, overriddenDescriptor.value);
                overriddenDescriptor.value = value;
                Object.dispatchOwnPropertyChange(object, key, value);
                return value;
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    } else { // 'get' or 'set', but not necessarily both
        newDescriptor = {
            get: function () {
                if (overriddenDescriptor.get) {
                    return overriddenDescriptor.get();
                }
            },
            set: function (value) {
                var formerValue;
                // get the actual former value if possible
                if (overriddenDescriptor.get) {
                    formerValue = overriddenDescriptor.get();
                }
                // if it has not changed, suppress a notification
                if (value === formerValue) {
                    return value;
                }
                Object.dispatchBeforeOwnPropertyChange(object, key, formerValue);
                // call through to actual setter
                if (overriddenDescriptor.set) {
                    overriddenDescriptor.set(value);
                }
                // use getter, if possible, to discover whether the set
                // was successful
                if (overriddenDescriptor.get) {
                    value = overriddenDescriptor.get();
                }
                // dispatch the new value: the given value if there is
                // no getter, or the actual value if there is one
                Object.dispatchOwnPropertyChange(object, key, value);
                return value;
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    }

    Object.defineProperty(object, key, newDescriptor);
};

Object.uninstallPropertyObserver = function (object, key) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (object instanceof Array) {
        return;
    }

    if (!overriddenObjectDescriptors.has(object)) {
        throw new Error("Can't uninstall observer on property");
    }
    var overriddenPropertyDescriptors = overriddenObjectDescriptors.get(object);

    if (!overriddenPropertyDescriptors[key]) {
        throw new Error("Can't uninstall observer on property");
    }

    var overriddenDescriptor = overriddenPropertyDescriptors[key];

    Object.defineProperty(object, key, overriddenDescriptor);
};

