var WeakMap;
try {
	if(!window.WeakMap) {
		module.exports = require("weak-map");
	}
} catch (e) {
	module.exports = require("weak-map");
}
