module.exports = describeToJson;
function describeToJson(Collection, values) {
    describe("toJSON", function () {
        it("stringifies and parses to a collection with the same data", function () {
            var collection = Collection.from(values);
            var stringified = JSON.stringify(collection);

            var newCollection = Collection.from(JSON.parse(stringified));

            expect(stringified).toEqual(JSON.stringify(values));

            if (collection.entriesArray) {
                expect(Object.equals(collection.entriesArray(), newCollection.entriesArray())).toEqual(true);
            } else {
                expect(Object.equals(collection.toArray(), newCollection.toArray())).toEqual(true);
            }
        });
    });
}
