#!/usr/bin/env node --harmony_weakmaps

var WeakMap = require("../weak-map");

var map = new WeakMap();

var key = {};
map.set(key, 10);
console.log(map.toString());
console.log(map.get(key));

