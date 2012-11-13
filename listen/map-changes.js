"use strict";

var WeakMap = require("../weak-map");
var List = require("../list");

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
        willChangeListeners:Array(Function)
        changeListeners:Array(Function)
    }
*/

MapChanges.prototype.getMapChangeDescriptor = function () {
    if (!this.mapChangeDescriptor) {
        this.mapChangeDescriptor = {
            willChangeListeners: new List(),
            changeListeners: new List()
        };
    }
    return this.mapChangeDescriptor;
};

MapChanges.prototype.addMapChangeListener = function (listener, beforeChange) {
    if (this.makeObservable && !this.dispatchMapChanges) {
        // for Array
        this.makeObservable();
    }
    var descriptor = this.getMapChangeDescriptor();
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    listeners.push(listener);
    this.dispatchesMapChanges = true;

    var self = this;
    return function cancelMapChangeListener() {
        self.removeMapChangeListener(listener, beforeChange);
        self = null;
    };
};

MapChanges.prototype.removeMapChangeListener = function (listener, beforeChange) {
    var descriptor = this.getMapChangeDescriptor();

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
    node["delete"]();
};

MapChanges.prototype.dispatchMapChange = function (key, value, beforeChange) {
    var descriptor = this.getMapChangeDescriptor();

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var changeName = (beforeChange ? "Will" : "") + "Change";
    var handlerName = "handleMap" + changeName;

    // dispatch to each listener
    listeners.forEach(function (listener) {
        var thisp = listener;
        listener = listener[handlerName] || listener;
        if (listener.call) {
            listener.call(thisp, value, key, this);
        }
    }, this);
};

MapChanges.prototype.addBeforeMapChangeListener = function (listener) {
    return this.addMapChangeListener(listener, true);
};

MapChanges.prototype.removeBeforeMapChangeListener = function (listener) {
    return this.removeMapChangeListener(listener, true);
};

MapChanges.prototype.dispatchBeforeMapChange = function (key, value) {
    return this.dispatchMapChange(key, value, true);
};

