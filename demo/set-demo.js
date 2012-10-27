
var Set = require("../set");
var Iterator = require("../iterator");

console.log("\nignore non-unique values");
var set = new Set([1, 1, 1, 2, 2, 2, 1, 2]);
console.log(set.toArray());

console.log("\nadd");
set.add(3);
console.log(set.toArray());

console.log("\ndelete");
set.delete(1);
console.log(set.toArray());

console.log("\nreducible");
console.log("length", set.length);
console.log("min", set.min());
console.log("max", set.max());
console.log("sum", set.sum());
console.log("average", set.average());

console.log("\nmap");
console.log(set.map(function (n) {
    return n + 1;
}));


console.log('\nhashable objects');

function Item(key, value) {
    this.key = key;
    this.value = value;
}

Item.prototype.hash = function () {
    return '' + this.key;
};

console.log("\niterate");
console.log(Iterator(set.iterate()).mapIterator(function (item) {
    return item.value;
}).toArray());

console.log(new Set([3, 2, 1]).concat([4, 5, 6]).toArray())

//console.log(new Set([1, 2, 3]).equals([1, 2, 3]));

