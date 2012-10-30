var SortedArray = require("../sorted-array");

var array = SortedArray([]);
array.addEach([5, 2, 4, 3, 1]);
console.log(array.toArray());

var array = SortedArray([1, 1, 1, 1, 1]);
console.log(array.indexOf(1));
console.log(array.lastIndexOf(1));

