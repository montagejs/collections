var SortedSet = require("../sorted-set");
var SortedArraySet = require("../sorted-array-set");

var Fuzz = require("../spec/fuzz");
var iterations = 1000;
var size = 10000;

[10, 100, 100, 101, 105, 112, 125, 150, 200, 300, 500, 1000, 10000, 20000, 30000].forEach(function (size) {

    var numbers = [];
    for (var i = 0; i < size; i++) {
        numbers.push(i);
    }
    var random = Fuzz.makeRandom();
    numbers.sort(function () {
        return random() < .5;
    });

    function bench(Sorted) {
        var set = Sorted();
        for (var i = 0; i < size; i++) {
            set.add(numbers[i]);
        }
        for (var i = 0; i < size; i++) {
            set.delete(numbers[i]);
        }
    }

    function hrtime() {
        var hrtime = process.hrtime();
        return hrtime[0] * 1e3 + hrtime[1] / 1e6;
    }

    function time(callback) {
        var start = hrtime();
        callback();
        var stop = hrtime();
        return stop - start;
    };

    var sortedSetSpeed = time(function () {
        bench(SortedSet);
    });
    var sortedArraySetSpeed = time(function () {
        bench(SortedArraySet);
    });

    console.log(size + ":", (sortedSetSpeed < sortedArraySetSpeed ? "SortedSet WINS" : "SortedArraySet WINS"));
    console.log('     SortedSet:', sortedSetSpeed);
    console.log('SortedArraySet:', sortedArraySetSpeed);

});
