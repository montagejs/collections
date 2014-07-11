module.exports = describeToJson;
function describeToJson(Collection, values) {
    describe("toJSON", function () {
        it("stringifies and parses to a collection with the same data", function () {
            var collection = new Collection(values);
            var stringified = JSON.stringify(collection);

            var newCollection = new Collection(JSON.parse(stringified));

            expect(stringified).toEqual(JSON.stringify(values));

            if (collection.entries) {
                expect(Object.equals(collection.entries(), newCollection.entries())).toEqual(true);
            } else {
                expect(Object.equals(collection.toArray(), newCollection.toArray())).toEqual(true);
            }
        });
    });
}
