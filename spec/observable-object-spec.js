/*
    Based in part on observable arrays from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

require("../observable-object");

describe("ObservableObject", function () {

    it("observes setter on object", function () {
        spy = jasmine.createSpy();
        var object = {};
        Object.addBeforeOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('from', value, key);
        });
        Object.addOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('to', value, key);
        });
        object.x = 10;
        expect(object.x).toEqual(10);
        Object.uninstallPropertyObserver(object, 'x');
        object.x = 20;
        expect(object.x).toEqual(20);
        expect(spy.argsForCall).toEqual([
            ['from', undefined, 'x'],
            ['to', 10, 'x'],
        ]);
    });

    it("observes setter on object with getter/setter", function () {
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
        Object.addBeforeOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('from', value, key);
        });
        Object.addOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('to', value, key);
        });
        object.x = 10;
        expect(object.x).toEqual(20);
        expect(spy.argsForCall).toEqual([
            ['from', 20, 'x'],
            ['to', 20, 'x'], // reports no change
        ]);
    });

    it("handles cyclic own property change listeners", function () {
        var a = {};
        var b = {};
        Object.addOwnPropertyChangeListener(a, 'foo', function (value) {
            b.bar = value;
        });
        Object.addOwnPropertyChangeListener(b, 'bar', function (value) {
            a.foo = value;
        });
        a.foo = 10;
        expect(b.bar).toEqual(10);
    });

    it("handles generic own property change listeners", function () {
        var object = {
            handleOwnPropertyChange: function (value, key) {
                expect(value).toBe(10);
                expect(key).toBe("foo");
            }
        };
        spyOn(object, "handleOwnPropertyChange").andCallThrough();
        Object.addOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handleOwnPropertyChange).toHaveBeenCalled();
    });

    it("handles specific own property change listeners", function () {
        var object = {
            handleFooChange: function (value) {
                expect(value).toBe(10);
            }
        };
        spyOn(object, "handleFooChange").andCallThrough();
        Object.addOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handleFooChange).toHaveBeenCalled();
    });

});

