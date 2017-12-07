console.log('montage-testing', 'Start');
module.exports = require("montage-testing").run(require, [
	"spec/shim-array-spec",
	"spec/shim-functions-spec",
	"spec/shim-object-spec",
	"spec/iterator-spec",
    "spec/array-spec",
    "spec/clone-spec",
	"spec/deque-spec",
	"spec/dict-spec",
	"spec/map-spec",
	"spec/regexp-spec",
	"spec/observable-array-spec",
	"spec/observable-map-spec",
	"spec/observable-object-spec",
	"spec/observable-range-spec",
	"spec/set-spec",
	"spec/fast-map-spec",
	"spec/fast-set-spec",
	"spec/heap-spec",
	"spec/lfu-map-spec",
	"spec/lfu-set-spec",
	"spec/list-spec",
	"spec/lru-map-spec",
	"spec/lru-set-spec",
	"spec/sorted-array-map-spec",
	"spec/sorted-array-set-spec",
	"spec/sorted-array-spec",
	"spec/sorted-map-spec",
	"spec/sorted-set-spec"
]).then(function () {
    console.log('montage-testing', 'End');
}, function (err) {
    console.log('montage-testing', 'Fail', err, err.stack);
    throw err;
});