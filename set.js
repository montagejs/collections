"use strict";

var Set = require("./_set");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");
var MapChanges = require("./listen/map-changes");

module.exports = Set

if(global.Set !== void 0) {

    Object.defineEach(Set.prototype, PropertyChanges.prototype, false, /*configurable*/true, /*enumerable*/ false, /*writable*/true);
    //This is a no-op test in property-changes.js - PropertyChanges.prototype.makePropertyObservable, so might as well not pay the price every time....
    Object.defineProperty(Set.prototype, "makePropertyObservable", {
        value: function(){},
        writable: true,
        configurable: true,
        enumerable: false
    });

    Object.defineEach(Set.prototype, RangeChanges.prototype, false, /*configurable*/true, /*enumerable*/ false, /*writable*/true);
    Object.defineEach(Set.prototype, MapChanges.prototype, false, /*configurable*/true, /*enumerable*/ false, /*writable*/true);

}
Object.addEach(Set.CollectionsSet.prototype, PropertyChanges.prototype);
Object.addEach(Set.CollectionsSet.prototype, RangeChanges.prototype);
