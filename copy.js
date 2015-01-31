"use strict";

var hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = copy;
function copy(target, source) {
    for (var name in source) {
        if (hasOwnProperty.call(source, name)) {
            target[name] = source[name];
        }
    }
}
