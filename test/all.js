console.log('montage-testing', 'Start');
module.exports = require("montage-testing").run(require, [
    "spec/array-spec",
	"spec/clone-spec",
	"spec/deque-spec",
	"spec/dict-spec",
	"spec/fast-map-spec",
	"spec/fast-set-spec",
	"spec/heap-spec",
	"spec/iterator-spec",
	"spec/lfu-map-spec",
	"spec/lfu-set-spec",
	"spec/list-spec",
	"spec/listen/array-changes-spec",
	"spec/listen/property-changes-spec",
	"spec/lru-map-spec",
	"spec/lru-set-spec",
	"spec/map-spec",
	"spec/multi-map-spec",
	"spec/regexp-spec",
	"spec/set-spec",
	"spec/shim-array-spec",
	"spec/shim-functions-spec",
	"spec/shim-object-spec",
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