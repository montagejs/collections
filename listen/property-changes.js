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
var ChangeDescriptor = require("./change-descriptor"),
    ObjectChangeDescriptor = ChangeDescriptor.ObjectChangeDescriptor,
    ListenerGhost = ChangeDescriptor.ListenerGhost;


// objectHasOwnProperty.call(myObject, key) will be used instead of
// myObject.hasOwnProperty(key) to allow myObject have defined
// a own property called "hasOwnProperty".

var objectHasOwnProperty = Object.prototype.hasOwnProperty;

// Object property descriptors carry information necessary for adding,
// removing, dispatching, and shorting events to listeners for property changes
// for a particular key on a particular object.  These descriptors are used
// here for shallow property changes.  The current listeners are the ones
// modified by add and remove own property change listener methods.  During
// property change dispatch, we capture a snapshot of the current listeners in
// the active change listeners array.  The descriptor also keeps a memo of the
// corresponding handler method names.
//
// {
//     willChangeListeners:{current, active:Array<Function>, ...method names}
//     changeListeners:{current, active:Array<Function>, ...method names}
// }

// Maybe remove entries from this table if the corresponding object no longer
// has any property change listeners for any key.  However, the cost of
// book-keeping is probably not warranted since it would be rare for an
// observed object to no longer be observed unless it was about to be disposed
// of or reused as an observable.  The only benefit would be in avoiding bulk
// calls to dispatchOwnPropertyChange events on objects that have no listeners.

//  To observe shallow property changes for a particular key of a particular
//  object, we install a property descriptor on the object that overrides the previous
//  descriptor.  The overridden descriptors are stored in this weak map.  The
//  weak map associates an object with another object that maps property names
//  to property descriptors.
//
//  object.__overriddenPropertyDescriptors__[key]
//
//  We retain the old descriptor for various purposes.  For one, if the property
//  is no longer being observed by anyone, we revert the property descriptor to
//  the original.  For "value" descriptors, we store the actual value of the
//  descriptor on the overridden descriptor, so when the property is reverted, it
//  retains the most recently set value.  For "get" and "set" descriptors,
//  we observe then forward "get" and "set" operations to the original descriptor.

module.exports = PropertyChanges;

function PropertyChanges() {
    throw new Error("This is an abstract interface. Mix it. Don't construct it");
}

PropertyChanges.debug = true;

var ObjectsPropertyChangeListeners = new WeakMap();

PropertyChanges.prototype.getOwnPropertyChangeDescriptor = function (key) {
    var objectPropertyChangeDescriptors = ObjectsPropertyChangeListeners.get(this), keyChangeDescriptor;
    if (!objectPropertyChangeDescriptors) {
        objectPropertyChangeDescriptors = Object.create(null);
        ObjectsPropertyChangeListeners.set(this,objectPropertyChangeDescriptors);
    }
    if ( (keyChangeDescriptor = objectPropertyChangeDescriptors[key]) === void 0) {
        var propertyName = String(key);

        propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
        return objectPropertyChangeDescriptors[key] = new ObjectChangeDescriptor().initWithName(propertyName);
    }
    return keyChangeDescriptor;
};

PropertyChanges.prototype.hasOwnPropertyChangeDescriptor = function (key) {
    var objectPropertyChangeDescriptors = ObjectsPropertyChangeListeners.get(this);
    if (!objectPropertyChangeDescriptors) {
        return false;
    }
    if (!key) {
        return true;
    }
    if (objectPropertyChangeDescriptors[key] === void 0) {
        return false;
    }
    return true;
};

PropertyChanges.prototype.addOwnPropertyChangeListener = function (key, listener, beforeChange) {
    if (this.makeObservable && !this.isObservable) {
        this.makeObservable(); // particularly for observable arrays, for
        // their length property
    }
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    PropertyChanges.makePropertyObservable(this, key);
    listeners.current.push(listener);

    var self = this;
    return function cancelOwnPropertyChangeListener() {
        PropertyChanges.removeOwnPropertyChangeListener(self, key, listener, beforeChange);
        self = null;
    };
};

PropertyChanges.prototype.addBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.removeOwnPropertyChangeListener = function removeOwnPropertyChangeListener(key, listener, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);

    var listeners;
    if (beforeChange) {
        listeners = descriptor._willChangeListeners;
    } else {
        listeners = descriptor._changeListeners;
    }

    if(listeners) {
        var index = listeners.current.lastIndexOf(listener);
        if (index === -1) {
            throw new Error("Can't remove property change listener: does not exist: property name" + JSON.stringify(key));
        }
        if(descriptor.isActive) {
            listeners.ghostCount = listeners.ghostCount+1;
            listeners.current[index]=removeOwnPropertyChangeListener.ListenerGhost;
        }
        else {
            listeners.current.spliceOne(index, 1);
        }
    }
};
PropertyChanges.prototype.removeOwnPropertyChangeListener.ListenerGhost = ListenerGhost;

PropertyChanges.prototype.removeBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.dispatchOwnPropertyChange = function dispatchOwnPropertyChange(key, value, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key),
        listeners;

    if (!descriptor.isActive) {
        descriptor.isActive = true;
        listeners = beforeChange ? descriptor._willChangeListeners: descriptor._changeListeners;
        try {
            dispatchOwnPropertyChange.dispatchEach(listeners, key, value, this);
        } finally {
            descriptor.isActive = false;
        }
    }
};
PropertyChanges.prototype.dispatchOwnPropertyChange.dispatchEach = dispatchEach;

function dispatchEach(listeners, key, value, object) {
    if(listeners) {
        // copy snapshot of current listeners to active listeners
        var current,
            listener,
            i,
            countI,
            thisp,
            specificHandlerMethodName = listeners.specificHandlerMethodName,
            genericHandlerMethodName = listeners.genericHandlerMethodName,
            Ghost = ListenerGhost;

        //removeGostListenersIfNeeded returns listeners.current or a new filtered one when conditions are met
        current = listeners.removeCurrentGostListenersIfNeeded();
        //We use a for to guarantee we won't dispatch to listeners that would be added after we started
        for(i=0, countI = current.length;i<countI;i++) {
            if ((thisp = current[i]) !== Ghost) {
                //This is fixing the issue causing a regression in Montage's repetition
                listener = (
                    thisp[specificHandlerMethodName] ||
                    thisp[genericHandlerMethodName] ||
                    thisp
                );
                if (!listener.call) {
                    throw new Error("No event listener for " + listeners.specificHandlerName + " or " + listeners.genericHandlerName + " or call on " + listener);
                }
                listener.call(thisp, value, key, object);
            }
        }
    }
}

dispatchEach.ListenerGhost = ListenerGhost;


PropertyChanges.prototype.dispatchBeforeOwnPropertyChange = function (key, listener) {
    return PropertyChanges.dispatchOwnPropertyChange(this, key, listener, true);
};

var ObjectsOverriddenPropertyDescriptors = new WeakMap();
var Objects__state__ = new WeakMap();

PropertyChanges.prototype.makePropertyObservable = function (key) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.


    var overriddenPropertyDescriptors = ObjectsOverriddenPropertyDescriptors.get(this);

    // memoize overridden property descriptor table
    if (!overriddenPropertyDescriptors) {
        if (Array.isArray(this)) {
            return;
        }
        if (!Object.isExtensible(this)) {
            throw new Error("Can't make property " + JSON.stringify(key) + " observable on " + this + " because object is not extensible");
        }
        overriddenPropertyDescriptors = {};
        ObjectsOverriddenPropertyDescriptors.set(this,overriddenPropertyDescriptors);
    } else {
        if (overriddenPropertyDescriptors[key] !== void 0) {
            // if we have already recorded an overridden property descriptor,
            // we have already installed the observer, so short-here
            return;
        }
    }

    // var state = Objects__state__.get(this);
    // if (typeof state !== "object") {
    //     Objects__state__.set(this,(state = {}));
    // }
    // state[key] = this[key];



    // walk up the prototype chain to find a property descriptor for
    // the property name
    var overriddenDescriptor;
    var attached = this;
    do {
        overriddenDescriptor = Object.getOwnPropertyDescriptor(attached, key);
        if (overriddenDescriptor) {
            break;
        }
        attached = Object.getPrototypeOf(attached);
    } while (attached);
    // or default to an undefined value
    if (!overriddenDescriptor) {
        overriddenDescriptor = {
            value: void 0,
            enumerable: true,
            writable: true,
            configurable: true
        };
    } else {
        if (!overriddenDescriptor.configurable) {
            return;
        }
        if (!overriddenDescriptor.writable && !overriddenDescriptor.set) {
            return;
        }
    }

    // memoize the descriptor so we know not to install another layer,
    // and so we can reuse the overridden descriptor when uninstalling
    overriddenPropertyDescriptors[key] = overriddenDescriptor;


    // TODO reflect current value on a displayed property

    var propertyListener;
    // in both of these new descriptor variants, we reuse the overridden
    // descriptor to either store the current value or apply getters
    // and setters.  this is handy since we can reuse the overridden
    // descriptor if we uninstall the observer.  We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ('value' in overriddenDescriptor) {
        propertyListener = {
            get: function () {
                return overriddenDescriptor.value;
            },
            set: function dispatchingSetter(value) {
                var descriptor,
                    isActive,
                    overriddenDescriptor = dispatchingSetter.overriddenDescriptor;

                if (value !== overriddenDescriptor.value) {
                    descriptor = dispatchingSetter.descriptor;
                    if (!(isActive = descriptor.isActive)) {
                        descriptor.isActive = true;
                        try {
                            dispatchingSetter.dispatchEach(descriptor._willChangeListeners, key, overriddenDescriptor.value, this);
                        } finally {}
                    }
                    overriddenDescriptor.value = value;
                    if (!isActive) {
                        try {
                            dispatchingSetter.dispatchEach(descriptor._changeListeners, key, value, this);
                        } finally {
                            descriptor.isActive = false;
                        }
                    }
                }
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
        propertyListener.set.dispatchEach = dispatchEach;
        propertyListener.set.overriddenDescriptor = overriddenDescriptor;
        propertyListener.set.descriptor = ObjectsPropertyChangeListeners.get(this)[key];

    } else { // 'get' or 'set', but not necessarily both
        propertyListener = {
            get: overriddenDescriptor.get,
            set: function dispatchingSetter(value) {
                var formerValue = this[key],
                    descriptor,
                    isActive,
                    newValue;


                    if(arguments.length === 1) {
                        dispatchingSetter.overriddenSetter.call(this,value);
                    }
                    else if(arguments.length === 2) {
                        dispatchingSetter.overriddenSetter.call(this,value,arguments[1]);
                    }
                    else {
                        dispatchingSetter.overriddenSetter.apply(this, arguments);
                    }

                if ((newValue = this[key]) !== formerValue) {
                    descriptor = dispatchingSetter.descriptor;
                    if (!(isActive = descriptor.isActive)) {
                        descriptor.isActive = true;
                        try {
                            dispatchingSetter.dispatchEach(descriptor._willChangeListeners, key, formerValue, this);
                        } finally {}
                    }
                    if (!isActive) {
                        try {
                            dispatchingSetter.dispatchEach(descriptor._changeListeners, key, newValue, this);
                        } finally {
                            descriptor.isActive = false;
                        }
                    }
                }
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
        propertyListener.set.dispatchEach = dispatchEach;
        propertyListener.set.overriddenSetter = overriddenDescriptor.set;
        propertyListener.set.descriptor = ObjectsPropertyChangeListeners.get(this)[key];
    }

    Object.defineProperty(this, key, propertyListener);
};

// constructor functions

PropertyChanges.getOwnPropertyChangeDescriptor = function (object, key) {
    if (object.getOwnPropertyChangeDescriptor) {
        return object.getOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.getOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.hasOwnPropertyChangeDescriptor = function (object, key) {
    if (object.hasOwnPropertyChangeDescriptor) {
        return object.hasOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.hasOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.addOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.addOwnPropertyChangeListener) {
        return object.addOwnPropertyChangeListener(key, listener, beforeChange);
    } else {
        return PropertyChanges.prototype.addOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.removeOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.removeOwnPropertyChangeListener) {
        return object.removeOwnPropertyChangeListener(key, listener, beforeChange);
    } else {
        return PropertyChanges.prototype.removeOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.dispatchOwnPropertyChange = function (object, key, value, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.dispatchOwnPropertyChange) {
        return object.dispatchOwnPropertyChange(key, value, beforeChange);
    } else {
        return PropertyChanges.prototype.dispatchOwnPropertyChange.call(object, key, value, beforeChange);
    }
};

PropertyChanges.addBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.removeBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.dispatchBeforeOwnPropertyChange = function (object, key, value) {
    return PropertyChanges.dispatchOwnPropertyChange(object, key, value, true);
};

PropertyChanges.makePropertyObservable = function (object, key) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(key);
    } else {
        return PropertyChanges.prototype.makePropertyObservable.call(object, key);
    }
};
