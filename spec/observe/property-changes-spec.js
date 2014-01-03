
/*
    Based in part on observable arrays from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

require("../../shim");
var ObservePropertyChanges = require("../../observe-property-changes");
var observeProperty = ObservePropertyChanges.observeProperty;

describe("ObservePropertyChanges", function () {

    describe("observeProperty", function () {

        it("property change", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var cancel = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("property non-change", function () {
            var object = {foo: 10};
            var spy = jasmine.createSpy();
            var cancel = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy).not.toHaveBeenCalled();
        });

        it("property change, property non-change", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var cancel = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy).toHaveBeenCalledWith(10, undefined, "foo", object);

            spy = jasmine.createSpy();
            object.foo = 10;
            expect(spy).not.toHaveBeenCalled();
        });

        it("property change, cancel", function () {
            var object = {};
            var spy = jasmine.createSpy();
            var cancel = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });
            object.foo = 10;

            cancel();
            spy = jasmine.createSpy();
            object.foo = 20;
            expect(spy).not.toHaveBeenCalled();
        });

        it("just cancel", function () {
            var object = {};
            var cancel = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy(plus, minus, name, object);
            });

            cancel();
            spy = jasmine.createSpy();
            object.foo = 20;
            expect(spy).not.toHaveBeenCalled();
        });

        it("multiple observers", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var cancel1 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var cancel2 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy1).toHaveBeenCalledWith(10, undefined, "foo", object);
            expect(spy2).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("multiple observers, one canceled", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var cancel1 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var cancel2 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            cancel1();
            object.foo = 10;
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("multiple observers, other canceled", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var cancel1 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var cancel2 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            cancel2();
            object.foo = 10;
            expect(spy1).toHaveBeenCalledWith(10, undefined, "foo", object);
            expect(spy2).not.toHaveBeenCalled();
        });

        it("multiple observers, both canceled", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var cancel1 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            var spy2 = jasmine.createSpy();
            var cancel2 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            cancel1();
            cancel2();
            object.foo = 10;
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });

        it("observe, cancel, observe", function () {
            var object = {};
            var spy1 = jasmine.createSpy();
            var cancel1 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy1(plus, minus, name, object);
            });
            cancel1();
            var spy2 = jasmine.createSpy();
            var cancel2 = observeProperty(object, "foo", function (plus, minus, name, object) {
                spy2(plus, minus, name, object);
            });
            object.foo = 10;
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(10, undefined, "foo", object);
        });

        it("dispatches to specific handler method", function () {
            var object = {
                foo: 10,
                handleFooChange: function (plus, minus, name, object) {
                    spy(plus, minus, name, object);
                }
            };
            var cancel = observeProperty(object, "foo", object);
            var spy = jasmine.createSpy();
            object.foo = 20;
            expect(spy).toHaveBeenCalledWith(20, 10, "foo", object);
        });

    });

});

