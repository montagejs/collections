
require("../observable-array");

var array = [];

Object.addOwnPropertyChangeListener(array, "length", function (length) {
    console.log("changed", length);
});

Object.addOwnPropertyChangeListener(array, 0, function (value) {
    console.log("array[0] changed to", value);
});

array.addEachContentChangeListener(function (value, key) {
    console.log(key, value);
});

array.push(40);
array.splice(0, 0, 10, 20, 30);

