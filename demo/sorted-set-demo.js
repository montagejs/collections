
var SortedSet = require("../sorted-set");

var set = new SortedSet();
set.add(1);
set.add(2);
set.add(3);
set.add(-3);
set.add(-1);
set.add(-2);
set.log();

set.toArray().sort(function () {
    return Math.random() - .5;
}).forEach(function (value) {
    console.log("get", value);
    set.get(value);
    set.log();
});

console.log("add", 0);
set.add(0);
set.log();
console.log("add another", 0);
set.add(0);
set.log();
console.log("delete", 0);
set.delete(0);
set.log();
console.log("delete", 0);
set.delete(0);
set.log();
console.log("delete", 1);
set.delete(1);
set.log();

console.log('\nreducible methods');
console.log("min", set.min());
console.log("max", set.max());
console.log("sum", set.sum());
console.log("average", set.average());

console.log('\nconstrained greatest and least');
var set = new SortedSet([1, 3, 5, 7, 10]);
set.log();
console.log(set.findGreatestLessThan(7).value);
console.log(set.findLeastGreaterThan(6).value);

console.log('\nrange iterator');
var Iterator = require("../iterator");
var iterator = new Iterator(set.iterate(2, 10));
iterator.forEach(function (value) {
    console.log(value);
});

console.log('\nset length')
var set = new SortedSet([1, 3, 3, 5, 7, 10]);
console.log(set.length);

