
function getValueOf(value) {
    if (Object(value) === value && typeof value.valueOf === "function") {
        value = value.valueOf();
    }
    return value;
}

exports.equals = function (a, b) {
    a = getValueOf(a);
    b = getValueOf(b);
    if (a === b) {
        // 0 === -0, but they are not equal
        return a !== 0 || 1 / a === 1 / b;
    }
    if (Object(a) === a && typeof a.equals === "function") {
        return a.equals(b);
    }
    if (Object(b) === b && typeof b.equals === "function") {
        return b.equals(a);
    }
    // NaN !== NaN, but they are equal.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    return a !== a && b !== b;
};

exports.compare = function (a, b) {
    a = getValueOf(a);
    b = getValueOf(b);
    if (Object(a) === a && typeof a.compare === "function") {
        return a.compare(b);
    }
    if (Object(b) === b && typeof b.compare === "function") {
        return -b.compare(a);
    }
    if (typeof a !== typeof b) {
        return 0;
    }
    return a > b ? 1 : a < b ? -1 : 0;
};

exports.hash = function (object) {
    if (Object(object) === object && typeof object.hash === "function") {
        return "" + object.hash();
    } else {
        return "" + object;
    }
};

