"use strict";

var WeakMap = require("../weak-map"),
    Map = require("../_map"),
    ChangeDescriptor = require("./change-descriptor"),
    ObjectChangeDescriptor = ChangeDescriptor.ObjectChangeDescriptor,
    ChangeListenersRecord = ChangeDescriptor.ChangeListenersRecord,
    ListenerGhost = ChangeDescriptor.ListenerGhost;

module.exports = MapChanges;
function MapChanges() {
    throw new Error("Can't construct. MapChanges is a mixin.");
}

var object_owns = Object.prototype.hasOwnProperty;

/*
    Object map change descriptors carry information necessary for adding,
    removing, dispatching, and shorting events to listeners for map changes
    for a particular key on a particular object.  These descriptors are used
    here for shallow map changes.

    {
        willChangeListeners:Array(Fgunction)
        changeListeners:Array(Function)
    }
*/

var mapChangeDescriptors = new WeakMap();

function MapChangeDescriptor(name) {
    this.name = name;
    this.isActive = false;
    this._willChangeListeners = null;
    this._changeListeners = null;
};

MapChangeDescriptor.prototype = new ObjectChangeDescriptor();
MapChangeDescriptor.prototype.constructor = MapChangeDescriptor;

MapChangeDescriptor.prototype.changeListenersRecordConstructor = MapChangeListenersRecord;
MapChangeDescriptor.prototype.willChangeListenersRecordConstructor = MapWillChangeListenersRecord;

var MapChangeListenersSpecificHandlerMethodName = new Map();

function MapChangeListenersRecord(name) {
    var specificHandlerMethodName = MapChangeListenersSpecificHandlerMethodName.get(name);
    if(!specificHandlerMethodName) {
        specificHandlerMethodName = "handle";
        specificHandlerMethodName += name.slice(0, 1).toUpperCase();
        specificHandlerMethodName += name.slice(1);
        specificHandlerMethodName += "MapChange";
        MapChangeListenersSpecificHandlerMethodName.set(name,specificHandlerMethodName);
    }
    this.specificHandlerMethodName = specificHandlerMethodName;
	return this;
}
MapChangeListenersRecord.prototype = new ChangeListenersRecord();
MapChangeListenersRecord.prototype.constructor = MapChangeListenersRecord;
MapChangeListenersRecord.prototype.genericHandlerMethodName = "handleMapChange";

var MapWillChangeListenersSpecificHandlerMethodName = new Map();

function MapWillChangeListenersRecord(name) {
    var specificHandlerMethodName = MapWillChangeListenersSpecificHandlerMethodName.get(name);
    if(!specificHandlerMethodName) {
        specificHandlerMethodName = "handle";
        specificHandlerMethodName += name.slice(0, 1).toUpperCase();
        specificHandlerMethodName += name.slice(1);
        specificHandlerMethodName += "MapWillChange";
        MapWillChangeListenersSpecificHandlerMethodName.set(name,specificHandlerMethodName);
    }
    this.specificHandlerMethodName = specificHandlerMethodName;
    return this;
}
MapWillChangeListenersRecord.prototype = new ChangeListenersRecord();
MapWillChangeListenersRecord.prototype.constructor = MapWillChangeListenersRecord;
MapWillChangeListenersRecord.prototype.genericHandlerMethodName = "handleMapWillChange";


MapChanges.prototype.getAllMapChangeDescriptors = function () {
    if (!mapChangeDescriptors.has(this)) {
        mapChangeDescriptors.set(this, new Map());
    }
    return mapChangeDescriptors.get(this);
};

MapChanges.prototype.getMapChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllMapChangeDescriptors();
    token = token || "";
    if (!tokenChangeDescriptors.has(token)) {
        tokenChangeDescriptors.set(token, new MapChangeDescriptor(token));
    }
    return tokenChangeDescriptors.get(token);
};

var ObjectsDispatchesMapChanges = new WeakMap(),
    dispatchesMapChangesGetter = function() {
        return ObjectsDispatchesMapChanges.get(this);
    },
    dispatchesMapChangesSetter = function(value) {
        return ObjectsDispatchesMapChanges.set(this,value);
    },
    dispatchesChangesMethodName = "dispatchesMapChanges",
    dispatchesChangesPropertyDescriptor = {
        get: dispatchesMapChangesGetter,
        set: dispatchesMapChangesSetter,
        configurable: true,
        enumerable: false
    };

MapChanges.prototype.addMapChangeListener = function addMapChangeListener(listener, token, beforeChange) {
    //console.log("this:",this," addMapChangeListener(",listener,",",token,",",beforeChange);

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

    // console.log("addMapChangeListener()",listener, token);
    //console.log("this:",this," addMapChangeListener()  listeners._current is ",listeners._current);

    if(!listeners._current) {
        listeners._current = listener;
    }
    else if(!Array.isArray(listeners._current)) {
        listeners._current = [listeners._current,listener]
    }
    else {
        listeners._current.push(listener);
    }

    if(Object.getOwnPropertyDescriptor((this.__proto__||Object.getPrototypeOf(this)),dispatchesChangesMethodName) === void 0) {
        Object.defineProperty((this.__proto__||Object.getPrototypeOf(this)), dispatchesChangesMethodName, dispatchesChangesPropertyDescriptor);
    }
    this.dispatchesMapChanges = true;

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

    if(listeners._current) {
        if(listeners._current === listener) {
            listeners._current = null;
        }
        else {
            var index = listeners._current.lastIndexOf(listener);
            if (index === -1) {
                throw new Error("Can't remove map change listener: does not exist: token " + JSON.stringify(token));
            }
            else {
                if(descriptor.isActive) {
                    listeners.ghostCount = listeners.ghostCount+1
                    listeners._current[index]=ListenerGhost
                }
                else {
                    listeners._current.spliceOne(index);
                }
            }
        }
    }


};

MapChanges.prototype.dispatchMapChange = function (key, value, beforeChange) {
    var descriptors = this.getAllMapChangeDescriptors(),
        Ghost = ListenerGhost;

    descriptors.forEach(function (descriptor, token) {

        if (descriptor.isActive) {
            return;
        }

        var listeners = beforeChange ? descriptor.willChangeListeners : descriptor.changeListeners;
        if(listeners && listeners._current) {

            var tokenName = listeners.specificHandlerMethodName;
            if(Array.isArray(listeners._current) && listeners._current.length) {

                //removeGostListenersIfNeeded returns listeners.current or a new filtered one when conditions are met
                var currentListeners = listeners.removeCurrentGostListenersIfNeeded(),
                    i, countI, listener;
                descriptor.isActive = true;

                try {
                    for(i=0, countI = currentListeners.length;i<countI;i++) {
                        // dispatch to each listener
                        if ((listener = currentListeners[i]) !== Ghost) {
                            if (listener[tokenName]) {
                                listener[tokenName](value, key, this);
                            } else if (listener.call) {
                                listener.call(listener, value, key, this);
                            } else {
                                throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                            }
                        }
                    }
                } finally {
                    descriptor.isActive = false;
                }
            }
            else {
                descriptor.isActive = true;
                // dispatch each listener

                try {
                    listener = listeners._current;
                    if (listener[tokenName]) {
                        listener[tokenName](value, key, this);
                    } else if (listener.call) {
                        listener.call(listener, value, key, this);
                    } else {
                        throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                    }
                } finally {
                    descriptor.isActive = false;
                }

            }
        }

    }, this);
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
