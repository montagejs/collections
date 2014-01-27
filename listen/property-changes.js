
var WeakMap = require("weak-map");
var ObservableObject = require("../observable-object");
var makePropertyObservable = ObservableObject.makePropertyObservable;
var observePropertyChange = ObservableObject.observePropertyChange;
var dispatchPropertyChange = ObservableObject.dispatchPropertyChange;

var object_owns = Object.prototype.hasOwnProperty;

module.exports = PropertyChanges;

var propertyChangeDescriptors = new WeakMap();

function PropertyChanges() {
    throw new Error("This is an abstract interface. Mix it. Don't construct it");
}

PropertyChanges.prototype.getOwnPropertyChangeDescriptor = function (name) {
    if (!propertyChangeDescriptors.has(this)) {
        propertyChangeDescriptors.set(this, {});
    }
    var objectPropertyChangeDescriptors = propertyChangeDescriptors.get(this);
    if (!object_owns.call(objectPropertyChangeDescriptors, name)) {
        objectPropertyChangeDescriptors[name] = {
            willChangeListeners: [],
            willChangeObservers: [],
            changeListeners: [],
            changeObservers: []
        };
    }
    return objectPropertyChangeDescriptors[name];
};

PropertyChanges.prototype.hasOwnPropertyChangeDescriptor = function (name) {
    if (!propertyChangeDescriptors.has(this)) {
        return false;
    }
    if (!name) {
        return true;
    }
    var objectPropertyChangeDescriptors = propertyChangeDescriptors.get(this);
    if (!object_owns.call(objectPropertyChangeDescriptors, name)) {
        return false;
    }
    return true;
};

PropertyChanges.prototype.addOwnPropertyChangeListener = function (name, listener, capture) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, name);

    var listeners, observers;
    if (capture) {
        listeners = descriptor.willChangeListeners;
        observers = descriptor.willChangeObservers;
    } else {
        listeners = descriptor.changeListeners;
        observers = descriptor.changeObservers;
    }

    var changeName = (capture ? "Will" : "") + "Change";
    var genericHandlerName = "handleProperty" + changeName;
    var propertyName = name;
    propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
    var specificHandlerName = "handle" + propertyName + changeName;
    var thisp = listener;

    var observer = observePropertyChange(this, name, function (plus, minus, name, object) {
        var value = capture ? minus : plus;
        listener = (
            listener[specificHandlerName] ||
            listener[genericHandlerName] ||
            listener
        );
        if (!listener.call) {
            throw new Error("No event listener for " + specificHandlerName + " or " + genericHandlerName + " or call on " + listener);
        }
        listener.call(thisp, value, name, this);
    }, capture);
    listeners.push(listener);
    observers.push(observer);

    var self = this;
    return function cancelOwnPropertyChangeListener() {
        PropertyChanges.removeOwnPropertyChangeListener(self, name, listeners, capture);
        self = null;
    };
};

PropertyChanges.prototype.addBeforeOwnPropertyChangeListener = function (name, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(this, name, listener, true);
};

PropertyChanges.prototype.removeOwnPropertyChangeListener = function (name, listener, capture) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, name);

    var listeners, observers;
    if (capture) {
        listeners = descriptor.willChangeListeners;
        observers = descriptor.willChangeObservers;
    } else {
        listeners = descriptor.changeListeners;
        observers = descriptor.changeObservers;
    }

    var index = listeners.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove listener: does not exist.");
    }
    var observer = observers[index];
    listeners.splice(index, 1);
    observers.splice(index, 1);

    observer.cancel();
};

PropertyChanges.prototype.removeBeforeOwnPropertyChangeListener = function (name, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(this, name, listener, true);
};

PropertyChanges.prototype.dispatchOwnPropertyChange = function (name, value, capture) {
    dispatchPropertyChange(this, name, value, this[name], capture);
};

PropertyChanges.prototype.dispatchBeforeOwnPropertyChange = function (name, listener) {
    return PropertyChanges.dispatchOwnPropertyChange(this, name, listener, true);
};

PropertyChanges.prototype.makePropertyObservable = function (name) {
    return makePropertyObservable(this, name);
};

PropertyChanges.prototype.makePropertyUnobservable  = function (name) {
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

PropertyChanges.addOwnPropertyChangeListener = function (object, key, listener, capture) {
    if (!Object.isObject(object)) {
    } else if (object.addOwnPropertyChangeListener) {
        return object.addOwnPropertyChangeListener(key, listener, capture);
    } else {
        return PropertyChanges.prototype.addOwnPropertyChangeListener.call(object, key, listener, capture);
    }
};

PropertyChanges.removeOwnPropertyChangeListener = function (object, key, listener, capture) {
    if (!Object.isObject(object)) {
    } else if (object.removeOwnPropertyChangeListener) {
        return object.removeOwnPropertyChangeListener(key, listener, capture);
    } else {
        return PropertyChanges.prototype.removeOwnPropertyChangeListener.call(object, key, listener, capture);
    }
};

PropertyChanges.dispatchOwnPropertyChange = function (object, key, value, capture) {
    if (!Object.isObject(object)) {
    } else if (object.dispatchOwnPropertyChange) {
        return object.dispatchOwnPropertyChange(key, value, capture);
    } else {
        return PropertyChanges.prototype.dispatchOwnPropertyChange.call(object, key, value, capture);
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

PropertyChanges.makePropertyUnobservable = function (object, key) {
    if (object.makePropertyUnobservable) {
        return object.makePropertyUnobservable(key);
    } else {
        return PropertyChanges.prototype.makePropertyUnobservable.call(object, key);
    }
};

