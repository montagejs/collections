
// used exclusively to generate collections.min.js for browsers

require("./array-shim");
require("./array");

global.List = require("./list");
global.Set = require("./set");
global.Map = require("./map");
global.MultiMap = require("./multi-map");
global.SortedSet = require("./sorted-set");
global.SortedMap = require("./sorted-map");
global.LruSet = require("./lru-set");
global.LruMap = require("./lru-map");
global.FastSet = require("./fast-set");
global.FastMap = require("./fast-map");
global.WeakMap = require("./weak-map");
global.Iterator = require("./iterator");

