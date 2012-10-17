
var Map = require("../fast-map");

var map = new Map();
map.set('a', 10);
map.set('b', 20);
console.log(map.keys());

var map = new Map();
var a = {am: "a"}, b = {am: "b"}, c = {am: "c"};
map.set(a, 10);
map.set(b, 20);
map.set(c, 30);
console.log(map.get(b));
map.log();

map.forEach(function (value, key) {
    console.log(key + ': ' + value);
});

map.delete(a);
console.log(map.values());

console.log('\nclone');
console.log(map.clone().items());

console.log(new Map().items());
console.log(new Map({a: 10, b: 20}).items());
console.log(new Map(['a', 'b', 'c']).items());
console.log(new Map(new Map({a: 10, b: 20})).items());

console.log(new Map({a: 10, b: 20}).concat({c: 30, d: 40}).toObject());

// a case that may (depending on engine) distinguish a fast map from a map
// (with keys in insertion order)
var map = new Map();
map.set(10, 'b');
map.set(0, 'a');
console.log(map.toArray());

