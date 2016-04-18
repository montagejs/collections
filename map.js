"use strict";

var Map = require("./_map");
var PropertyChanges = require("./listen/property-changes");
var MapChanges = require("./listen/map-changes");

module.exports = Map;

if(global.Map === void 0) {
    Object.addEach(Map.prototype, PropertyChanges.prototype);
    Object.addEach(Map.prototype, MapChanges.prototype);
}
else {

    function defineEach(prototype) {
        // console.log("Map defineEach: ",Object.keys(prototype));
        var proto = Map.prototype;
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
    defineEach(MapChanges.prototype);
}
