"use strict";

var WeakMap = require("./weak-map");

var contentChangeDescriptors = new WeakMap(); // {isActive, willChangeListeners, changeListeners}

var Observable = exports;

Observable.getContentChangeDescriptor = function () {
    if (!contentChangeDescriptors.has(this)) {
        contentChangeDescriptors.set(this, {
            isActive: false,
            changeListeners: [],
            willChangeListeners: []
        });
    }
    return contentChangeDescriptors.get(this);
};

Observable.addContentChangeListener = function (listener, beforeChange) {
    // a concession for objects like Array that are not inherently observable
    if (!this.isObservable && this.makeObservable) {
        this.makeObservable();
    }

    var descriptor = this.getContentChangeDescriptor();

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // even if already registered
    listeners.push(listener);
    this.isObserved = !!listeners.length;
};

Observable.removeContentChangeListener = function (listener, beforeChange) {
    var descriptor = this.getContentChangeDescriptor();

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
    this.isObserved = !!listeners.length;
};

Observable.dispatchContentChange = function (plus, minus, index, beforeChange) {
    var descriptor = this.getContentChangeDescriptor();

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
                // support listener() listener.handleContentChange() and
                // listener.handleContentChange() forms
                if (beforeChange) {
                    listener = listener.handleContentWillChange || listener;
                } else {
                    listener = listener.handleContentChange || listener;
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

Observable.addBeforeContentChangeListener = function (listener) {
    return this.addContentChangeListener(listener, true);
};

Observable.removeBeforeContentChangeListener = function (listener) {
    return this.removeContentChangeListener(listener, true);
};

Observable.dispatchBeforeContentChange = function (plus, minus, index) {
    return this.dispatchContentChange(plus, minus, index, true);
};

