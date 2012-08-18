
require("../object");

Object.forEach({a: 10, b: 20}, function (value, key) {
    console.log(key + ": " + value);
});

