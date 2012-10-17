
var AbstractMap = module.exports = {};

// all of these methods depend on the constructor providing an `contentSet`

AbstractMap.get = function (key) {
    var item = this.contentSet.get(new this.Item(key));
    if (item) {
        return item.value;
    }
    return this.getDefault(key);
};

AbstractMap.getDefault = function (key) {
};

AbstractMap.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.contentSet.get(item);
    if (found) { // update
        found.value = value;
    } else { // create
        this.contentSet.add(item);
    }
};

AbstractMap.add = function (value, key) {
    this.set(key, value);
};

AbstractMap.value = function (value, key) {
    this.set(key, value);
};

AbstractMap.has = function (key) {
    return this.contentSet.has(new this.Item(key));
};

AbstractMap['delete'] = function (key) {
    this.contentSet['delete'](new this.Item(key));
};

AbstractMap.wipe = function () {
    this.contentSet.wipe();
};

AbstractMap.reduce = function (callback, basis, thisp) {
    return this.contentSet.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

AbstractMap.reduceRight = function (callback, basis, thisp) {
    return this.contentSet.reduceRight(function (basis, item) {
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

