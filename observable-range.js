/*global -WeakMap*/
"use strict";

// TODO review all error messages for consistency and helpfulness across observables

var WeakMap = require("weak-map");

var changeObserversByObject = new WeakMap();
var willChangeObserversByObject = new WeakMap();
var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableRange;
function ObservableRange() {
    throw new Error("Can't construct. ObservableRange is a mixin.");
}

ObservableRange.prototype.observeRangeChange = function (handler, name, note, capture) {
    this.makeRangeChangesObservable();
    var observers = this.getRangeChangeObservers(capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new RangeChangeObserver();
    }

    observer.object = this;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "RangeChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeChange) {
            observer.handlerMethodName = "handleRangeChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    } else {
        var methodName = "handle" + propertyName + "RangeWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeWillChange) {
            observer.handlerMethodName = "handleRangeWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
};

ObservableRange.prototype.observeRangeWillChange = function (handler, name, note) {
    return this.observeRangeChange(handler, name, note, true);
};

ObservableRange.prototype.dispatchRangeChange = function (plus, minus, index, capture) {
    if (!dispatching) { // TODO && !debug?
        return this.startRangeChangeDispatchContext(plus, minus, index, capture);
    }
    var observers = this.getRangeChangeObservers(capture);
    for (var observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        var observer = observers[observerIndex];
        // The slicing ensures that handlers cannot interfere with another by
        // altering these arguments.
        observer.dispatch(plus.slice(), minus.slice(), index);
    }
};

ObservableRange.prototype.dispatchRangeWillChange = function (plus, minus, index) {
    return this.dispatchRangeChange(plus, minus, index, true);
};

ObservableRange.prototype.startRangeChangeDispatchContext = function (plus, minus, index, capture) {
    dispatching = true;
    try {
        this.dispatchRangeChange(plus, minus, index, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Range change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Range change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
};

ObservableRange.prototype.makeRangeChangesObservable = function () {
    this.dispatchesRangeChanges = true;
};

ObservableRange.prototype.getRangeChangeObservers = function (capture) {
    var byObject = capture ? willChangeObserversByObject : changeObserversByObject;
    if (!byObject.has(this)) {
        byObject.set(this, []);
    }
    return byObject.get(this);
};

ObservableRange.prototype.getRangeWillChangeObservers = function () {
    return this.getRangeChangeObservers(true);
};

function RangeChangeObserver() {
    this.init();
}

RangeChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

RangeChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " range changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

RangeChangeObserver.prototype.dispatch = function (plus, minus, index) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, index, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, index, this.object);
    } else {
        throw new Error(
            "Can't dispatch range change to " + handler
        );
    }

    this.childObserver = childObserver;
    return this;
};

