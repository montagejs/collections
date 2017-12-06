
// Adapted from Eloquent JavaScript by Marijn Haverbeke
// http://eloquentjavascript.net/appendix2.html

var GenericCollection = require("./generic-collection");
var ObservableObject = require("pop-observe/observable-object");
var ObservableRange = require("pop-observe/observable-range");
var ObservableMap = require("pop-observe/observable-map");
var O = require("pop-observe");
var equalsOperator = require("pop-equals");
var compareOperator = require("pop-compare");
var copy = require("./copy");

// Max Heap by default.  Comparison can be reversed to produce a Min Heap.

module.exports = Heap;

function Heap(values, equals, compare) {
    if (!(this instanceof Heap)) {
        return new Heap(values, equals, compare);
    }
    this.contentEquals = equals || equalsOperator;
    this.contentCompare = compare || compareOperator;
    this.content = [];
    this.length = 0;
    this.addEach(values);
}

Heap.Heap = Heap; // hack for MontageJS

copy(Heap.prototype, GenericCollection.prototype);
copy(Heap.prototype, ObservableObject.prototype);
copy(Heap.prototype, ObservableRange.prototype);
copy(Heap.prototype, ObservableMap.prototype);

Heap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare
    );
};

Heap.prototype.push = function (value) {
    this.content.push(value);
    this.float(this.content.length - 1);
    this.length++;
};

Heap.prototype.pop = function () {
    // Store the first value so we can return it later.  This will leave a gap
    // at index 0 that must be filled.
    var result = this.content[0];
    // Remove the value at the end of the array.  The value most be removed
    // from the end to preserve the completness of the tree, despite that the
    // last child is also among the most likely to need to sink back to the
    // bottom.
    var top = this.content.pop();
    // If there are any values remaining, put the last value on the top and
    // let it sink back down.
    if (this.content.length > 0) {
        if (this.content.set) {
            this.content.set(0, top);
        } else {
            this.content[0] = top;
        }
        this.sink(0);
    }
    this.length--;
    return result;
};

Heap.prototype.add = function (value) {
    this.push(value);
};

// indexOf must do a linear search since a binary heap does not preserve a
// strict sort order.  Thus, deletion takes linear time for all values except
// for the max value.

Heap.prototype.indexOf = function (value) {
    for (var index = 0; index < this.length; index++) {
        if (this.contentEquals(this.content[index], value)) {
            return index;
        }
    }
    return -1;
};

Heap.prototype.delete = function (value) {
    var index = this.indexOf(value);
    if (index === -1)
        return false;
    var top = this.content.pop();
    this.length = this.content.length;
    if (index === this.content.length)
        return true;
    if (this.content.set) {
        this.content.set(index, top);
    } else {
        this.content[index] = top;
    }
    var comparison = this.contentCompare(top, value);
    if (comparison > 0) {
        this.float(index);
    } else if (comparison < 0) {
        this.sink(index);
    }
    return true;
};

Heap.prototype.peek = function () {
    if (this.length) {
        return this.content[0];
    }
};

Heap.prototype.max = function () {
    return this.peek();
};

Heap.prototype.one = function () {
    return this.peek();
};

// Brings a value up until its parent is greater than it
Heap.prototype.float = function (index) {
    // Grab the value that is being adjusted
    var value = this.content[index];
    // A value can go no higher that the top: index 0
    while (index > 0) {
        // Compute the parent value's index and fetch it
        var parentIndex = Math.floor((index + 1) / 2) - 1;
        var parent = this.content[parentIndex];
        // If the parent is less than it
        if (this.contentCompare(parent, value) < 0) {
            if (this.content.set) {
                this.content.set(parentIndex, value);
                this.content.set(index, parent);
            } else {
                this.content[parentIndex] = value;
                this.content[index] = parent;
            }
        } else {
            // Stop propagating if the parent is greater than the value.
            break;
        }
        // Proceed upward
        index = parentIndex;
    }
};

// Brings a value down until its children are both less than it
Heap.prototype.sink = function (index) {
    // Moves a value downward until it is greater than its children.
    var length = this.content.length;
    var value = this.content[index];
    var left, right, leftIndex, rightIndex, swapIndex, needsSwap;

    while (true) {
        // Invariant: the value is at index.
        // Variant: the index proceedes down the tree.

        // Compute the indicies of the children.
        rightIndex = (index + 1) * 2;
        leftIndex = rightIndex - 1;

        // If the left child exists, determine whether it is greater than the
        // parent (value) and thus whether it can be floated upward.
        needsSwap = false;
        if (leftIndex < length) {
            // Look it up and compare it.
            var left = this.content[leftIndex];
            var comparison = this.contentCompare(left, value);
            // If the child is greater than the parent, it can be floated.
            if (comparison > 0) {
                swapIndex = leftIndex;
                needsSwap = true;
            }
        }

        // If the right child exists, determine whether it is greater than the
        // parent (value), or even greater than the left child.
        if (rightIndex < length) {
            var right = this.content[rightIndex];
            var comparison = this.contentCompare(right, needsSwap ? left : value);
            if (comparison > 0) {
                swapIndex = rightIndex;
                needsSwap = true;
            }
        }

        // if there is a child that is less than the value, float the child and
        // sink the value.
        if (needsSwap) {
            if (this.content.set) {
                this.content.set(index, this.content[swapIndex]);
                this.content.set(swapIndex, value);
            } else {
                this.content[index] = this.content[swapIndex];
                this.content[swapIndex] = value;
            }
            index = swapIndex;
            // and continue sinking
        } else {
            // if the children are both less than the value
            break;
        }

    }

};

Heap.prototype.clear = function () {
    this.content.clear();
    this.length = 0;
};

Heap.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    return this.content.reduce(function (basis, value, key) {
        return callback.call(thisp, basis, value, key, this);
    }, basis, this);
};

Heap.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    return this.content.reduceRight(function (basis, value, key) {
        return callback.call(thisp, basis, value, key, this);
    }, basis, this);
};

Heap.prototype.makeMapChangesObservable = function () {
    this.makeChangesObservable();
    this.dispatchesMapChanges = true;
};

Heap.prototype.makeRangeChangesObservable = function () {
    this.makeChangesObservable();
    this.dispatchesRangeChanges = true;
};

Heap.prototype.makeChangesObservable = function () {
    if (this.dispatchesChanges) {
        return;
    }
    O.observeMapChange(this.content, this, "content");
    O.observeMapWillChange(this.content, this, "content");
    this.dispatchesChanges = true;
};

Heap.prototype.handleContentRangeChange = function (plus, minus, index) {
    this.dispatchRangeChange(plus, minus, index);
};

Heap.prototype.handleContentRangeWillChange = function (plus, minus, index) {
    this.dispatchRangeWillChange(plus, minus, index);
};

Heap.prototype.handleContentMapChange = function (plus, minus, key, type) {
    this.dispatchMapChange(type, key, plus, minus);
};

Heap.prototype.handleContentMapWillChange = function (plus, minus, key, type) {
    this.dispatchMapWillChange(type, key, plus, minus);
};

