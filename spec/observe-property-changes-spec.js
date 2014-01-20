
/*
 * Based in part on observable arrays from Motorola Mobility’s Montage
 * Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 * 3-Clause BSD License
 * https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

// TODO observePropertyWillChange
// TODO access observer notes

var ObservePropertyChanges = require("../observe-property-changes");
var observePropertyChange = ObservePropertyChanges.observePropertyChange;

describe("ObservePropertyChanges", function () {

    describe("observePropertyChange", function () {

        it("property change", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var observer = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("property non-change", function () {
            var object = {foo: 10};
            var spy = jasmine.createSpy();
            var observer = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy).not.toHaveBeenCalled();
        });

        it("property change, property non-change", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var observer = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", object);

            spy = jasmine.createSpy();
            object.foo = 10;
            expect(spy).not.toHaveBeenCalled();
        });

        it("property change, observer", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var observer = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;

            observer.cancel();
            spy = jasmine.createSpy();
            object.foo = 20;
            expect(spy).not.toHaveBeenCalled();
        });

        it("just observer", function () {
            var object = {};
            var observer = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });

            observer.cancel();
            spy = jasmine.createSpy();
            object.foo = 20;
            expect(spy).not.toHaveBeenCalled();
        });

        it("multiple observers", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var observer1 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var observer2 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy1).toHaveBeenCalledWith(10, undefined, "foo", object);
            expect(spy2).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("multiple observers, one observered", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var observer1 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var observer2 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            observer1.cancel();
            object.foo = 10;
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("multiple observers, other observered", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var observer1 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var observer2 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            observer2.cancel();
            object.foo = 10;
            expect(spy1).toHaveBeenCalledWith(10, undefined, "foo", object);
            expect(spy2).not.toHaveBeenCalled();
        });

        it("multiple observers, both observered", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var observer1 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var observer2 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            observer1.cancel();
            observer2.cancel();
            object.foo = 10;
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });

        it("observe, observer, observe", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var observer1 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            observer1.cancel();
            var spy2 = jasmine.createSpy();
            var observer2 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("dispatches to generic handler method", function () {
            var object = {
                foo: 10,
                handlePropertyChange: function (plus, minus, name, object) {
                    spy(plus, minus, name, object);
                }
            };
            var observer = observePropertyChange(object, "foo", object);
            var spy = jasmine.createSpy();
            object.foo = 20;
            expect(spy).toHaveBeenCalledWith(20, 10, "foo", object);
        });

        it("dispatches to specific handler method", function () {
            var object = {
                foo: 10,
                handleFooPropertyChange: function (plus, minus, name, object) {
                    spy(plus, minus, name, object);
                }
            };
            var observer = observePropertyChange(object, "foo", object);
            var spy = jasmine.createSpy();
            object.foo = 20;
            expect(spy).toHaveBeenCalledWith(20, 10, "foo", object);
        });

        it("is robust against observeration of an intermediate observer", function () {
            var object = {foo: 10};
            var spy1 = jasmine.createSpy();
            var observer1 = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
                if (observer2) observer2.cancel();
            });
            var spy2 = jasmine.createSpy();
            var observer2 = observePropertyChange(object, "foo", spy2);
            var spy3 = jasmine.createSpy();
            var observer3 = observePropertyChange(object, "foo", spy3);
            var spy4 = jasmine.createSpy();
            var observer4 = observePropertyChange(object, "foo", spy4);
            expect(spy1.callCount).toBe(0);
            expect(spy2.callCount).toBe(0);
            expect(spy3.callCount).toBe(0);
            object.foo = 20;
            expect(spy1.callCount).toBe(1);
            expect(spy2.callCount).toBe(0);
            expect(spy3.callCount).toBe(1);
        });

        it("is robust against property changes during dispatch of a property change", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var observer = observePropertyChange(object, "foo", function (plus, minus, name, object) {
                if (object.foo >= 10) {
                    return observer.cancel();
                }
                spy();
                object.foo = object.foo + 1;
            });
            object.foo = 0;
            expect(spy.callCount).toBe(10);
        });

        it("should observe nested observer", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var innerCancel = jasmine.createSpy();
            var observer = observePropertyChange(object, "foo", function () {
                spy();
                return {cancel: innerCancel};
            });

            expect(spy.callCount).toBe(0);
            expect(innerCancel.callCount).toBe(0);

            object.foo = 10;
            expect(spy.callCount).toBe(1);
            expect(innerCancel.callCount).toBe(0);

            object.foo = 20;
            expect(spy.callCount).toBe(2);
            expect(innerCancel.callCount).toBe(1);

            observer.cancel();
            expect(spy.callCount).toBe(2);
            expect(innerCancel.callCount).toBe(2);
        });

        it("should note exceptions that interrupt property change dispatch", function () {
            var object = {};
            var observer = observePropertyChange(object, "foo", function (child) {
                throw new Error("X");
            });
            var spy = jasmine.createSpy();
            observePropertyChange(object, "foo", spy);
            var error;
            try {
                object.foo = 10;
            } catch (_error) {
                error = _error;
            }
            expect(error && error.message).toBe("Property change dispatch possibly corrupted by error: X");
            // it was indeed, thanks for the warning.
            expect(spy).not.toHaveBeenCalled();
        });

        it("handles manual dispatch", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var observer = observePropertyChange(object, "foo", function (value) {
                spy.apply(this, arguments);
                if (value === 2) {
                    observer.cancel();
                    observer = null;
                }
            });
            expect(spy.callCount).toBe(0);
            observer.dispatch(1);
            expect(spy.callCount).toBe(1);
            expect(spy).toHaveBeenCalledWith(1, undefined, "foo", object);
            observer.dispatch(2);
            expect(spy).toHaveBeenCalledWith(2, 1, "foo", object);
            expect(observer).toBe(null);
        });

    });

});

