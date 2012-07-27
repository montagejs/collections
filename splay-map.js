
var SplaySet = require("./splay-set");

module.exports = SplayMap;

function SplayMap(copy, equals, compare) {
    equals = equals || SplaySet.equals || Object.equals;
    compare = compare || SplaySet.compare || Object.compare;
    this.internal = new SplaySet(
        null,
        function (a, b) {
            return equals(a.key, b.key);
        },
        function (a, b) {
            return compare(a.key, b.key);
        }
    );
    if (copy) {
        // use Object.forEach sham if available
        if (Object.forEach) {
            Object.forEach(copy, function (value, key) {
                this.set(key, value);
            }, this);
        } else {
            copy.forEach(function (value, key) {
                this.set(key, value);
            }, this);
        }
    }
}

SplayMap.prototype.get = function (key) {
    var entry = this.internal.get(new SplayEntry(key));
    return entry && entry.value;
};

SplayMap.prototype.set = function (key, value) {
    var entry = new SplayEntry(key, value);
    var found = this.internal.get(entry);
    if (found) { // update
        found.value = value;
    } else { // create
        this.internal.add(entry);
    }
};

SplayMap.prototype.has = function (key) {
    return this.internal.has(new SplayEntry(key));
};

SplayMap.prototype['delete'] = function (key) {
    this.internal['delete'](new SplayEntry(key));
};

SplayMap.prototype.forEach = function (callback, thisp) {
    this.internal.forEach(function (pair) {
        callback.call(thisp, pair.value, pair.key, this);
    }, this);
};

SplayMap.prototype.map = function (callback, thisp) {
    return this.internal.map(function (pair) {
        return callback.call(thisp, pair.value, pair.key, this);
    }, this);
};

SplayMap.prototype.log = function (stringifyEntry, charmap) {
    this.internal.log(function (entry, leader) {
        return leader + ' ' + entry.key + ': ' + entry.value;
    })
};

function SplayEntry(key, value) {
    this.key = key;
    this.value = value;
}

