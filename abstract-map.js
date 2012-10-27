
var AbstractMap = module.exports = {};

// all of these methods depend on the constructor providing an `contentSet`

AbstractMap.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            // copy map-alikes
            if (typeof values.keys === "function") {
                values.forEach(function (value, key) {
                    this.set(key, value);
                }, this);
            // iterate key value pairs of other iterables
            } else {
                values.forEach(function (pair) {
                    this.set(pair[0], pair[1]);
                }, this);
            }
        } else {
            // copy other objects as map-alikes
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
    }
}

AbstractMap.get = function (key, defaultValue) {
    var item = this.contentSet.get(new this.Item(key));
    if (item) {
        return item.value;
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.content(key);
    }
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

