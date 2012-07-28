
var List = require("./list");

var list = new List([1,2,3]);
list.push(4, 5, 6);
list.unshift(-3, -2, -1, 0);
list.pop();
list.forEach(function (value) {
    console.log(value);
});

console.log("min", list.min());
console.log("max", list.max());
console.log("count", list.count());
console.log("sum", list.sum());
console.log("average", list.average());

console.log(list.slice());
console.log(list.slice(list.find(0)));
console.log(list.slice(list.find(0), list.find(4)));
console.log(list.slice(list.find(0), list.find(4).next));
console.log(list.splice(list.find(0), 2, 'a', 'b', 'c'), list.slice());

