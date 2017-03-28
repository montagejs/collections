
var Dict = require("collections/dict");
var describeDict = require("./dict");
var describeToJson = require("./to-json");

describe("Dict-spec", function () {
    describeDict(Dict);
    describeToJson(Dict, {a: 1, b: 2, c: 3});

    it("should throw errors for non-string keys", function () {
        var dict = Dict();
        expect(function () {
            dict.get(0);
        }).toThrow();
        expect(function () {
            dict.set(0, 10);
        }).toThrow();
        expect(function () {
            dict.has(0);
        }).toThrow();
        expect(function () {
            dict.delete(0);
        }).toThrow();
    });

});

