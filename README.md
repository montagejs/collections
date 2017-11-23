
# Collections

[![Build Status](https://travis-ci.org/montagejs/collections.png?branch=master)](http://travis-ci.org/montagejs/collections)

[![Analytics](https://ga-beacon.appspot.com/UA-51771141-2/collections/readme)](https://github.com/igrigorik/ga-beacon)

This package contains JavaScript implementations of common data
structures with idiomatic iterfaces, including extensions for Array and
Object.

You can use these Node Packaged Modules with Node.js, [Browserify](https://github.com/substack/node-browserify),
[Mr](https://github.com/montagejs/mr), or any compatible CommonJS module loader.  Using a module loader
or bundler when using Collections in web browsers has the advantage of
only incorporating the modules you need.  However, you can just embed
`<script src="collections/collections.min.js">` and *all* of the
collections will be introduced as globals.  :warning:
`require("collections")` is not supported.

```
npm install collections --save
```

Documentation can be found at http://collectionsjs.com which in turn can be
updated at https://github.com/montagejs/collectionsjs.com.

## Maintenance

Tests are in the `test` directory. Use `npm test` to run the tests in
NodeJS or open `test/run.html` in a browser. 

To run the tests in your browser, simply use `npm run test:jasmine`.

To run the tests using Karma use `npm run test:karma` and for continious tests run with file changes detection `npm run test:karma-dev`. Finally to open a remote debug console on karma use `npm run test:karma-debug`.

