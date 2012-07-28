
var Iterable = module.exports = {};

Iterable.reduce = function (basis, callback, thisp) {
    var iterator = this.iterate();
    try {
        while (true) {
            var value = iterator.next();
            basis = callback.call(thisp, basis, value, null, this);
        }
    } catch (exception) {
        if (isStopIteration(exception)) {
            return basis;
        } else {
            throw exception;
        }
    }
};

Iterable.forEach = function forEach(callback, thisp) {
    return this.reduce(function (basis, value, key, object, depth) {
        callback.call(thisp, value, key, object, depth);
    }, null);
};

Iterable.map = function map(callback, thisp) {
    var result = [];
    this.reduce(function (ignore, value, key, object, depth) {
        result.push(callback.call(thisp, value, key, object, depth));
    }, null);
    return result;
};

Iterable.filter = function filter(callback, thisp) {
    var result = [];
    this.reduce(result, function (basis, value, key, object, depth) {
        if (callback.call(thisp, value, key, object, depth)) {
            result.push(value);
        }
    });
    return result;
};

Iterable.every = function every(callback, thisp) {
    return this.reduce(true, function (basis, value, key, object, depth) {
        return basis && callback.call(thisp, value, key, object, depth);
    });
};

Iterable.some = function some(callback, thisp) {
    return this.reduce(false, function (basis, value, key, object, depth) {
        return basis || callback.call(thisp, value, key, object, depth);
    });
};

Iterable.all = function all() {
    return this.every(Boolean);
};

Iterable.any = function any() {
    return this.some(Boolean);
};

Iterable.min = function min(compare) {
    compare = this.compare || Object.compare || this.constructor.compare;
    return this.reduce(function (basis, value) {
        return compare(value, basis) < 0 ? value : basis;
    }, Infinity);
};

Iterable.max = function max(compare) {
    compare = this.compare || Object.compare || this.constructor.compare;
    return this.reduce(function (basis, value) {
        return compare(value, basis) > 0 ? value : basis;
    }, -Infinity);
};

Iterable.count = function count(basis) {
    basis = basis || 0;
    return this.reduce(function (basis) {
        return basis + 1;
    }, basis);
};

Iterable.sum = function sum(basis) {
    basis = basis || 0;
    return this.reduce(function (basis, value) {
        return basis + value;
    }, basis);
};

Iterable.average = function average(basis) {
    return this.sum(basis) / this.count(basis);
};

Iterable.flatten = function flatten() {
    return this.reduce(function (flat, row) {
        row.forEach(function (value) {
            flat.push(value);
        });
        return flat;
    }, []);
};

// equals
// compare
// zip
// enumerate

