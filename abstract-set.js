
var AbstractSet = exports;

AbstractSet.union = function (that) {
    var union =  this.constructClone(this);
    union.addEach(that);
    return union;
};

AbstractSet.intersection = function (that) {
    return this.constructClone(this.filter(function (value) {
        return that.has(value);
    }));
};

AbstractSet.difference = function (that) {
    var union =  this.constructClone(this);
    union.deleteEach(that);
    return union;
};

AbstractSet.symmetricDifference = function (that) {
    var union = this.union(that);
    var intersection = this.intersection(that);
    return union.difference(intersection);
};

AbstractSet.equals = function (that) {
    var self = this;
    return (
        Object.can(that, "reduce") &&
        this.length === that.length &&
        that.reduce(function (equals, value) {
            return equals && self.has(value);
        }, true)
    );
};

