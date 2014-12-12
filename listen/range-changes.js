"use strict";

var Dict = require("../dict");

function TokenChangeDescriptor(token) {
	var changeName = "handle" + (token.charAt(0).toUpperCase() + token.slice(1) );
	this.tokenChangeMethodName = changeName+"RangeChange";
	this.tokenWillChangeMethodName = changeName+"RangeWillChange";
	return this;
}

Object.defineProperties(TokenChangeDescriptor.prototype,{
    tokenChangeMethodName: {
		value: false,
		writable: true
	},
    tokenWillChangeMethodName: {
		value: false,
		writable: true
	},
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

module.exports = RangeChanges;
function RangeChanges() {
    throw new Error("Can't construct. RangeChanges is a mixin.");
}

// {isActive, willChangeListeners, changeListeners}
RangeChanges.prototype._rangeChangeDescriptors = null;

RangeChanges.prototype.getAllRangeChangeDescriptors = function () {
    var rangeChangeDescriptor = this._rangeChangeDescriptors || (this._rangeChangeDescriptors = Object.create(null));
    if (this.propertyIsEnumerable("_rangeChangeDescriptors")) {
        Object.defineProperty(this, "_rangeChangeDescriptors", {
            enumerable: false
        });
    }
    return rangeChangeDescriptor;
};

RangeChanges.prototype.getRangeChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllRangeChangeDescriptors();
    token = token || "";
    if (!(token in tokenChangeDescriptors)) {
        tokenChangeDescriptors[token] = new TokenChangeDescriptor(token);
    }
    return tokenChangeDescriptors[token];
};

RangeChanges.prototype.dispatchesRangeChanges = true;

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
    listeners.push(listener);

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
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove range change listener: does not exist: token " + JSON.stringify(token));
    }
    listeners.splice(index, 1);
};

RangeChanges.prototype.dispatchRangeChange = function (plus, minus, index, beforeChange) {
    var descriptors = this.getAllRangeChangeDescriptors();
	var descriptor, token, tokenName;
	
	for(token in descriptors) {
		
		descriptor = descriptors[token];

        if (descriptor.isActive) {
            return;
        } else {
            descriptor.isActive = true;
        }

        // before or after
        var listeners;
        if (beforeChange) {
            listeners = descriptor.willChangeListeners;
			tokenName = descriptor.tokenWillChangeMethodName;
        } else {
            listeners = descriptor.changeListeners;
			tokenName = descriptor.tokenChangeMethodName;
        }

        // notably, defaults to "handleRangeChange" or "handleRangeWillChange"
        // if token is "" (the default)

        // dispatch each listener
        try {
            listeners.slice().forEach(function (listener) {
                if (listeners.indexOf(listener) < 0) {
                    return;
                }
                if (listener[tokenName]) {
                    listener[tokenName](plus, minus, index, this, beforeChange);
                } else if (listener.call) {
                    listener.call(this, plus, minus, index, this, beforeChange);
                } else {
                    throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                }
            }, this);
        } finally {
            descriptor.isActive = false;
        }
    }
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

