
var WeakMap = require("./weak-map");

var map = new WeakMap();

Object.hash = function (object) {
    if (Object(object) === object) {
        if (!map.has(object)) {
            map.set(object, Math.random().toString(36).slice(2));
        }
        return map.get(object);
    } else {
        return "" + object;
    }
};

