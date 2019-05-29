/*
    Based in part on observable arrays from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

require("collections/shim");
var PropertyChanges = require("collections/listen/property-changes");

describe("PropertyChanges", function () {

    it("observes setter on object", function () {
        spy = jasmine.createSpy();
        var object = {};
        PropertyChanges.addBeforeOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('from', value, key);
        });
        PropertyChanges.addOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('to', value, key);
        });
        object.x = 10;
        expect(object.x).toEqual(10);
        
        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ['from', undefined, 'x'],
            ['to', 10, 'x'],
        ]);
    });

    it("observes setter on object with getter/setter", function () {
        spy = jasmine.createSpy();
        var value;
        var object = Object.create(Object.prototype, {
            _x: {
                value: 10,
                writable: true
            },
            x: {
                get: function () {
                    return this._x;
                },
                set: function (_value) {
                    this._x = _value;
                },
                enumerable: false,
                configurable: true
            }
        });
        PropertyChanges.addBeforeOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('from', value, key);
        });
        PropertyChanges.addOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('to', value, key);
        });
        object.x = 20;
        expect(object.x).toEqual(20);

        var argsForCall = spy.calls.all().map(function (call) { return call.args });
        expect(argsForCall).toEqual([
            ['from', 10, 'x'],
            ['to', 20, 'x'], // reports no change
        ]);
    });

    it("shouldn't call the listener if the new value is the same after calling the object setter", function () {
        spy = jasmine.createSpy();
        var value;
        var object = Object.create(Object.prototype, {
            x: {
                get: function () {
                    return 20;
                },
                set: function (_value) {
                    // refuse to change internal state
                },
                enumerable: false,
                configurable: true
            }
        });
        PropertyChanges.addBeforeOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('from', value, key);
        });
        PropertyChanges.addOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('to', value, key);
        });
        object.x = 10;
        expect(object.x).toEqual(20);
        expect(spy).not.toHaveBeenCalled();
    });

    it("calls setter on object when the new value is the current value", function() {
        var object = Object.create(Object.prototype, {
            _x: {value: 0, writable: true},
            x: {
                get: function() {
                    return this._x;
                },
                set: function(value) {
                    this._x = value * 2;
                },
                configurable: true,
                enumerable: true
            }
        });

        PropertyChanges.addOwnPropertyChangeListener(object, "x", function() {});

        object.x = 1;
        object.x = 2;

        expect(object.x).toBe(4);
    });

    it("handles cyclic own property change listeners", function () {
        var a = {};
        var b = {};
        PropertyChanges.addOwnPropertyChangeListener(a, 'foo', function (value) {
            b.bar = value;
        });
        PropertyChanges.addOwnPropertyChangeListener(b, 'bar', function (value) {
            a.foo = value;
        });
        a.foo = 10;
        expect(b.bar).toEqual(10);
    });

    it("handles generic own property change listeners", function () {
        var object = {
            handlePropertyChange: function (value, key) {
                expect(value).toBe(10);
                expect(key).toBe("foo");
            }
        };
        spyOn(object, "handlePropertyChange").and.callThrough();
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handlePropertyChange).toHaveBeenCalled();
    });

    it("handles generic before own property change listeners", function () {
        var object = {
            foo: 12,
            handlePropertyWillChange: function (value, key) {
                expect(value).toBe(12);
                expect(key).toBe("foo");
            }
        };
        spyOn(object, "handlePropertyWillChange").and.callThrough();
        PropertyChanges.addBeforeOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handlePropertyWillChange).toHaveBeenCalled();
    });

    it("handles specific own property change listeners", function () {
        var object = {
            handleFooChange: function (value) {
                expect(value).toBe(10);
            }
        };
        spyOn(object, "handleFooChange").and.callThrough();
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handleFooChange).toHaveBeenCalled();
    });

    it("handles specific before own property change listeners", function () {
        var object = {
            foo: 12,
            handleFooWillChange: function (value) {
                expect(value).toBe(12);
            }
        };
        spyOn(object, "handleFooWillChange").and.callThrough();
        PropertyChanges.addBeforeOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handleFooWillChange).toHaveBeenCalled();
    });

    it("calls later handlers if earlier ones remove themselves", function () {
        var object = {
            foo: true
        };
        var listener1 = {
            handleFooChange: function (value, key, object) {
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener1);
            }
        };
        var listener2 = jasmine.createSpyObj("listener2", ["handleFooChange"]);

        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener1);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener2);

        object.foo = false;
        expect(listener2.handleFooChange).toHaveBeenCalled();
    });

    it("calls later handlers if multiple earlier ones remove themselves", function () {
        var object = {
            foo: true
        };
        var listener3 = {
            handleFooChange: function (value, key, object) {
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener1);
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener3);
            }
        };
        var listener1 = jasmine.createSpyObj("listener1", ["handleFooChange"]);
        var listener2 = jasmine.createSpyObj("listener2", ["handleFooChange"]);
        var listener4 = jasmine.createSpyObj("listener4", ["handleFooChange"]);

        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener1);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener2);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener3);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener4);

        object.foo = false;
        expect(listener1.handleFooChange).toHaveBeenCalled();
        expect(listener2.handleFooChange).toHaveBeenCalled();
        expect(listener4.handleFooChange).toHaveBeenCalled();
    });

    it("doesn't call any handlers if all the listeners are removed during dispatch", function () {
        var object = {
            foo: true
        };
        var listener1 = {
            handleFooChange: function (value, key, object) {
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener1);
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener2);
            }
        };
        var listener2 = jasmine.createSpyObj("listener2", ["handleFooChange"]);

        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener1);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener2);

        object.foo = false;
        expect(listener2.handleFooChange).not.toHaveBeenCalled();
    });

    it("doesn't call new handlers if listeners are added during dispatch", function () {
        var object = {
            foo: true
        };
        var listener1 = {
            handleFooChange: function (value, key, object) {
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener1);
                PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener3);
            }
        };
        var listener2 = jasmine.createSpyObj("listener2", ["handleFooChange"]);
        var listener3 = jasmine.createSpyObj("listener3", ["handleFooChange"]);

        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener1);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener2);

        object.foo = false;
        expect(listener2.handleFooChange).toHaveBeenCalled();
        expect(listener3.handleFooChange).not.toHaveBeenCalled();
    });

    it("compact listeners when the ratio of ListenerGhost is too high", function () {
        var object = {
            foo: true
        };
        var listener3 = {
            handleFooChange: function (value, key, object) {
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener1);
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener3);
                PropertyChanges.removeOwnPropertyChangeListener(object, key, listener5);
            }
        };
        var listener1 = jasmine.createSpyObj("listener1", ["handleFooChange"]);
        var listener2 = jasmine.createSpyObj("listener2", ["handleFooChange"]);
        var listener4 = jasmine.createSpyObj("listener4", ["handleFooChange"]);
        var listener5 = jasmine.createSpyObj("listener5", ["handleFooChange"]);

        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener1);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener2);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener3);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener4);
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", listener5);

        object.foo = false;
        expect(listener1.handleFooChange).toHaveBeenCalled();
        expect(listener2.handleFooChange).toHaveBeenCalled();
        expect(listener4.handleFooChange).toHaveBeenCalled();

        var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(object, "foo");
        expect(descriptor.changeListeners.ghostCount).toEqual(3);

        object.foo = true;
        expect(descriptor.changeListeners.ghostCount).toEqual(0);

        expect(listener2.handleFooChange).toHaveBeenCalled();
        expect(listener4.handleFooChange).toHaveBeenCalled();

    });

});
