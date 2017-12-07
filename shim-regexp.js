
if (!RegExp.escape) {
    var special = /[-[\]{}()*+?.\\^$|,#\s]/g;
    RegExp.escape = require("./operators/escape");
}

