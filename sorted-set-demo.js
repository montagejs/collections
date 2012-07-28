
var SortedSet = require("./sorted-set");

var tree = new SortedSet();
tree.add(1);
tree.add(2);
tree.add(3);
tree.add(-3);
tree.add(-1);
tree.add(-2);
tree.log();

tree.values().sort(function () {
    return Math.random() - .5;
}).forEach(function (value) {
    console.log("get", value);
    tree.get(value);
    tree.log();
});

console.log("add", 0);
tree.add(0);
tree.log();
console.log("add another", 0);
tree.add(0);
tree.log();
console.log("delete", 0);
tree.delete(0);
tree.log();
console.log("delete", 0);
tree.delete(0);
tree.log();
console.log("delete", 1);
tree.delete(1);
tree.log();

console.log("min", tree.min());
console.log("max", tree.max());
console.log("count", tree.count());
console.log("sum", tree.sum());
console.log("average", tree.average());

