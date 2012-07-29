
exports.equals = function (a, b) {
    return a === b;
};

exports.compare = function (a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
};

exports.hash = function (object) {
    if (Object(object) === object && typeof object.hash === "function") {
        return "" + object.hash();
    } else {
        return "" + object;
    }
};

