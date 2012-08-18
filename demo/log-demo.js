
var SortedSet = require("../sorted-set");

var tree = new SortedSet();
tree.add(1);
tree.add(3);
tree.add(0);
tree.add(-3);
tree.add(2);
tree.add(-1);
tree.add(-2);
tree.get(0);

console.log("ASCII");
tree.log(SortedSet.ascii);

console.log("ASCII boxes");
tree.log(SortedSet.ascii, function (value, leader, below, above) {
    value = "" + value;
    return (
        above + ' +' + Array(value.length + 3).join("-") + "+\n" +
        leader + '-| ' + value + ' |\n' +
        below + ' +' + Array(value.length + 3).join("-") + "+"
    );
});

console.log("Unicode sharp");
tree.log(SortedSet.unicodeSharp);

console.log("Unicode round");
tree.log();

