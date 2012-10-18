
var MultiMap = require("../multi-map");
require("../array"); // for Array#swap
var List = require("../list");

debugger;
var map = new MultiMap({a: [1, 2, 3]}, List);
console.log(map);
console.log(map.keys());
console.log(map.get("a"));
console.log(map.get("a").toArray());
var before = map.get("a");
map.get("a").push(4);
console.log(map.get("a").toArray());
map.set("a", []);
console.log(map.get("a").toArray());
console.log(map.get("a") === before);

