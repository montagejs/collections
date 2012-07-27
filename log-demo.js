
var SplaySet = require("./splay-set");

var tree = new SplaySet();
tree.add(1);
tree.add(3);
tree.add(0);
tree.add(-3);
tree.add(2);
tree.add(-1);
tree.add(-2);
tree.get(0);

console.log("ASCII");
tree.log(SplaySet.ascii);

console.log("ASCII boxes");
tree.log(SplaySet.ascii, function (value, leader, below, above) {
    value = "" + value;
    return (
        above + ' +' + Array(value.length + 3).join("-") + "+\n" +
        leader + '-| ' + value + ' |\n' +
        below + ' +' + Array(value.length + 3).join("-") + "+"
    );
});

console.log("Unicode sharp");
tree.log(SplaySet.unicodeSharp);

console.log("Unicode round");
tree.log();

