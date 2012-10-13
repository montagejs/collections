#!/usr/bin/env node --harmony_collections

var WeakMap = require("../weak-map");

if (/native/.test(WeakMap.toString())) {
    console.log("Using native WeakMap");
} else {
    console.log("Using shim WeakMap");
}

var map = new WeakMap();

var key = {};
map.set(key, 10);
console.log(map.toString());
console.log(map.get(key));

