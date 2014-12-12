"use strict";

var List = require("../list");

module.exports = MapChanges;
function MapChanges() {
    throw new Error("Can't construct. MapChanges is a mixin.");
}

/*
    Object map change descriptors carry information necessary for adding,
    removing, dispatching, and shorting events to listeners for map changes
    for a particular key on a particular object.  These descriptors are used
    here for shallow map changes.

    {
        willChangeListeners:Array(Function)
        changeListeners:Array(Function)
    }
*/

function TokenChangeDescriptor() {
	return this;
}

Object.defineProperties(TokenChangeDescriptor.prototype,{
    isActive: {
		value: false,
		writable: true
	},
    _changeListeners: {
		value: null,
		writable: true
	},
    changeListeners: {
		get: function() {
			return this._changeListeners || (this._changeListeners = []);
		}
	},
    _willChangeListeners: {
		value: null,
		writable: true
	},
    willChangeListeners: {
		get: function() {
			return this._willChangeListeners || (this._willChangeListeners = []);
		}
	}
});

MapChanges.prototype._mapChangeDescriptors = null;
MapChanges.prototype.getAllMapChangeDescriptors = function () {
    var mapChangeDescriptors = this._mapChangeDescriptors || (this._mapChangeDescriptors = Object.create(null));
    if (this.propertyIsEnumerable("_mapChangeDescriptors")) {
        Object.defineProperty(this, "_mapChangeDescriptors", {
            enumerable: false
        });
    }
    return mapChangeDescriptors;

};

MapChanges.prototype.getMapChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllMapChangeDescriptors();
    token = token || "";
    if (!(token in tokenChangeDescriptors)) {
        tokenChangeDescriptors[token] = new TokenChangeDescriptor();
    }
    return tokenChangeDescriptors[token];
};

MapChanges.prototype.addMapChangeListener = function (listener, token, beforeChange) {
    if (!this.isObservable && this.makeObservable) {
        // for Array
        this.makeObservable();
    }
    var descriptor = this.getMapChangeDescriptor(token);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    listeners.push(listener);
    Object.defineProperty(this, "dispatchesMapChanges", {
        value: true,
        writable: true,
        configurable: true,
        enumerable: false
    });

    var self = this;
    return function cancelMapChangeListener() {
        if (!self) {
            // TODO throw new Error("Can't remove map change listener again");
            return;
        }
        self.removeMapChangeListener(listener, token, beforeChange);
        self = null;
    };
};

MapChanges.prototype.removeMapChangeListener = function (listener, token, beforeChange) {
    var descriptor = this.getMapChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove map change listener: does not exist: token " + JSON.stringify(token));
    }
    listeners.splice(index, 1);
};

MapChanges.prototype.dispatchMapChange = function (key, value, beforeChange) {
    var descriptors = this.getAllMapChangeDescriptors(),
        changeName = "Map" + (beforeChange ? "WillChange" : "Change"),
        listeners, tokenName, i, token, descriptor;

    for (token in descriptors) {
		descriptor = descriptors[token];
        if (descriptor.isActive) {
            return;
        } else {
            descriptor.isActive = true;
        }

        if (beforeChange) {
            listeners = descriptor.willChangeListeners;
        } else {
            listeners = descriptor.changeListeners;
        }

        tokenName = "handle" + (
            token.slice(0, 1).toUpperCase() +
            token.slice(1)
        ) + changeName;

        try {
            // dispatch to each listener
            var listener;
            for(i=0;(listener = listeners[i]);i++) {
                if (listener[tokenName]) {
                    listener[tokenName](value, key, this);
                } else if (listener.call) {
                    listener.call(listener, value, key, this);
                } else {
                    throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                }
            }
        } finally {
            descriptor.isActive = false;
        }

    }
};

MapChanges.prototype.addBeforeMapChangeListener = function (listener, token) {
    return this.addMapChangeListener(listener, token, true);
};

MapChanges.prototype.removeBeforeMapChangeListener = function (listener, token) {
    return this.removeMapChangeListener(listener, token, true);
};

MapChanges.prototype.dispatchBeforeMapChange = function (key, value) {
    return this.dispatchMapChange(key, value, true);
};

