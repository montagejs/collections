
module.exports = addEach;
function addEach(target, source, overrides) {
    var overridesExistingProperty = arguments.length === 3 ? overrides : true;
    if (!source) {
    } else if (typeof source.forEach === "function" && !source.hasOwnProperty("forEach")) {
        // copy map-alikes
        if (source.isMap === true) {
            source.forEach(function (value, key) {
                target[key] = value;
            });
        // iterate key value pairs of other iterables
        } else {
            source.forEach(function (pair) {
                target[pair[0]] = pair[1];
            });
        }
    } else if (typeof source.length === "number") {
        // arguments, strings
        for (var index = 0; index < source.length; index++) {
            target[index] = source[index];
        }
    } else {
        // copy other objects as map-alikes
        for(var keys = Object.keys(source), i = 0, key;(key = keys[i]); i++) {
            if(overridesExistingProperty || !Object.owns(target,key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}
