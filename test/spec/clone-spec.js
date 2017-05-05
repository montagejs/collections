
var Set = require("collections/set");
var Map = require("collections/map");

describe("Clone-spec", function () {

    it("should deeply clone custom collections", function () {
        var a = new Set([new Map([["a",{}]])]);
        var b = Object.clone(a);

        // equal maps are not consistently hashed
        expect(Object.equals(a, b)).toBe(false);
        expect(a.equals(b)).toBe(false);

        expect(a.one()).not.toBe(b.one());
        expect(a.one().equals(b.one())).toBe(true);
        expect(a.one().get('a')).not.toBe(b.one().get('a'));
        expect(a.one().get('a')).toEqual(b.one().get('a'));
    });

});
