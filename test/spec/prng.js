
module.exports = prng;
function prng(seed) {
    return function () {
        seed = ((seed * 60271) + 70451) % 99991;
        return seed / 99991;
    }
}

