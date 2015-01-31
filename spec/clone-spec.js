
var Set = require("../set");
var Map = require("../map");
var clone = require("pop-clone");
var equals = require("pop-equals");

describe("clone", function () {

    it("should deeply clone custom collections", function () {
        var a = Set([Map({a: {}})]);
        var b = clone(a);

        // equal maps are not consistently hashed
        expect(equals(a, b)).toBe(false);
        expect(a.equals(b)).toBe(false);

        expect(a.one()).not.toBe(b.one());
        expect(a.one().equals(b.one())).toBe(true);
        expect(a.one().get('a')).not.toBe(b.one().get('a'));
        expect(a.one().get('a')).toEqual(b.one().get('a'));
    });

});

