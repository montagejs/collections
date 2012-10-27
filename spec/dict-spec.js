
var Dict = require("../dict");
var describeDict = require("./dict");

describe("Dict", function () {
    describeDict(Dict);

    it("should throw errors for non-string keys", function () {
        var dict = Dict();
        expect(function () {
            dict.get(0);
        }).toThrow();
    });
});

