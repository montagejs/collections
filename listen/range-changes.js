"use strict";

var WeakMap = require("../weak-map");

var contentChangeDescriptors = new WeakMap(); // {isActive, willChangeListeners, changeListeners}

module.exports = RangeChanges;
function RangeChanges() {
    throw new Error("Can't construct. RangeChanges is a mixin.");
}

RangeChanges.prototype.getRangeChangeDescriptor = function () {
    if (!contentChangeDescriptors.has(this)) {
        contentChangeDescriptors.set(this, {
            isActive: false,
            changeListeners: [],
            willChangeListeners: []
        });
    }
    return contentChangeDescriptors.get(this);
};

RangeChanges.prototype.addRangeChangeListener = function (listener, beforeChange) {
    // a concession for objects like Array that are not inherently observable
    if (!this.isObservable && this.makeObservable) {
        this.makeObservable();
    }

    var descriptor = this.getRangeChangeDescriptor();

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // even if already registered
    listeners.push(listener);
    this.dispatchesRangeChanges = !!(
        descriptor.willChangeListeners.length +
        descriptor.changeListeners.length
    );

    var self = this;
    return function cancelRangeChangeListener() {
        self.removeRangeChangeListener(listener, beforeChange);
        self = null;
    };
};

RangeChanges.prototype.removeRangeChangeListener = function (listener, beforeChange) {
    var descriptor = this.getRangeChangeDescriptor();

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove listener: does not exist.");
    }
    listeners.splice(index, 1);
    this.dispatchesRangeChanges = !!(
        descriptor.willChangeListeners.length +
        descriptor.changeListeners.length
    );
};

RangeChanges.prototype.dispatchRangeChange = function (plus, minus, index, beforeChange) {
    var descriptor = this.getRangeChangeDescriptor();

    if (descriptor.isActive) {
        return;
    } else {
        descriptor.isActive = true;
    }

    // before or after
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // dispatch each listener
    try {
        listeners.forEach(function (listener) {
            if (listener.handleEvent) {
                // support for handleEvent form
                listener.handleEvent({
                    phase: beforeChange ? "before" : "after",
                    currentTarget: this,
                    target: this,
                    plus: plus,
                    minus: minus,
                    index: index
                });
            } else {
                // support listener() listener.handleRangeChange() and
                // listener.handleRangeChange() forms
                if (beforeChange) {
                    listener = listener.handleRangeWillChange || listener;
                } else {
                    listener = listener.handleRangeChange || listener;
                }
                if (listener.call) {
                    listener.call(this, plus, minus, index, beforeChange);
                }
            }
        }, this);
    } finally {
        descriptor.isActive = false;
    }
};

RangeChanges.prototype.addBeforeRangeChangeListener = function (listener) {
    return this.addRangeChangeListener(listener, true);
};

RangeChanges.prototype.removeBeforeRangeChangeListener = function (listener) {
    return this.removeRangeChangeListener(listener, true);
};

RangeChanges.prototype.dispatchBeforeRangeChange = function (plus, minus, index) {
    return this.dispatchRangeChange(plus, minus, index, true);
};

