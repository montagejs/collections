"use strict";

//TODO:
// Remove Dict and use native Map as much as possible here
//Use ObjectChangeDescriptor to avoid creating useless arrays and benefit from similar gains made in property-changes


var WeakMap = require("weak-map"),
    Dict = require("../dict"),
    ChangeDescriptor = require("./change-descriptor"),
    ObjectChangeDescriptor = ChangeDescriptor.ObjectChangeDescriptor,
    ChangeListenersRecord = ChangeDescriptor.ChangeListenersRecord,
    ListenerGhost = ChangeDescriptor.ListenerGhost;

if (typeof window !== "undefined") { // client-side
    Dict = window.Map || Dict;
}

var rangeChangeDescriptors = new WeakMap(); // {isActive, willChangeListeners, changeListeners}


//
function RangeChangeDescriptor() {}
RangeChangeDescriptor.prototype = new ObjectChangeDescriptor();
RangeChangeDescriptor.prototype.constructor = RangeChangeDescriptor;

RangeChangeDescriptor.prototype.changeListenersRecordConstructor = RangeChangeListenersRecord;
RangeChangeDescriptor.prototype.willChangeListenersRecordConstructor = RangeWillChangeListenersRecord;
Object.defineProperty(RangeChangeDescriptor.prototype,"active",{
    get: function() {
        return this._active || (this._active = this._current ? this._current.slice():[]);
    }
});



function RangeChangeListenersRecord() {}
RangeChangeListenersRecord.prototype = new ChangeListenersRecord();
RangeChangeListenersRecord.prototype.constructor = RangeChangeListenersRecord;
RangeChangeListenersRecord.prototype.initWithName = function(name) {
    this.specificHandlerMethodName = "handle";
    this.specificHandlerMethodName += name.slice(0, 1).toUpperCase();
    this.specificHandlerMethodName += name.slice(1);
    this.specificHandlerMethodName += "RangeChange";
	return this;
};


function RangeWillChangeListenersRecord() {}
RangeWillChangeListenersRecord.prototype = new ChangeListenersRecord();
RangeWillChangeListenersRecord.prototype.constructor = RangeWillChangeListenersRecord;
RangeWillChangeListenersRecord.prototype.initWithName = function(name) {
    this.specificHandlerMethodName = "handle";
    this.specificHandlerMethodName += name.slice(0, 1).toUpperCase();
    this.specificHandlerMethodName += name.slice(1);
    this.specificHandlerMethodName += "RangeWillChange";
	return this;
};


module.exports = RangeChanges;
function RangeChanges() {
    throw new Error("Can't construct. RangeChanges is a mixin.");
}

RangeChanges.prototype.getAllRangeChangeDescriptors = function () {
    if (!rangeChangeDescriptors.has(this)) {
        rangeChangeDescriptors.set(this, new Dict());
    }
    return rangeChangeDescriptors.get(this);
};

RangeChanges.prototype.getRangeChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllRangeChangeDescriptors();
    token = token || "";
    if (!tokenChangeDescriptors.has(token)) {
        // tokenChangeDescriptors.set(token, {
        //     isActive: false,
        //     changeListeners: [],
        //     willChangeListeners: []
        // });
        tokenChangeDescriptors.set(token, new RangeChangeDescriptor().initWithName(token));
    }
    return tokenChangeDescriptors.get(token);
};

var ObjectsDispatchesRangeChanges = new WeakMap(),
    dispatchesRangeChangesGetter = function() {
        return ObjectsDispatchesRangeChanges.get(this);
    },
    dispatchesRangeChangesSetter = function(value) {
        return ObjectsDispatchesRangeChanges.set(this,value);
    };

RangeChanges.prototype.addRangeChangeListener = function (listener, token, beforeChange) {
    // a concession for objects like Array that are not inherently observable
    if (!this.isObservable && this.makeObservable) {
        this.makeObservable();
    }

    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // even if already registered
    listeners.current.push(listener);
    if(Object.getOwnPropertyDescriptor(this.__proto__,"dispatchesRangeChanges") === void 0) {
        Object.defineProperty(this.__proto__, "dispatchesRangeChanges", {
            get: dispatchesRangeChangesGetter,
            set: dispatchesRangeChangesSetter,
            configurable: true,
            enumerable: false
        });
    }
    this.dispatchesRangeChanges = true;

    var self = this;
    return function cancelRangeChangeListener() {
        if (!self) {
            // TODO throw new Error("Range change listener " + JSON.stringify(token) + " has already been canceled");
            return;
        }
        self.removeRangeChangeListener(listener, token, beforeChange);
        self = null;
    };
};

RangeChanges.prototype.removeRangeChangeListener = function (listener, token, beforeChange) {
    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor._willChangeListeners;
    } else {
        listeners = descriptor._changeListeners;
    }

    var index = listeners.current.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove range change listener: does not exist: token " + JSON.stringify(token));
    }
    else {
        if(descriptor.isActive) {
            listeners.ghostCount = listeners.ghostCount+1
            listeners.current[index]=ListenerGhost
        }
        else {
            listeners.current.spliceOne(index, 1);
        }
    }
};

RangeChanges.prototype.dispatchRangeChange = function (plus, minus, index, beforeChange) {
    //console.groupTime("dispatchRangeChange");
    var descriptors = this.getAllRangeChangeDescriptors();
    descriptors.dispatchBeforeChange = beforeChange;
    descriptors.forEach(function (descriptor, token, descriptors) {

        if (descriptor.isActive) {
            return;
        }

        // before or after
        var listeners = descriptors.dispatchBeforeChange ? descriptor._willChangeListeners : descriptor._changeListeners;
        if(listeners && listeners.current && listeners.current.length) {
            var tokenName = listeners.specificHandlerMethodName;
            // notably, defaults to "handleRangeChange" or "handleRangeWillChange"
            // if token is "" (the default)

            descriptor.isActive = true;
            // dispatch each listener
            try {
                var i,
                    countI,
                    listener,
                    //removeGostListenersIfNeeded returns listeners.current or a new filtered one when conditions are met
                    currentListeners = listeners.removeCurrentGostListenersIfNeeded(),
                    active = listeners.active,
                    Ghost = ListenerGhost;
                for(i=0, countI = currentListeners.length;i<countI;i++) {
                    if ((listener = currentListeners[i]) !== Ghost) {
                        if (listener[tokenName]) {
                            listener[tokenName](plus, minus, index, this, beforeChange);
                        } else if (listener.call) {
                            listener.call(this, plus, minus, index, this, beforeChange);
                        } else {
                            throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                        }
                    }
                }/*, this);*/
            } finally {
                descriptor.isActive = false;
            }
        }
    }, this);
    //console.groupTimeEnd("dispatchRangeChange");
};

RangeChanges.prototype.addBeforeRangeChangeListener = function (listener, token) {
    return this.addRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.removeBeforeRangeChangeListener = function (listener, token) {
    return this.removeRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.dispatchBeforeRangeChange = function (plus, minus, index) {
    return this.dispatchRangeChange(plus, minus, index, true);
};
