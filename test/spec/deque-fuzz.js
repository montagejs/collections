
var Deque = require("collections/deque");
require("collections/shim-array");
var prng = require("./prng");

exports.fuzzDeque = fuzzDeque;
function fuzzDeque(Deque) {
    describe('fuzz', function () {
        it ("should pass deque fuzz", function () {
            for (var biasWeight = .3; biasWeight < .8; biasWeight += .2) {
                for (var maxAddLength = 1; maxAddLength < 5; maxAddLength += 3) {
                    for (var seed = 0; seed < 10; seed++) {
                        var plan = makePlan(100, seed, biasWeight, maxAddLength);
                            execute(Deque, plan.ops); 
                    }
                }
            } 
        });
    });
}

exports.makePlan = makePlan;
function makePlan(length, seed, biasWeight, maxAddLength) {
    maxAddLength = maxAddLength || 1;
    var random = prng(seed);
    var ops = [];
    while (ops.length < length) {
        var bias = ops.length / length;
        var choice1 = random() * (1 - biasWeight) + bias * biasWeight;
        var choice2 = random();
        if (choice1 < 1 / (maxAddLength + 1)) {
            if (choice2 < .5) {
                ops.push(["push", makeRandomArray(1 + ~~(random() * maxAddLength - .5))]);
            } else {
                ops.push(["unshift", makeRandomArray(1 + ~~(random() * maxAddLength - .5))]);
            }
        } else {
            if (choice2 < .5) {
                ops.push(["shift", []]);
            } else {
                ops.push(["pop", []]);
            }
        }
    }
    return {
        seed: seed,
        length: length,
        biasWeight: biasWeight,
        maxAddLength: maxAddLength,
        ops: ops
    }
}

function makeRandomArray(length, random) {
    var array = [];
    for (var index = 0; index < length; index++) {
        array.push(~~(Math.random() * 100));
    }
    return array;
}

exports.execute = execute;
function execute(Collection, ops) {
    var oracle = [];
    var actual = new Collection();
    ops.forEach(function (op) {
        executeOp(oracle, op);
        executeOp(actual, op);
        if (typeof expect === "function") {
            expect(actual.toArray()).toEqual(oracle);
        } else if (!actual.toArray().equals(oracle)) {
            console.log(actual.front, actual.toArray(), oracle);
            throw new Error("Did not match after " + stringifyOp(op));
        }
    });
}

exports.executeOp = executeOp;
function executeOp(collection, op) {
    collection[op[0]].apply(collection, op[1]);
}

exports.stringify = stringify;
function stringify(ops) {
    return ops.map(stringifyOp).join(" ");
}

exports.stringifyOp = stringifyOp;
function stringifyOp(op) {
    return op[0] + "(" + op[1].join(", ") + ")";
}

