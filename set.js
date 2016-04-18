"use strict";

var Set = require("./_set");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");
var MapChanges = require("./listen/map-changes");

module.exports = Set

if(global.Set !== void 0) {

    function defineEach(prototype) {
        var proto = Set.prototype;
        for (var name in prototype) {
            if(!proto.hasOwnProperty(name)) {
                Object.defineProperty(proto, name, {
                    value: prototype[name],
                    writable: true,
                    configurable: true,
                    enumerable: false
                });
            }
        }
    }
    defineEach(PropertyChanges.prototype);
    //This is a no-op test in property-changes.js - PropertyChanges.prototype.makePropertyObservable, so might as well not pay the price every time....
    Object.defineProperty(Set.prototype, "makePropertyObservable", {
        value: function(){},
        writable: true,
        configurable: true,
        enumerable: false
    });
    defineEach(RangeChanges.prototype);
    defineEach(MapChanges.prototype);

}
Object.addEach(Set.CollectionsSet.prototype, PropertyChanges.prototype);
Object.addEach(Set.CollectionsSet.prototype, RangeChanges.prototype);
