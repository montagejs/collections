
module.exports = SplaySet;

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
    var node = this.search(value);
    return node && this.equals(node.value, value);
};

SplaySet.prototype.get = function get(value, noSplay) {
    var node = this.search(value);
    if (node && this.equals(node.value, value)) {
        noSplay || this.splay(node);
        return node.value;
    }
};

SplaySet.prototype.add = function add(value, noSplay) {
    var node = new SplayNode(value);
    if (this.root === null) {
        this.root = node;
    } else {
        var parent = this.search(value);
        if (this.equals(parent.value, value)) {
            return;
        }
        if (parent.comparison < 0) {
            parent.setLeft(node);
        } else { // always adds duplicates to the end
            parent.setRight(node);
        }
        noSplay || this.splay(node);
    }
};

SplaySet.prototype['delete'] = function (value) {
    var node = this.search(value);
    if (!node)
        return;
    if (!this.equals(node.value, value))
        return;

    // bring the node to root so we only have to deal with
    // rotations about the root
    this.splay(node);

    if (!node.left && !node.right) {
        this.root = null;
    } else {
        if (!node.right) {
            //   n
            //  /   ->  l
            // l
            this.root = node.left;
        } else if (!node.left) {
            //   n
            //    \  ->  r
            //     r
            this.root = node.right;
        } else {
            //    n         r
            //   / \   ->    \
            //  l   r        .:.
            // .:.          /
            //             l
            var at = node.right;
            while (at.left) {
                at = at.left;
            }
            at.left = node.left;
            at.left.parent = at;
            this.root = node.right;
        }
        this.root.parent = null;
    }

};

SplaySet.prototype.search = function search(value) {
    var at = this.root;
    var next = at;

    while (next) {
        at = next;

        var comparison = this.compare(value, at.value);
        at.comparison = comparison; // remember
        if (comparison === 0) {
            // advance to the right-most node with an equal value
            while (at.right) {
                var comparison = this.compare(value, at.right.value);
                at.right.comparison = comparison;
                if (comparison !== 0) {
                    break;
                }
                at = at.right;
            }
            break;
        } else if (comparison <= 0) {
            next = at.left;
        } else {
            next = at.right;
        }
    }

    return at;
};

SplaySet.prototype.splay = function splay(node) {
    while (node !== this.root) { // implies node.parent === null
        // assert node.parent !== null
        // single zig or zag only if there is only one level of depth
        if (node.parent === this.root) {
            // assert node.parent.parent === null
            var root = this.root;

            if (node === root.left) {
                // zig
                //   r
                //  / \
                // n
                root.setLeft(node.right);
                node.setRight(root);
            } else {
                // zag
                //   r
                //  / \
                //     n
                root.setRight(node.left);
                node.setLeft(root);
            }
            this.root = node;
            this.root.parent = null;

        // if the node is two or more levels deep, rotate it up by two
        // using a combination of zig and zag
        } else {
            // assert node.parent.parent !== null

            var parent = node.parent;
            var grand = parent.parent;
            var great = grand.parent; // may be null (float to root)

            if (
                parent.left === node &&
                grand.left === parent
            ) {
                // zig-zig
                //     g
                //    / \
                //   p
                //  / \
                // n
                grand.setLeft(parent.right);
                parent.setRight(grand);
                parent.setLeft(node.right);
                node.setRight(parent);
            } else if (
                parent.right === node &&
                grand.right === parent
            ) {
                // zag-zag
                //  g
                // / \
                //    p
                //   / \
                //      n
                grand.setRight(parent.left);
                parent.setLeft(grand);
                parent.setRight(node.left);
                node.setLeft(parent);
            } else if (parent.right === node) {
                // zig-zag
                //    g
                //   / \
                //  p
                // / \
                //    n
                grand.setLeft(node.right);
                parent.setRight(node.left);
                node.setRight(grand);
                node.setLeft(parent);
            } else {
                // zag-zig
                //  g
                // / \
                //    p
                //   / \
                //  n
                grand.setRight(node.left);
                parent.setLeft(node.right);
                node.setLeft(grand);
                node.setRight(parent);
            }

            // return to the tree
            if (great) {
                //     gg
                //    /  \
                //   g
                //  -p-
                // --n--
                if (great.left === grand) {
                    //    gg
                    //   /
                    //  n
                    // p-g
                    great.left = node;
                } else {
                    //    gg
                    //      \
                    //       n
                    //      p-g
                    great.right = node;
                }
            } else { // great === null
                // so node floats to the top of the tree
                //  n
                // p-g
                this.root = node;
            }

            // great may be null if the node floats up to the root
            node.parent = great;

        }
    }
};

SplaySet.prototype.forEach = function forEach(callback, thisp) {
    this.root && this.root.forEach(callback, thisp, this);
};

SplaySet.prototype.map = function map(callback, thisp) {
    var array = [];
    this.forEach(function (value, node, tree, depth) {
        array.push(callback.call(thisp, value, node, tree, depth));
    });
    return array;
};

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
    this.parent = null;
    this.left = null;
    this.right = null;
    // the most recent comparison on this node to any key, just for
    // speed:
    this.comparison = null;
}

SplayNode.prototype.setLeft = function setLeft(node) {
    this.left = node;
    if (node) {
        node.parent = this;
    }
};

SplayNode.prototype.setRight = function setRight(node) {
    this.right = node;
    if (node) {
        node.parent = this;
    }
};

SplayNode.prototype.forEach = function forEach(callback, thisp, tree, depth) {
    depth = depth || 0;
    this.left && this.left.forEach(callback, thisp, tree, depth + 1);
    callback.call(thisp, this.value, this, tree, depth);
    this.right && this.right.forEach(callback, thisp, tree, depth + 1);
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

