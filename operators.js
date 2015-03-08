
require("regexp-escape");
var equals = require("pop-equals");
var compare = require("pop-compare");

// from highest to lowest precedence

exports.toNumber = toNumber;
function toNumber(value) {
    if (typeof value === "string" || typeof value === "number") {
        return +value;
    }
}

exports.toString = toString;
function toString(value) {
    if (typeof value === "string" || typeof value === "number") {
        return "" + value;
    }
}

exports.toArray = function toArray(array) {
    return Array.prototype.slice.call(array);
};

exports.not = not;
function not(value) {
    return !value;
};

exports.neg = neg;
function neg(n) {
    return -n;
}

exports.pow = pow;
function pow(a, b) {
    return Math.pow(a, b);
}

exports.root = root;
function root(a, b) {
    return Math.pow(a, 1 / b);
}

exports.log = log;
function log(a, b) {
    return Math.log(a) / Math.log(b);
}

exports.mul = mul;
function mul(a, b) {
    return a * b;
}

exports.div = div;
function div(a, b) {
    return a / b;
}

exports.mod = mod;
function mod(a, b) {
    return ((a % b) + b) % b;
}

exports.rem = rem;
function rem(a, b) {
    return a % b;
}

exports.add = add;
function add(a, b) {
    return a + b;
}

exports.sub = sub;
function sub(a, b) {
    return a - b;
}

exports.ceil = ceil;
function ceil(n) {
    if (typeof n === "number") {
        return Math.ceil(n);
    }
}

exports.floor = floor;
function floor(n) {
    if (typeof n === "number") {
        return Math.floor(n);
    }
}

exports.round = round;
function round(n) {
    if (typeof n === "number") {
        return Math.round(n);
    }
}

exports.lessThan = lessThan;
function lessThan(a, b) {
    return compare(a, b) < 0;
}

exports.greaterThan = greaterThan;
function greaterThan(a, b) {
    return compare(a, b) > 0;
}

exports.lessThanOrEqual = lessThanOrEqual;
function lessThanOrEqual(a, b) {
    return compare(a, b) <= 0;
}

exports.greaterThanOrEqual = greaterThanOrEqual;
function greaterThanOrEqual(a, b) {
    return compare(a, b) >= 0;
}

/**
    Returns whether two values are identical.  Any value is identical to itself
    and only itself.  This is much more restictive than equivalence and subtly
    different than strict equality, <code>===</code> because of edge cases
    including negative zero and <code>NaN</code>.  Identity is useful for
    resolving collisions among keys in a mapping where the domain is any value.
    This method does not delgate to any method on an object and cannot be
    overridden.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:egal
    @param {Any} this
    @param {Any} that
    @returns {Boolean} whether this and that are identical
*/
exports.is = is;
function is(a, b) {
    if (a === b) {
        // 0 === -0, but they are not identical
        return a !== 0 || 1 / a === 1 / b;
    }
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if a !== a,
    // then a is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    return a !== a && b !== b;
}

exports.equals = equals;

exports.compare = compare;

exports.and = and;
function and(a, b) {
    return a && b;
}

exports.or = or;
function or(a, b) {
    return a || b;
}

exports.defined = defined;
function defined(value) {
    return value != null;
}

// "startsWith", "endsWith", and "contains"  are overridden in
// complile-observer so they can precompile the regular expression and reuse it
// in each reaction.

exports.startsWith = startsWith;
function startsWith(a, b) {
    var expression = new RegExp("^" + RegExp.escape(b));
    return expression.test(a);
}

exports.endsWith = endsWith;
function endsWith(a, b) {
    var expression = new RegExp(RegExp.escape(b) + "$");
    return expression.test(a);
}

exports.contains = contains;
function contains(a, b) {
    var expression = new RegExp(RegExp.escape(b));
    return expression.test(a);
}

exports.join = join;
function join(a, b) {
    return a.join(b || "");
}

exports.split = split;
function split(a, b) {
    return a.split(b || "");
}

exports.range = range;
function range(stop) {
    var range = [];
    for (var start = 0; start < stop; start++) {
        range.push(start);
    }
    return range;
}

exports.clone = require("pop-clone");

function isObject(object) {
    return object && typeof object === "object";
}

function valueOf(value) {
    if (value && typeof value.valueOf === "function") {
        value = value.valueOf();
    }
    return value;
}

