
var special = /[-[\]{}()*+?.\\^$|,#\s]/g;

module.exports = escape;

/**
 * accepts a string; returns the string with regex metacharacters escaped.  the
 * returned string can safely be used within a regex to match a literal string.
 * escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $, |, #,
 * [comma], and whitespace.
 */
function escape(string) {
    return string.replace(special, "\\$&");
}

