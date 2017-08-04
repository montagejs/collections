// reassigning causes eval to not use lexical scope.
var globalEval = eval,
/*jshint evil:true */
global = globalEval('this'); 
/*jshint evil:false */

Map = require("./_map");
var Array = require("./shim-array");
var Object = require("./shim-object");
var Function = require("./shim-function");
var RegExp = require("./shim-regexp");

