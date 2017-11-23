/* global global:true,  __dirname, jasmineRequire */

/*jshint evil:true */
// reassigning causes eval to not use lexical scope.
var globalEval = eval,
    global = globalEval('this');
/*jshint evil:false */

// Bootsrap Karma
if (global.__karma__) {
    
    //jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    
    global.__karma__.loaded = function() {
        console.log('karma loaded');
    };

// Bootstrap Browser fallback
} else {

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

    // Default reporter
    jasmineEnv.addReporter(jasmineInterface.jsApiReporter);

    // Html reporter
    jasmineRequire.html(jasmine);
    var htmlReporter = new jasmine.HtmlReporter({
        env: jasmineEnv,
        getContainer: function() { return document.body; },
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); },
        timer: new jasmine.Timer()
    });
    htmlReporter.initialize();

    jasmineEnv.addReporter(htmlReporter);
}

global.queryString = function queryString(parameter) {
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
};

function injectScript(src, module, callback) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.setAttribute('data-promise-location', "../node_modules/montage-testing/node_modules/montage/node_modules/bluebird/js/browser/bluebird.js")
    script.setAttribute('data-module', module);
    script.addEventListener('load', function () {
        callback(null, module);
    });
    script.addEventListener('error', function(err) { 
        callback(err, module);
    });
    script.addEventListener('abort', function(err) {    
        callback(err, module);
    });
    document.head.appendChild(script);
}

function injectBase(href) {
    var script = document.createElement('base');
    script.href = href;
    document.head.appendChild(script);
}

injectBase('/base/test/');
injectScript('../node_modules/montage-testing/node_modules/montage/node_modules/mr/bootstrap.js', 'all', function (err) {
    if (err) {
        throw err;
    }
});
