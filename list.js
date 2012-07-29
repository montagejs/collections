
module.exports = List;

var Reducible = require("./reducible");
var Operators = require("./operators");

function List(copy, equals) {
    var head = this.head = new this.Node();
    head.next = head;
    head.prev = head;
    this.equals = equals || this.equals || Object.equals || Operators.equals;
    if (copy) {
        copy.forEach(this.add, this);
    }
}


List.prototype.find = function find(value) {
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        if (this.equals(at.value, value)) {
            return at;
        }
        at = at.next;
    }
};

List.prototype.findLast = function (value) {
    var head = this.head;
    var at = head.prev;
    while (at !== head) {
        if (this.equals(at.value, value)) {
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
};

List.prototype['delete'] = function (value) {
    var found = this.find(value);
    if (found) {
        found['delete']();
    }
};

List.prototype.add = function add(value) {
    this.head.addAfter(new this.Node(value));
};

List.prototype.push = function () {
    var head = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var node = new this.Node(arguments[i]);
        head.addAfter(node);
    }
};

List.prototype.unshift = function () {
    var at = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var node = new this.Node(arguments[i]);
        at.addBefore(node);
        at = node;
    }
};

List.prototype.pop = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        head.prev['delete']();
    }
    return value;
};

List.prototype.shift = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        head.prev['delete']();
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
    for (var i = 0; i < plus.length; i++) {
        var node = new this.Node(plus[i]);
        at.addAfter(node);
    }
    return swapped;
};

List.prototype.iterate = function () {
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

List.prototype.reduce = function (callback, basis, thisp) {
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.next;
    }
    return basis;
};

List.prototype.forEach = Reducible.forEach;
List.prototype.map = Reducible.map;
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

