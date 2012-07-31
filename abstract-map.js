
var AbstractMap = module.exports = {};

AbstractMap.get = function (key) {
    var item = this.internal.get(new this.Item(key));
    if (item) {
        return item.value;
    }
    return this.getDefault(key);
};

AbstractMap.getDefault = function (key) {
};

AbstractMap.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.internal.get(item);
    if (found) { // update
        found.value = value;
    } else { // create
        this.internal.add(item);
    }
};

AbstractMap.add = function (value, key) {
    this.set(key, value);
};

AbstractMap.value = function (value, key) {
    this.set(key, value);
};

AbstractMap.has = function (key) {
    return this.internal.has(new this.Item(key));
};

AbstractMap['delete'] = function (key) {
    this.internal['delete'](new this.Item(key));
};

AbstractMap.wipe = function () {
    this.internal.wipe();
};

AbstractMap.reduce = function (callback, basis, thisp) {
    return this.internal.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

AbstractMap.reduceRight = function (callback, basis, thisp) {
    return this.internal.reduceRight(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

AbstractMap.keys = function () {
    return this.map(getKey);
};

function getKey(value, key) {
    return key;
}

AbstractMap.values = function () {
    return this.map(getValue);
};

function getValue(value) {
    return value;
}

AbstractMap.items = function () {
    return this.map(getItem);
};

function getItem(value, key) {
    return [key, value];
}

AbstractMap.Item = Item;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

