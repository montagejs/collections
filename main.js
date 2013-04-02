//
// Main bootstrap for collections
//
var collections = module.exports = {};

collections.List = require("./list");
collections.Set = require("./set");
collections.Map = require("./map");
collections.MultiMap = require("./multi-map");
collections.WeakMap = require("./weak-map");
collections.SortedSet = require("./sorted-set");
collections.SortedMap = require("./sorted-map");
collections.LruSet = require("./lru-set");
collections.LruMap = require("./lru-map");
collections.SortedArray = require("./sorted-array");
collections.SortedArraySet = require("./sorted-array-set");
collections.SortedArrayMap = require("./sorted-array-map");
collections.FastSet = require("./fast-set");
collections.FastMap = require("./fast-map");
collections.Dict = require("./dict");
collections.Iterator = require("./iterator");
