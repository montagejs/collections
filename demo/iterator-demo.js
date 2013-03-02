
var Iterator = require("../iterator");
var List = require("../list");

Iterator.range(10).forEach(function (n) {
    console.log(n);
});

Iterator.iterate([1,2,3]).forEach(function (n) {
    console.log(n);
});

console.log('cycle');
var c = Iterator.cycle([0, 1]);
console.log(c.next());
console.log(c.next());
console.log(c.next());

console.log('cycle string');
Iterator.cycle("ab", 1).forEach(function (n) {
    console.log(n);
});

console.log('repeat 1 ten times');
Iterator.repeat(1, 10).forEach(console.log);

console.log('reduce');
var sum = Iterator.range(10).reduce(function (xs, x, i) {
    console.log(xs, x, i);
    return xs + x;
}, 0);
console.log(sum);

console.log('every');
var g = Iterator.range(10);
console.log(g.every(function (n) {
    return n < 5;
}));
console.log(g.toArray());

console.log('generic on array');
Iterator.prototype.forEach.call([1,2,3], console.log);

console.log('concat');
Iterator.concat([Iterator.range(3), Iterator.range(3)])
.forEach(console.log);

Iterator.range(3).concat(Iterator.range(3))
.forEach(console.log);

console.log('chain');
Iterator.chain(Iterator.range(3), Iterator.range(3))
.forEach(console.log);

console.log("drop while");
Iterator.range(20).dropWhile(function (n) {
    return n < 10;
}).forEach(console.log);

console.log("take while");
Iterator.range(20).takeWhile(function (n) {
    return n < 10;
}).forEach(console.log);

// unzip
console.log("unzip");
Iterator.unzip([
    Iterator.count(),
    Iterator("abc")
]).forEach(console.log, console);

// zip
console.log("zip");
Iterator.zip(
    Iterator.count(),
    Iterator("abc")
).forEach(console.log);

// zipIterator short-circuits on shortest in the race
console.log(".zip");
Iterator.count().zipIterator("abc").toArray()
.forEach(console.log);

// filter
console.log(".filter")
Iterator.range(10).filterIterator(function (n) {
    return n & 1;
})
.forEach(console.log);

// enumerate
console.log('enumerate');
console.log(Iterator("abc").enumerate().toArray());
console.log(Iterator("abc").enumerate(1).toArray());
console.log(Iterator("abc").enumerate(1, 'i', 'x').toArray());

var iterator = new Iterator([1, 2, 3, 4, 5]);
iterator.mapIterator(function (n) {
    console.log('producing', n * 2);
    return n * 2;
})
.filterIterator(function (n) {
    if (n % 3) {
        return n;
    } else {
        console.log('filtering', n);
    }
})
.forEach(function (n) {
    console.log('consuming', n);
});

list = new List([1, 2, 3, 4, 5]);
var iterator = list.iterate();
console.log(iterator.next());
iterator = new Iterator(iterator);
console.log(iterator.next());
console.log(iterator.sum());

list = new List([1, 2, 3, 4, 5]);
var iterator = new Iterator(list);
console.log(iterator.next());
iterator = new Iterator(iterator);
console.log(iterator.next());
console.log(iterator.average());

console.log(Iterator([[1, 2], [3, 4]]).flatten())

console.log(Iterator([1, 2, 3, 4]).max());

console.log(Iterator("abc").sum(""));

