
require("collections/shim-regexp");

describe("RegExp-spec", function () {
    describe("escape", function () {

        [
            "{",
            "a-b",
            "...",
            "\\x",
            "[a-b]",
            "^foo$",
            ".?",
            "()",
            "1..3",
            "[^a-z]"
        ].forEach(function (input) {

            it("should escape " + JSON.stringify(input), function () {
                var re = new RegExp("^" + RegExp.escape(input) + "$");
                expect(re.test(input)).toBe(true);
            });

            it("should escape case-insensitively " + JSON.stringify(input), function () {
                var re = new RegExp("^" + RegExp.escape(input) + "$", "i");
                expect(re.test(input.toUpperCase())).toBe(true);
            });

        });

    });
});

