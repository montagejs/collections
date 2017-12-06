
var WeakMap = require("weak-map");

var hashMap = new WeakMap();

module.exports = hash;
function hash(object) {
    if (object && typeof object.hash === "function") {
        return "" + object.hash();
    } else if (Object.isObject(object)) {
        if (!hashMap.has(object)) {
            hashMap.set(object, Math.random().toString(36).slice(2));
        }
        return hashMap.get(object);
    } else {
        return "" + object;
    }
}

