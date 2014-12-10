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
var PropertyChangesP = PropertyChanges.prototype;

function ObjectPropertyChangeDescriptor(propertyName) {
	this.propertyName = propertyName;
	return this;
}
Object.defineProperties(ObjectPropertyChangeDescriptor.prototype,{
	propertyName: {
		value:null,
		writable: true
	},
	_willChangeListeners: {
		value:null,
		writable: true
	},
	willChangeListeners: {
		get: function() {
			return this._willChangeListeners || (this._willChangeListeners = new WillChangeListenersRecord(this.propertyName));
		}
	},
	_changeListeners: {
		value:null,
		writable: true
	},
    changeListeners: {
		get: function() {
			return this._changeListeners || (this._changeListeners = new ChangeListenersRecord(this.propertyName));
		}
	}
});

function ChangeListenersRecord(propertyName) {
    this.specificHandlerMethodName = "handle" + propertyName + "Change";
	return this;
}

Object.defineProperties(ChangeListenersRecord.prototype,{
    _current: {
		value: null,
		writable: true
	},
	current: {
		get: function() {
			return this._current || (this._current = []);
		},
	},
    _active: {
		value: null,
		writable: true
	},
    active: {
		get: function() {
			return this._active || (this._active = []);
		}
	},
    genericHandlerMethodName: {
		value: "handlePropertyChange"
	}
});

function WillChangeListenersRecord(propertyName) {
    this.specificHandlerMethodName = "handle" + propertyName + "WillChange";
	return this;
}
WillChangeListenersRecord.prototype = new ChangeListenersRecord();
WillChangeListenersRecord.prototype.genericHandlerMethodName = "handlePropertyWillChange";



PropertyChanges.debug = true;

PropertyChangesP.__propertyChangeListeners__ = null;

PropertyChangesP.getOwnPropertyChangeDescriptor = function (key) {
    var objectPropertyChangeDescriptors = this.__propertyChangeListeners__ || (this.__propertyChangeListeners__ = Object.create(null));
    if (this.propertyIsEnumerable("__propertyChangeListeners__")) {
        Object.defineProperty(this, "__propertyChangeListeners__", {
            enumerable: false
        });
    }
    if (!(key in objectPropertyChangeDescriptors)) {
        var propertyName = String(key);
        propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
		objectPropertyChangeDescriptors[key] = new ObjectPropertyChangeDescriptor(propertyName);
    }
    return objectPropertyChangeDescriptors[key];
};

PropertyChangesP.hasOwnPropertyChangeDescriptor = function (key) {
    if (!this.__propertyChangeListeners__) {
        return false;
    }
    if (!key) {
        return true;
    }
    var objectPropertyChangeDescriptors = this.__propertyChangeListeners__;
    return key in objectPropertyChangeDescriptors;
};

PropertyChangesP.addOwnPropertyChangeListener = function (key, listener, beforeChange) {
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
        PropertyChanges.removeOwnPropertyChangeListener(self, key, listeners.current, beforeChange);
        self = null;
    };
};

PropertyChangesP.addBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChangesP.removeOwnPropertyChangeListener = function (key, listener, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.current.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove property change listener: does not exist: property name" + JSON.stringify(key));
    }
    listeners.current.splice(index, 1);
};

PropertyChangesP.removeBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChangesP.dispatchOwnPropertyChange = function (key, value, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);

    if (descriptor.isActive) {
        return;
    }
    descriptor.isActive = true;

    var listeners = beforeChange ? descriptor.willChangeListeners : descriptor.changeListeners;

	if(listeners.length === 0) return;

    try {
        // dispatch to each listener
        dispatchEach.call(this, listeners, key, value);
    } finally {
        descriptor.isActive = false;
    }
};

// Factored out of parent to avoid try/catch deoptimization
function dispatchEach(listeners, key, value) {
    // copy snapshot of current listeners to active listeners
     var active = listeners.active,
		current = listeners.current,
		length = active.length = current.length,
		index = 0,
		listener;

    while (index<length) {
        active[index] = current[index];
		index++;
    }
    for (index = 0, length = active.length; index < length; index++) {
        listener = active[index];
        if (current.indexOf(listener) < 0) {
			//This is fixing the issue causing a regression in Nook
            continue;
        }
        var thisp = listener;
        listener = (
            listener[listeners.specificHandlerMethodName] ||
            listener[listeners.genericHandlerMethodName] ||
            listener
        );
        if (!listener.call) {
            throw new Error("No event listener for " + listeners.specificHandlerName + " or " + listeners.genericHandlerName + " or call on " + listener);
        }
        listener.call(thisp, value, key, this);
    }

// WORKING
// dispatch to each listener
// listeners.current.slice().forEach(function (listener) {
//     if (listeners.current.indexOf(listener) < 0) {
//         return;
//     }
//     var thisp = listener;
//     listener = (
//         listener[listeners.specificHandlerMethodName] ||
//         listener[listeners.genericHandlerMethodName] ||
//         listener
//     );
//     if (!listener.call) {
//         throw new Error("No event listener for " + specificHandlerName + " or " + genericHandlerName + " or call on " + listener);
//     }
//     listener.call(thisp, value, key, this);
// }, this);


}

PropertyChangesP.dispatchBeforeOwnPropertyChange = function (key, listener) {
    return PropertyChanges.dispatchOwnPropertyChange(this, key, listener, true);
};

PropertyChangesP.__state__ = null;
PropertyChangesP.__overriddenPropertyDescriptors__ = null;
PropertyChangesP.makePropertyObservable = function (key) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
	//console.timeStamp("makePropertyObservable "+key);
	//if("__state__" in this && this.__state__ && key in this.__state__) return;
	
	//Benoit: What's the point of this?
	//if(this.__state__ && key in this.__state__) return;
	
    if (!Object.isExtensible(this, key)) {
        throw new Error("Can't make property " + JSON.stringify(key) + " observable on " + this + " because object is not extensible");
    }

    //var state;
	//var myPrototype;
    //
	//     if ( this.__state__ === null) {
	// 	state = this.__state__ = {};
	//     }
	// else if (typeof this.__state__ === "object") {
	//         state = this.__state__;
	//     } else {
	// 	myPrototype = Object.getPrototypeOf(this);
	//         if (Object.isExtensible(myPrototype, "__state__")) {
	//             Object.defineProperty(myPrototype, "__state__", {
	//                 value: null,
	//                 writable: true,
	//                 enumerable: false
	//             });
	//         }
	// 	state = this.__state__ = {};
	//         
	//     }
	
	//Benoit: What's the point of this?
	//state = this.__state__ || (this.__state__ = {});
	
	//Benoit: What's the point of this?
    //state[key] = this[key];

    // memoize overridden property descriptor table
		//     if (!this.__overriddenPropertyDescriptors__) {
		// if(typeof (myPrototype || (myPrototype = Object.getPrototypeOf(this)))["__overriddenPropertyDescriptors__"] === "undefined" ) {
		// 	        Object.defineProperty(myPrototype, "__overriddenPropertyDescriptors__", {
		// 	            value: null,
		// 	            enumerable: false,
		// 	            writable: true,
		// 	            configurable: true
		// 	        });
		// }
		// this.__overriddenPropertyDescriptors__ = {};
		//         
		//     }
    var overriddenPropertyDescriptors = this.__overriddenPropertyDescriptors__ || (this.__overriddenPropertyDescriptors__ = {});

    if (overriddenPropertyDescriptors.hasOwnProperty(key)) {
        // if we have already recorded an overridden property descriptor,
        // we have already installed the observer, so short-here
        return;
    }

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
    overriddenDescriptor = overriddenDescriptor || {
        value: undefined,
        enumerable: true,
        writable: true,
        configurable: true
    };

    if (!overriddenDescriptor.configurable) {
        return;
    }

    // memorize the descriptor so we know not to install another layer,
    // and so we can reuse the overridden descriptor when uninstalling
    overriddenPropertyDescriptors[key] = overriddenDescriptor;

    // give up *after* storing the overridden property descriptor so it
    // can be restored by uninstall.  Unwritable properties are
    // silently not overridden.  Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!overriddenDescriptor.writable && !overriddenDescriptor.set) {
        return;
    }

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
                return overriddenDescriptor.value
            },
            set: function (value) {
                if (value === overriddenDescriptor.value) {
                    return value;
                }
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, overriddenDescriptor.value);
                overriddenDescriptor.value = value;
				//Benoit: What's the point of this?
                //state[key] = value;
                PropertyChanges.dispatchOwnPropertyChange(this, key, value);
                return value;
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    } else { // 'get' or 'set', but not necessarily both
		var setter,
            getter = overriddenDescriptor.get ? function() {return overriddenDescriptor.get.apply(this, arguments);} : null;

        propertyListener = Object.create(null);

		propertyListener.enumerable = overriddenDescriptor.enumerable,
        propertyListener.configurable = true;
        				
		if(getter) {
			propertyListener.get = getter;
			setter = function (value) {
                var formerValue;

                // get the actual former value if possible
                formerValue = getter.apply(this, arguments);

                // call through to actual setter
                if (overriddenDescriptor.set) {
                    overriddenDescriptor.set.apply(this, arguments)
                }
                // use getter, if possible, to discover whether the set
                // was successful
                   value = getter.apply(this, arguments);
				//Benoit: What's the point of this?
                   //state[key] = value;

                // if it has not changed, suppress a notification
                if (value === formerValue) {
                    return value;
                }
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, formerValue);

                // dispatch the new value: the given value if there is
                // no getter, or the actual value if there is one
                PropertyChanges.dispatchOwnPropertyChange(this, key, value);
                return value;
            }
		}
		else {
			setter = function (value) {

                // call through to actual setter
                if (overriddenDescriptor.set) {
                    overriddenDescriptor.set.apply(this, arguments)
                }

                PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, null);

                // dispatch the new value: the given value if there is
                // no getter, or the actual value if there is one
                PropertyChanges.dispatchOwnPropertyChange(this, key, value);
                return value;
            }
		}	
					
        propertyListener = {
            get: function () {
                if (overriddenDescriptor.get) {
                    return overriddenDescriptor.get.apply(this, arguments);
                }
            },
            set: function (value) {
                var formerValue;

                // get the actual former value if possible
                if (overriddenDescriptor.get) {
                    formerValue = overriddenDescriptor.get.apply(this, arguments);
                }
                // call through to actual setter
                if (overriddenDescriptor.set) {
                    overriddenDescriptor.set.apply(this, arguments)
                }
                // use getter, if possible, to discover whether the set
                // was successful
                if (overriddenDescriptor.get) {
                    value = overriddenDescriptor.get.apply(this, arguments);
					//Benoit: What's the point of this?
                    //state[key] = value;
                }
                // if it has not changed, suppress a notification
                if (value === formerValue) {
                    return value;
                }
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, formerValue);

                // dispatch the new value: the given value if there is
                // no getter, or the actual value if there is one
                PropertyChanges.dispatchOwnPropertyChange(this, key, value);
                return value;
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    }

    Object.defineProperty(this, key, propertyListener);
};

// constructor functions
PropertyChanges.getOwnPropertyChangeDescriptor = function (object, key) {
    return object.getOwnPropertyChangeDescriptor ? object.getOwnPropertyChangeDescriptor(key) : PropertyChangesP.getOwnPropertyChangeDescriptor.call(object, key);
};

PropertyChanges.hasOwnPropertyChangeDescriptor = function (object, key) {
    return object.hasOwnPropertyChangeDescriptor ? object.hasOwnPropertyChangeDescriptor(key) : PropertyChangesP.hasOwnPropertyChangeDescriptor.call(object, key);
};

PropertyChanges.addOwnPropertyChangeListener = function (object, key, listener, beforeChange) {	
	if(Object(object) === object) {
		return object.addOwnPropertyChangeListener ? object.addOwnPropertyChangeListener(key, listener, beforeChange) : PropertyChangesP.addOwnPropertyChangeListener.call(object, key, listener, beforeChange);
	}
};

PropertyChanges.removeOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (Object.isObject(object)) {
		return object.removeOwnPropertyChangeListener ? object.removeOwnPropertyChangeListener(key, listener, beforeChange) : PropertyChangesP.removeOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    } 
};

PropertyChanges.dispatchOwnPropertyChange = function (object, key, value, beforeChange) {
    if (Object.isObject(object)) {
		return object.dispatchOwnPropertyChange ? object.dispatchOwnPropertyChange(key, value, beforeChange) : PropertyChangesP.dispatchOwnPropertyChange.call(object, key, value, beforeChange);
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
    return object.makePropertyObservable ? object.makePropertyObservable(key) : PropertyChangesP.makePropertyObservable.call(object, key);
};
