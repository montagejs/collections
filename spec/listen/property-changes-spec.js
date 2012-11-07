/*
    Based in part on observable arrays from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

var PropertyChanges = require("../../listen/property-changes");

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
        PropertyChanges.makePropertyUnobservable(object, 'x');
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
        PropertyChanges.addBeforeOwnPropertyChangeListener(object, 'x', function (value, key) {
            spy('from', value, key);
        });
        PropertyChanges.addOwnPropertyChangeListener(object, 'x', function (value, key) {
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
        spyOn(object, "handlePropertyChange").andCallThrough();
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handlePropertyChange).toHaveBeenCalled();
    });

    it("handles specific own property change listeners", function () {
        var object = {
            handleFooChange: function (value) {
                expect(value).toBe(10);
            }
        };
        spyOn(object, "handleFooChange").andCallThrough();
        PropertyChanges.addOwnPropertyChangeListener(object, "foo", object);
        object.foo = 10;
        expect(object.handleFooChange).toHaveBeenCalled();
    });

});

