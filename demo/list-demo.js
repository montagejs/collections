
var List = require("../list");

var list = new List([1,2,3]);
list.push(4, 5, 6);
list.unshift(-3, -2, -1, 0);
list.pop();
list.forEach(function (value) {
    console.log(value);
});

console.log("length", list.length);
console.log("min", list.min());
console.log("max", list.max());
console.log("sum", list.sum());
console.log("average", list.average());

console.log(list.slice());
console.log(list.slice(list.find(0)));
console.log(list.slice(list.find(0), list.find(4)));
console.log(list.slice(list.find(0), list.find(4).next));
console.log(list.splice(list.find(0), 2, 'a', 'b', 'c'), list.slice());

console.log(new List([1]).only());
console.log(new List([1, 2, 3]).one());

console.log(new List([4, 2, 3, 1]).sorted());

console.log(new List([1, 2, 3]).zip([1, 2, 3, 4]));
console.log(new List([1, 2, 3]).equals([1, 2, 3]));
console.log(new List([1, 2, 3]).equals([1, 2, 3, 4]));
console.log(new List([1, 2, 3, 4]).equals([1, 2, 3]));
console.log(new List([1, 2, 3]).equals([3, 2, 1]));

var SortedSet = require("../sorted-set");
console.log(
    new List([1,2,3]).concat(
        new List([4,5,6]),
        new List([7,8,9])
    )
    .concat([10, 11, 12])
    .concat(new SortedSet([15, 13, 14]))
    .toArray()
);

var list = new List([1,2,3,4]);
console.log(list.slice());
console.log(list.slice(0));
console.log(list.slice(1));
console.log(list.slice(-2));
console.log(list.slice(-3, 2));
console.log(list.slice(-3, -2));
console.log(list.slice(-3, -1));
console.log(list.slice(0, 0));
console.log(list.slice(-1, 0));
console.log(list.slice(0, 1));
console.log(list.slice(1, 1));
console.log(list.slice(1, 2));
console.log(list.slice(list.head.next, 2));
console.log(list.slice(list.head.next, list.head));
console.log(list.slice(list.head.next, list.head.prev));

list.reverse();
console.log(list.slice());
console.log(list.sorted());

