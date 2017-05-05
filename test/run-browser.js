/* global global:true,  __dirname, jasmineRequire */

/*jshint evil:true */
// reassigning causes eval to not use lexical scope.
var globalEval = eval,
    global = globalEval('this');
/*jshint evil:false */

// Init
var jasmine = jasmineRequire.core(jasmineRequire);
var jasmineEnv = jasmine.getEnv();

// Export interface
var jasmineInterface = jasmineRequire.interface(jasmine, jasmineEnv);
global.jasmine = jasmine;
for (var property in jasmineInterface) {
    if (jasmineInterface.hasOwnProperty(property)) {
       global[property] = jasmineInterface[property];
    }
}   

//
// Init Reporter
//

function queryString(parameter) {
    var i, key, value, equalSign;
    var loc = location.search.substring(1, location.search.length);
    var params = loc.split('&');
    for (i=0; i<params.length;i++) {
        equalSign = params[i].indexOf('=');
        if (equalSign < 0) {
            key = params[i];
            if (key === parameter) {
                value = true;
                break;
            }
        }
        else {
            key = params[i].substring(0, equalSign);
            if (key === parameter) {
                value = decodeURIComponent(params[i].substring(equalSign+1));
                break;
            }
        }
    }
    return value;
}

function insertParam(key, value) {
    key = encodeURI(key); 
    value = encodeURI(value);

    var param,
        params = document.location.search.substr(1).split('&'),
        i = params.length; 

    while(i--)  {
        param = params[i].split('=');

        if (param[0] === key) {
            param[1] = value;
            params[i] = param.join('=');
            break;
        }
    }

    if (i < 0) {
        params[params.length] = [key, value].join('=');
    }

    //this will reload the page, it's likely better to store this until finished
    document.location.search = params.join('&'); 
}

// Default reporter
jasmineEnv.addReporter(jasmineInterface.jsApiReporter);

var catchingExceptions = queryString("catch");
jasmineEnv.catchExceptions(catchingExceptions === "false" ? false : true);

var queryString2 = new jasmineRequire.QueryString(jasmine)({
    getWindowLocation: function() { return window.location; }
});

// Html reporter
jasmineRequire.html(jasmine);
var htmlReporter = new jasmine.HtmlReporter({
    env: jasmineEnv,
    queryString: queryString2,
    onRaiseExceptionsClick: function() { 
        insertParam("catch", !jasmineEnv.catchingExceptions()); 
    },
    getContainer: function() { return document.body; },
    createElement: function() { return document.createElement.apply(document, arguments); },
    createTextNode: function() { return document.createTextNode.apply(document, arguments); },
    timer: new jasmine.Timer()
});
htmlReporter.initialize();
jasmineEnv.addReporter(htmlReporter);


// Filter which specs will be run by matching the start of the full name against the `spec` query param.
var specFilter = new jasmine.HtmlSpecFilter({
    filterString: function() { 
        return queryString("spec"); 
    }
});

jasmineEnv.specFilter = function(spec) {
    return specFilter.matches(spec.getFullName());
};