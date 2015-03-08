
var Dict = require("../dict");
var describeDict = require("./dict");
var describeObservableMap = require("./observable-map");

describe("Dict", function () {

    describeDict(Dict);
    describeObservableMap(Dict);

});

