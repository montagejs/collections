"use strict";


var List = require("./_list");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");

module.exports = List;

Object.addEach(List.prototype, PropertyChanges.prototype);
Object.addEach(List.prototype, RangeChanges.prototype);
