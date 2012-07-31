
module.exports = List;

var Reducible = require("./reducible");
var Operators = require("./operators");

function List(values, equals) {
    var head = this.head = new this.Node();
    head.next = head;
    head.prev = head;
    this.contentEquals = equals || Object.equals || Operators.equals;
    this.length = 0;
    this.addEach(values);
}

List.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals);
};

List.prototype.find = function find(value) {
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        if (this.contentEquals(at.value, value)) {
            return at;
        }
        at = at.next;
    }
};

List.prototype.findLast = function (value) {
    var head = this.head;
    var at = head.prev;
    while (at !== head) {
        if (this.contentEquals(at.value, value)) {
            return at;
        }
        at = at.prev;
    }
};

List.prototype.has = function has(value) {
    return !!this.find(value);
};

List.prototype.get = function get(value) {
    var found = this.find(value);
    if (found) {
        return found.value;
    }
    return this.getDefault();
};

List.prototype.getDefault = function getDefault() {
};

// LIFO (delete removes the most recently added equivalent value)
List.prototype['delete'] = function (value) {
    var found = this.findLast(value);
    if (found) {
        found['delete']();
        return true;
    }
    return false;
};

List.prototype.wipe = function () {
    this.head.next = this.head.prev = this.head;
};

List.prototype.add = function add(value) {
    this.head.addAfter(new this.Node(value));
    this.length++;
};

List.prototype.push = function () {
    var head = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var node = new this.Node(arguments[i]);
        head.addAfter(node);
        this.length++;
    }
};

List.prototype.unshift = function () {
    var at = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var node = new this.Node(arguments[i]);
        at.addBefore(node);
        this.length++;
        at = node;
    }
};

List.prototype.pop = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        head.prev['delete']();
        this.length--;
    }
    return value;
};

List.prototype.shift = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        head.prev['delete']();
        this.length--;
    }
    return value;
};

List.prototype.slice = function (at, end) {
    var sliced = [];
    var head = this.head;
    at = at || head.next;
    end = end || head;
    while (at !== end) {
        sliced.push(at.value);
        at = at.next;
    }
    return sliced;
};

List.prototype.splice = function (at, length /*...plus*/) {
    return this.swap(at, length, Array.prototype.slice.call(arguments, 2));
};

List.prototype.swap = function (at, length, plus) {
    var swapped = [];
    at = at || this.head.next;
    while (length--) {
        swapped.push(at.value);
        at['delete']();
        at = at.next;
    }
    this.length -= length;
    for (var i = 0; i < plus.length; i++) {
        var node = new this.Node(plus[i]);
        at.addAfter(node);
    }
    this.length += plus.length;
    return swapped;
};

// TODO account for missing basis argument
List.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.next;
    }
    return basis;
};

List.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.prev;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.prev;
    }
    return basis;
};

List.prototype.addEach = Reducible.addEach;
List.prototype.forEach = Reducible.forEach;
List.prototype.map = Reducible.map;
List.prototype.toArray = Reducible.toArray;
List.prototype.filter = Reducible.filter;
List.prototype.every = Reducible.every;
List.prototype.some = Reducible.some;
List.prototype.all = Reducible.all;
List.prototype.any = Reducible.any;
List.prototype.min = Reducible.min;
List.prototype.max = Reducible.max;
List.prototype.count = Reducible.count;
List.prototype.sum = Reducible.sum;
List.prototype.average = Reducible.average;
List.prototype.flatten = Reducible.flatten;
List.prototype.zip = Reducible.zip;
List.prototype.equals = Reducible.equals;
List.prototype.compare = Reducible.compare;
List.prototype.sorted = Reducible.sorted;
List.prototype.clone = Reducible.clone;

List.prototype.one = function one() {
    if (this.head === this.head.next) {
        throw new Error("Can't get one value from empty list");
    }
    return this.head.next.value;
};

List.prototype.only = function () {
    if (this.head === this.head.next) {
        throw new Error("Can't get only value in empty list");
    }
    if (this.head.prev !== this.head.next) {
        throw new Error("Can't get only value in list with multiple values");
    }
    return this.head.next.value;
};

List.prototype.iterate = function iterate() {
    return new ListIterator(this.head);
};

function ListIterator(head) {
    this.head = head;
    this.at = head.next;
};

ListIterator.prototype.next = function next() {
    if (this.at === this.head) {
        throw StopIteration;
    } else {
        var value = this.at.value;
        this.at = this.at.next;
        return value;
    }
};

List.prototype.Node = Node;

function Node(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
};

Node.prototype['delete'] = function () {
    this.prev.next = this.next;
    this.next.prev = this.prev;
};

Node.prototype.addAfter = function (node) {
    var prev = this.prev;
    this.prev = node;
    node.prev = prev;
    prev.next = node;
    node.next = this;
};

Node.prototype.addBefore = function (node) {
    var next = this.next;
    this.next = node;
    node.next = next;
    next.prev = node;
    node.prev = this;
};

