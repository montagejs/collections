
module.exports = SplaySet;

var Iterable = require("./iterable");

function SplaySet(copy, equals, compare) {
    this.equals = equals || Object.equals || SplaySet.equals;
    this.compare = compare || Object.compare || SplaySet.compare;
    this.root = null;
    if (copy) {
        copy.forEach(this.add, this);
    }
}

SplaySet.equals = function (a, b) {
    return a === b;
};

SplaySet.compare = function (a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
};

SplaySet.prototype.has = function has(value) {
    if (this.root) {
        this.splay(value);
        return this.equals(value, this.root.value);
    } else {
        return false;
    }
};

SplaySet.prototype.get = function get(value) {
    if (this.root) {
        this.splay(value);
        if (this.equals(value, this.root.value)) {
            return this.root.value;
        }
    }
};

SplaySet.prototype.add = function add(value) {
    var node = new SplayNode(value);
    if (this.root) {
        this.splay(value);
        if (!this.equals(value, this.root.value)) {
            if (this.compare(value, this.root.value) < 0) {
                // rotate right
                node.right = this.root;
                node.left = this.root.left;
                this.root.left = null;
            } else {
                // rotate left
                node.left = this.root;
                node.right = this.root.right;
                this.root.right = null;
            }
            this.root = node;
        }
    } else {
        this.root = node;
    }
};

SplaySet.prototype['delete'] = function (value) {
    if (this.root) {
        this.splay(value);
        if (this.equals(value, this.root.value)) {
            if (!this.root.left) {
                this.root = this.root.right;
            } else {
                // remove the right side of the tree,
                var right = this.root.right;
                this.root = this.root.left;
                // the tree now only contains the left side of the tree, so all
                // values are less than the value deleted.
                // splay so that the root has an empty right child
                this.splay(value);
                // put the right side of the tree back
                this.root.right = right;
            }
        }
    }
};

SplaySet.prototype.find = function find(value) {
    if (this.root) {
        this.splay(value);
        if (this.equals(value, this.root.value)) {
            return this.root;
        }
    }
};

SplaySet.prototype.one = function () {
    if (!this.root) {
        throw new Error("Can't get one value from empty set");
    }
    return this.root.value;
};

SplaySet.prototype.only = function () {
    if (!this.root) {
        throw new Error("Can't get only value in empty set");
    }
    if (this.root.left || this.root.right) {
        throw new Error("Can't get only value in set with multiple values");
    }
    return this.root.value;
};

SplaySet.prototype.sorted = function (compare, by, order) {
    compare = Comparator(compare || this.compare, by, order);
    return new SplaySet(this, compare, this.equals);
};

SplaySet.prototype.clone = function (depth, memo) {
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    return new SplaySet(this.map(function (value) {
        return Object.clone(value, depth - 1, memo);
    }));
};

SplaySet.prototype.wipe = function () {
    this.root = null;
};

// This is the simplified top-down splaying algorithm from: "Self-adjusting
// Binary Search Trees" by Sleator and Tarjan
SplaySet.prototype.splay = function splay(value) {
    var stub, left, right, temp, root;

    if (!this.root) {
        return;
    }

    stub = left = right = new SplayNode();
    root = this.root;

    while (true) {
        var comparison = this.compare(value, root.value);
        if (comparison < 0) {
            if (root.left) {
                if (this.compare(value, root.left.value) < 0) {
                    // rotate right
                    temp = root.left;
                    root.left = temp.right;
                    temp.right = root;
                    root = temp;
                    if (!root.left) {
                        break;
                    }
                }
                // link right
                right.left = root;
                right = root;
                root = root.left;
            } else {
                break;
            }
        } else if (comparison > 0) {
            if (root.right) {
                if (this.compare(value, root.right.value) > 0) {
                    // rotate left
                    temp = root.right;
                    root.right = temp.left;
                    temp.left = root;
                    root = temp;
                    if (!root.right) {
                        break;
                    }
                }
                // link left
                left.right = root;
                left = root;
                root = root.right;
            } else {
                break;
            }
        } else { // equal or incomparable
            break;
        }
    }

    // assemble
    left.right = root.left;
    right.left = root.right;
    root.left = stub.right;
    root.right = stub.left;
    this.root = root;

};

SplaySet.prototype.reduce = function reduce(callback, basis, thisp) {
    if (this.root) {
        basis = this.root.reduce(callback, basis, thisp, this);
    }
    return basis;
};

SplaySet.prototype.reduceRight = function reduce(callback, basis, thisp) {
    if (this.root) {
        basis = this.root.reduceRight(callback, basis, thisp, this);
    }
    return basis;
};

SplaySet.prototype.forEach = Iterable.forEach;
SplaySet.prototype.map = Iterable.map;
SplaySet.prototype.filter = Iterable.filter;
SplaySet.prototype.every = Iterable.every;
SplaySet.prototype.some = Iterable.some;
SplaySet.prototype.all = Iterable.all;
SplaySet.prototype.any = Iterable.any;
SplaySet.prototype.min = Iterable.min;
SplaySet.prototype.max = Iterable.max;
SplaySet.prototype.count = Iterable.count;
SplaySet.prototype.sum = Iterable.sum;
SplaySet.prototype.average = Iterable.average;
SplaySet.prototype.flatten = Iterable.flatten;

SplaySet.prototype.values = function values() {
    return this.map(function (value) {
        return value;
    });
};

SplaySet.prototype.log = function log(charmap, stringify) {
    charmap = charmap || SplaySet.unicodeRound;
    stringify = stringify || SplaySet.stringify;
    if (this.root) {
        this.root.log(charmap, stringify);
    }
};

SplaySet.stringify = function stringify(value, leader, below, above) {
    return leader + " " + value;
};

SplaySet.unicodeRound = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u256d", // round corner
    fromAbove: "\u2570", // round corner
    strafe: "\u2503"
};

SplaySet.unicodeSharp = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u250f", // sharp corner
    fromAbove: "\u2517", // sharp corner
    strafe: "\u2503"
};

SplaySet.ascii = {
    intersection: "+",
    through: "-",
    branchUp: "+",
    branchDown: "+",
    fromBelow: ".",
    fromAbove: "'",
    strafe: "|"
};

function SplayNode(value) {
    this.value = value;
    this.left = null;
    this.right = null;
}

// TODO case where no basis is provided for reduction

SplayNode.prototype.reduce = function reduce(callback, basis, thisp, tree, depth) {
    depth = depth || 0;
    if (this.left) {
        basis = this.left.reduce(callback, basis, thisp, tree, depth + 1);
    }
    basis = callback.call(thisp, basis, this.value, this, tree, depth);
    if (this.right) {
        basis = this.right.reduce(callback, basis, thisp, tree, depth + 1);
    }
    return basis;
};

SplayNode.prototype.reduceRight = function reduce(callback, basis, thisp, tree, depth) {
    depth = depth || 0;
    if (this.right) {
        basis = this.right.reduce(callback, basis, thisp, tree, depth + 1);
    }
    basis = callback.call(thisp, basis, this.value, this, tree, depth);
    if (this.left) {
        basis = this.left.reduce(callback, basis, thisp, tree, depth + 1);
    }
    return basis;
};


SplayNode.prototype.log = function log(charmap, stringify, leader, above, below) {
    leader = leader || "";
    above = above || "";
    below = below || "";

    var branch;
    if (this.left && this.right) {
        branch = charmap.intersection;
    } else if (this.left) {
        branch = charmap.branchUp;
    } else if (this.right) {
        branch = charmap.branchDown;
    } else {
        branch = charmap.through;
    }

    this.left && this.left.log(
        charmap,
        stringify,
        above + charmap.fromBelow + charmap.through,
        above + "  ",
        above + charmap.strafe + " "
    );
    console.log(
        stringify(
            this.value,
            leader + branch,
            below + (this.right ? charmap.strafe : " "),
            above + (this.left ? charmap.strafe : " ")
        )
    );
    this.right && this.right.log(
        charmap,
        stringify,
        below + charmap.fromAbove + charmap.through,
        below + charmap.strafe + " ",
        below + "  "
    );
};

