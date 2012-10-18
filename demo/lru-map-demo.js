
var LruMap = require("../lru-map");

var map = new LruMap({a: 10, b: 20, c: 30}, 3);

map.set('a', 10);
console.log(map.toObject());

map.set('b', 20);
console.log(map.toObject());

map.set("d", 40);
console.log(map.toObject());

map["delete"]("d");
console.log(map.toObject());

