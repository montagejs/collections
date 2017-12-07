
/**
    Removes all properties owned by this object making the object suitable for
    reuse.

    @function external:Object.clear
    @returns this
*/
module.exports = clear;
function clear(object) {
    if (object && typeof object.clear === "function") {
        object.clear();
    } else {
        var keys = Object.keys(object),
            i = keys.length;
        while (i) {
            i--;
            delete object[keys[i]];
        }
    }
    return object;
}

