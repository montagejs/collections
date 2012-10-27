
exports.make = makeFuzz;
function makeFuzz(length, seed, max) {
    var random = makeRandom(seed);
    var operations = [];
    var content = [];
    var previous;
    var operation;
    while (operations.length < length) {
        content.sort(function () {
            return random() - .5;
        });
        var choice = random();
        if (previous !== "delete" && content.length && choice > 2/3) {
            operation = {type: 'delete', value: content.shift()};
        } else if (previous !== "get" && content.length && choice > 1/3) {
            operation = {type: 'get', value: content[0]};
        } else if (previous !== "add")  {
            var value = Math.floor(random() * max);
            content.push(value);
            operation = {type: 'add', value: value};
        }
        operations.push(operation);
        previous = operation.type;
    }
    return operations;
}

exports.stringify = stringifyFuzz;
function stringifyFuzz(operations) {
    return operations.map(function (operation) {
        if (operation.type === "add") {
            return "+" + operation.value;
        } else if (operation.type === "delete") {
            return "-" + operation.value;
        } else if (operation.type === "get") {
            return "" + operation.value;
        }
    }).join(", ");
}

exports.parse = parseFuzz;
function parseFuzz(fuzz) {
    return fuzz.split(", ").map(function (fuzz) {
        if (fuzz[0] === "+") {
            return {type: "add", value: +fuzz};
        } else if (fuzz[0] === "-") {
            return {type: "delete", value: -fuzz};
        } else {
            return {type: "get", value: +fuzz};
        }
    });
}

exports.execute = executeFuzz;
function executeFuzz(set, operations, log) {
    operations.forEach(function (operation) {
        if (operation.type === "add") {
            set.add(operation.value);
        } else if (operation.type === "get") {
            set.get(operation.value);
        } else if (operation.type === "delete") {
            set.delete(operation.value);
        }
        if (log) {
            console.log();
            console.log(operation);
            set.log(null, function (node, write) {
                write(" " + node.value + " length=" + node.length);
            });
        }
    });
}

exports.makeRandom = makeRandom;
function makeRandom(seed) {
    return function () {
        seed = ((seed * 60271) + 70451) % 99991;
        return seed / 99991;
    }
}

