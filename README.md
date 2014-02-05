[![Build Status](https://travis-ci.org/montagejs/collections.png?branch=master)](http://travis-ci.org/montagejs/collections)

# Collections

This package contains JavaScript implementations of common data
structures with idiomatic iterfaces, including extensions for Array and
Object.

You can use these Node Packaged Modules with Node.js, [Browserify][], [Mr][],
[Mop][], or any compatible CommonJS module loader.  Using a module loader or
bundler when using Collections in web browsers has the advantage of only
incorporating the modules you need.

```
npm install collections --save
```

[Browserify]: https://github.com/substack/node-browserify
[Mr]: https://github.com/montagejs/mr
[Mop]: https://github.com/montagejs/mop


## Collections

### List(values, equals, getDefault)

```javascript
var List = require("collections/list");
```

An ordered collection of values with fast insertion and deletion and
forward and backward traversal and splicing, backed by a cyclic doubly
linked list with a head node.  Lists support most of the Array
interface, except that they use and return nodes instead of integer
indicies in analogous functions.

Lists have a `head` `Node`. The node type is available as `Node` on
the list prototype and can be overridden by inheritors.  Each node has
`prev` and `next` properties.

### Deque(values, capacity)

```javascript
var Deque = require("collections/deque");
```

An ordered collection of values with fast insertion and deletion and
forward and backward traversal, backed by a circular buffer that
doubles its capacity at need. Deques support most of the Array
interface. A Deque is generally faster and produces less garbage
collector churn than a List, but does not support fast splicing.

### Set(values, equals, hash, getDefault)

```javascript
var Set = require("collections/set");
```

A collection of unique values.  The set can be iterated in the order
of insertion.  With a good hash function for the stored values,
insertion and removal are fast regardless of the size of the
collection.  Values may be objects.  The `equals` and `hash`
functions can be overridden to provide alternate definitions of
"unique".  `Set` is backed by `FastSet` and `List`.

### Map(map, equals, hash, getDefault)

```javascript
var Map = require("collections/map");
```

A collection of key and value entries with unique keys.  Keys may be
objects.  The collection iterates in the order of insertion.  `Map`
is backed by `Set`.

### MultiMap(map, getDefault, equals, hash)

```javascript
var MultiMap = require("collections/multi-map");
```

A collection of keys mapped to collections of values.  The default
`getDefault` collection is an `Array`, but it can be a `List` or any
other array-like object.  `MultiMap` inherits `Map` but overrides
the `getDefault(key)` provider.

### WeakMap()

```javascript
var WeakMap = require("collections/weak-map");
```

A non-iterable collection of key value pairs.  Keys must objects and
do not benefit from `hash` functions.  Some engines already
implement `WeakMap`.  The non-iterable requirement makes it possible
for weak maps to collect garbage when the key is no longer
available, without betraying when the key is collected.  The shimmed
implementation undetectably annotates the given key and thus does
not necessarily leak memory, but cannot collect certain reference
graphs.  This WeakMap shim was implemented by Mark Miller of Google.

### SortedSet(values, equals, compare, getDefault)

```javascript
var SortedSet = require("collections/sorted-set");
```

A collection of unique values stored in stored order, backed by a
splay tree.  The `equals` and `compare` functions can be overridden
to provide alternate definitions of "unique".

The `compare` method *must* provide a total order of all unique
values.  That is, if `compare(a, b) === 0`, it *must* follow that
`equals(a, b)`.

### SortedMap(map, equals, compare, getDefault)

```javascript
var SortedMap = require("collections/sorted-map");
```

A collection of key value pairs stored in sorted order.  `SortedMap`
is backed by `SortedSet` and the `GenericMap` mixin.

### LruSet(values, maxLength, equals, hash, getDefault)

```javascript
var LruSet = require("collections/lru-set");
```

A cache with the Least-Recently-Used strategy for truncating its
content when it’s length exceeds `maxLength`.  `LruSet` is backed by
a `Set` and takes advantage of the already tracked insertion order.
Both getting and setting a value constitute usage, but checking
whether the set has a value and iterating values do not.

### LruMap(map, maxLength, equals, hash, getDefault)

```javascript
var LruMap = require("collections/lru-map");
```

A cache of entries backed by an `LruSet`.

### SortedArray(values, equals, compare, getDefault)

```javascript
var SortedArray = require("collections/sorted-array");
```

A collection of values stored in a stable sorted order, backed by an
array.

### SortedArraySet(values, equals, compare, getDefault)

```javascript
var SortedArraySet = require("collections/sorted-array-set");
```

A collection of unique values stored in sorted order, backed by a
plain array.  If the given values are an actual array, the sorted
array set takes ownership of that array and retains its content.  A
sorted array set performs better than a sorted set when it has
roughly less than 100 values.

### SortedArrayMap(values, equals, compare, getDefault)

```javascript
var SortedArrayMap = require("collections/sorted-array-map");
```

A collection of key value pairs stored in sorted order, backed by a
sorted array set.

### FastSet(values, equals, hash, getDefault)

```javascript
var FastSet = require("collections/fast-set");
```

A collection of unique values stored like a hash table.  The
underlying storage is a `Dict` that maps hashes to lists of values
that share the same hash.  Values may be objects.  The `equals` and
`hash` functions can be overridden to provide alternate definitions
of "unique".

### FastMap(map, equals, hash, getDefault)

```javascript
var FastMap = require("collections/fast-map");
```

A collection of key and value entries with unique keys, backed by a
set.  Keys may be objects.  `FastMap` is backed by `FastSet` and the
`GenericMap` mixin.

### Dict(values, getDefault)

```javascript
var Dict = require("collections/dict");
```

A collection of string to value mappings backed by a plain
JavaScript object.  The keys are mangled to prevent collisions with
JavaScript properties.

### Heap(values, equals, compare)

```javascript
var Heap = require("collections/heap");
```

A collection that can always quickly (constant time) report its
largest value, with reasonable performance for incremental changes
(logarithmic), using a contiguous array as its backing storage.
However, it does not track the sorted order of its elements.

### Iterator(iterable)

```javascript
var Iterator = require("collections/iterator");
```

A wrapper for any iterable that implements `iterate` or iterator the
implements `next`, providing a rich lazy traversal interface.


### Array

```javascript
require("collections/shim-array");
```

An ordered collection of values with fast random access, push, and
pop, but slow splice. The `array` module provides extensions so it
hosts all the expressiveness of other collections.  The `shim-array`
module shims EcmaScript 5 methods onto the array prototype if they
are not natively implemented.

### Object

```javascript
require("collections/shim-object");
```

Can be used as a mapping of owned string keys to arbitrary values.
The `object` module provides extensions for the `Object` constructor
that support the map collection interface and can delegate to
methods of collections, allowing them to gracefully handle both
object literals and collections.

## Constructor Arguments

For all of these constructors, the argument `values` is an optional
collection of initial values, and may be an array.  If the `values` are
in a map collection, the the values are taken, but the keys are ignored.

### map

The `map` argument is an optional collection to copy shallowly into
the new mapping.  The `map` may be an object literal.  If `map`
implements `keys`, it is treated as a mapping itself and copied.
Otherwise, if `map` implements `forEach`, it may be any collection
of `[key, value]` pairs.

`equals(x, y)`, `compare(x, y)`, and `hash(value)` are all optional
arguments overriding the meaning of equality, comparability, and
consistent hashing for the purposes of the collection.  `equals` must
return a boolean.  `compare` must return an integer with the same
relationship to zero as x to y.  `hash` should consistently return the
same string for any given object.

### equals(x, y)

The default `equals` operator is implemented in terms of `===`, but
treats `NaN` as equal to itself and `-0` as distinct from `+0`.  It
also delegates to an `equals` method of either the left or right
argument if one exists.  The default equality operator is shimmed as
`Object.equals`.

### compare(x, y)

The default `compare` operator is implemented in terms of `<` and
`>`.  It delegates to the `compare` method of either the left or
right argument if one exists.  It inverts the result if it uses the
falls to the right argument.  The default comparator is shimmed as
`Object.compare`.

### hash(value)

The default `hash` operator uses `toString` for values and provides
a [Unique Label][] for arbitrary objects.  The default hash is
shimmed as `Object.hash`.

[Unique Label]: (http://wiki.ecmascript.org/doku.php?id=harmony:weak_maps#unique_labeler)

### getDefault(key or value)

The default `getDefault` function is `Function.noop`, which returns
`undefined`.  The fallback function is used when you `get` a
nonexistant value from any collection.  The `getDefault` function
becomes a member of the collection object, so `getDefault` is called
with the collection as `this`, so you can also use it to guarantee
that default values in a collection are retained, as in `MultiMap`.


## Collection Methods

Where these methods coincide with the specification of an existing
method of Array, Array is noted as an implementation.  `Array+` refers
to shimmed arrays, as installed with the `array` module.  `Object`
refers to methods implemented on the `Object` constructor function, as
opposed to the `Object.prototype`.  `Object+` in turn refers to methods
shimmed on the object constructor by the `object` module.  These
functions accept the object as the first argument instead of the `this`
implied argument.  ~~Strikethrough~~ indicates an implementation that
should exist but has not yet been made (Send a pull request!).

These are all of the collections:

(Array, Array+, Object+, Iterator, List, Set, Map, MultiMap, WeakMap,
SortedSet, SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict)

### has

#### has(key)

Whether a value for the given key exists.

(Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
Dict)

#### has(value, opt_equals)

Whether a value exists in this collection.  This is slow for list
(linear), but fast (logarithmic) for SortedSet and SortedArraySet,
and very fast (constant) for Set.

(Array+, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
FastSet)

### get

#### get(key or index)

The value for a key.  If a Map or SortedMap lacks a key, returns
`getDefault(key)`.

(Array+, Map, SortedMap, SortedArrayMap, WeakMap, Object+)

#### get(value)

Gets the equivalent value, or falls back to `getDefault(value)`.

(List, Deque, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
FastSet)

### set(key or index, value)

Sets the value for a key.

(Map, MultiMap, WeakMap, SortedMap, LruMap, SortedArrayMap, FastMap,
Dict)

### add

#### add(value)

Adds a value.  Ignores the operation and returns false if an
equivalent value already exists.

(Array+, List, Deque, Set, SortedSet, LruSet, SortedArray,
SortedArraySet, FastSet, Heap)

#### add(value, key)

Aliases `set(key, value)`, to assist generic methods used for maps,
sets, and other collections.

### addEach

#### addEach(values)

Copies values from another collection to this one.

(Array+, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
FastSet, Heap)

#### addEach(mapping)

Copies entries from another collection to this map.  If the mapping
implements `keys` (indicating that it is a mapping) and `forEach`,
all of the key value pairs are copied.  If the mapping only
implements `forEach`, it is assumed to contain `[key, value]` arrays
which are copied instead.

(Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
Dict)

### delete

#### delete(key)

Deletes the value for a given key.  Returns whether the key was
found.

(Map, MultiMap, WeakMap, SortedMap, LruMap, SortedArrayMap, FastMap,
Dict)

#### delete(value)

Deletes a value.  Returns whether the value was found.

(Set, SortedSet, LruSet, SortedArray, SortedArraySet, FastSet, Heap)

#### delete(value, equals)

Deletes the equivalent value.  Returns whether the value was found.

(Array+, List, Deque)

### deleteEach(values or keys)

Deletes every value or every value for each key.

(Array+, List, Deque, Set, Map, MultiMap, SortedSet, SortedMap,
LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap, FastSet,
FastMap, Dict, Heap)

### indexOf(value)

Returns the position in the collection of a value, or `-1` if it is
not found.  Returns the position of the first of equivalent values.
For an Array this takes linear time.  For a SortedArray and
SortedArraySet, it takes logarithmic time to perform a binary
search.  For a SortedSet, this takes ammortized logarithmic time
since it incrementally updates the number of nodes under each
subtree as it rotates.

(Array, ~~List~~, Deque, SortedSet, SortedArray, SortedArraySet)

### lastIndexOf(value)

Returns the position in the collection of a value, or `-1` if it is
not found.  Returns the position of the last of equivalent values.

(Array, ~~List~~, Deque, SortedArray, SortedArraySet)

### findValue(value, opt_equals)

Finds a value.  For List and SortedSet, returns the node at which
the value was found.  For SortedSet, the optional `equals` argument
is ignored.

(Array+, List, Deque, SortedSet)

### findLastValue(value, opt_equals)

Finds the last equivalent value, returning the node at which the
value was found.

(Array+, List, Deque, SortedArray, SortedArraySet)

### findLeast()

Finds the smallest value, returning the node at which it was found,
or undefined.  This is fast (logarithmic) and performs no rotations.

(SortedSet)

### findLeastGreaterThan(value)

Finds the smallest value greater than the given value.  This is fast
(logarithic) but does cause rotations.

(SortedSet)

### findLeastGreaterThanOrEqual(value)

Finds the smallest value greater than or equal to the given value.
This is fast (logarithmic) but does cause rotations.

(SortedSet)

### findGreatest()

(SortedSet)

### findGreatestLessThan(value)

(SortedSet)

### findGreatestLessThanOrEqual(value)

(SortedSet)

### push

#### push(...values)

Adds values to the end of a collection.

(Array, List, Deque)

#### push(...values) for non-deques

Adds values to their proper places in a collection.
This method exists only to have the same interface as other
collections.

(Set, SortedSet, LruSet, SortedArray, SortedArraySet, FastSet, Heap)

### unshift

#### unshift(...values)

Adds values to the beginning of a collection.

(Array, List, Deque)

#### unshift(...values) for non-deques

Adds values to their proper places in a collection.
This method exists only to have the same interface as other
collections.

(Set, SortedSet, LruSet, SortedArray, SortedArraySet, FastSet)

### pop()

Removes and returns the value at the end of a collection.  For a
Heap, this means the greatest contained value, as defined by the
comparator.

(Array, List, Deque, Set, SortedSet, LruSet, SortedArray,
SortedArraySet, Heap)

### shift()

Removes and returns the value at the beginning of a collection.

(Array, List, Deque, Set, SortedSet, LruSet, SortedArray,
SortedArraySet)

### peek()

Returns the next value in an deque, as would be returned by the next
`shift`.

(Array, List, Deque)

### poke(value)

Replaces the next value in an ordered collection, such that it will be
returned by `shift` instead of what was there.

(Array, List, Deque)

### peekBack()

Returns the last value in an deque, as would be returned by the next
`pop`.

(Array, List, Deque)

### pokeBack(value)

Replaces the last value in an ordered collection, such that it will be
returned by `pop` instead of what was there.

(Array, List, Deque)

### slice(start, end)

Returns an array of the values contained in the
half-open interval [start, end), that is, including the start and
excluding the end.  For lists and arrays, both terms may be numeric
positive or negative indicies.  For a list, either term may be a
node.

(Array, List, SortedSet, SortedArray, SortedArraySet)

### splice(start, length, ...values)

Works as with an array, but for a list, the start may be an index or
a node.

(Array, List, SortedArray, SortedSet, SortedArraySet)

### swap(start, length, values)

Performs a splice without variadic arguments.

(Array+, List, SortedArray, SortedSet, SortedArraySet)

### clear()

Deletes the all values.

(Array+, Object+, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### sort(compare)

Sorts a collection in place.  The comparator by only be a function.
The default comparator coerces unlike types rather than fail to
compare.

(Array)

### sorted(compare, by, order)

Returns a collection as an array in sorted order.  Accepts an
optional `compare(x, y)` function, `by(property(x))` function, and
`order` indicator, `-1` for descending, `1` for ascending, `0` for
stable.

Instead of a `compare` function, the comparator can be an object
with `compare` and `by` functions.  The default `compare` value is
`Object.compare`.

The `by` function must be a function that accepts a value from the
collection and returns a representative value on which to sort.

(Array+, List, Deque, Set, Map, SortedSet, LruSet, SortedArray,
SortedArraySet, FastSet, Heap)

### group(callback, thisp, equals)

Returns an array of [key, equivalence class] pairs where every
element from the collection is placed into an equivalence class
if they have the same corresponding return value from the given
callback.

(Array+, Object+, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap, Iterator)

### reverse()

Reverses a collection in place.

(Array, List)

### reversed()

Returns a collection of the same type with this collection's
contents in reverse order.

(Array, List)

### enumerate(start=0)

Returns an array of [index, value] pairs from the source collection,
starting with the given index.

### join(delimiter="")

Returns a string of all the values in the collection joined.

(Array, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
FastSet, Heap, Iterator)

### concat(...iterables)

Produces a new collection of the same type containing all the values
of itself and the values of any number of other collections.  Favors
the last of duplicate values.  For map-like objects, the given
iterables are treated as map-like objects and each successively
updates the result.  Array is like a map from index to value.  List,
Set, and SortedSet are like maps from nodes to values.

(Array, ~~Object+~~, Iterator, List, Set, Map, MultiMap,
SortedSet, SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### keys()

Returns an array of the keys.

(Object, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
Dict)

### values()

Returns an array of the values

(Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
Dict)

### entries()

Returns an array of `[key, value]` pairs for each entry.

(Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
Dict)

### reduce(callback(result, value, key, object, depth), basis, thisp)

(Array, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### reduceRight(callback(result, value, key, object, depth), basis, thisp)

(Array, List, Deque, SortedSet, ~~SortedMap~~, SortedArray,
SortedArraySet, ~~SortedArrayMap~~, Heap)

### forEach(callback(value, key, object, depth), thisp)

Calls the callback for each value in the collection.  The iteration
of lists is resilient to changes to the list.  Particularly, nodes
added after the current node will be visited and nodes added before
the current node will be ignored, and no node will be visited twice.

(Array, Object+, Iterator, List, Deque, Set, Map, MultiMap, WeakMap,
SortedSet, SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### map(callback(value, key, object, depth), thisp)

(Array, Object+, Iterator, List, Deque, Set, Map, MultiMap, WeakMap,
SortedSet, SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### toArray()

(Array+, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### toObject()

Converts any collection to an object, treating this collection as a
map-like object.  Array is like a map from index to value.

(Array+ Iterator, List, Deque, Map, MultiMap, SortedMap, LruMap,
SortedArrayMap, FastMap, Dict, Heap)

### filter(callback(value, key, object, depth), thisp)

(Array, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### every(callback(value, key, object, depth), thisp)

Whether every value passes a given guard.  Stops evaluating the
guard after the first failure.  Iterators stop consuming after the
the first failure.

(Array, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

*The method `all` from version 1 was removed in version 2 in favor of
the idiom `every(Boolean)`.*

### some(callback(value, key, object, depth), thisp)

Whether there is a value that passes a given guard.  Stops
evaluating the guard after the first success.  Iterators stop
consuming after the first success.

(Array, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

*The method `any` from version 1 was removed in version 2 in favor of
the idiom `some(Boolean)`.*

### min()

The smallest value.  This is fast for sorted collections (logarithic
for SortedSet, constant for SortedArray, SortedArraySet, and
SortedArrayMap), but slow for everything else (linear).

(Array+, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict)

### max()

The largest value.  This is fast for sorted collections (logarithic
for SortedSet, constant for SortedArray, SortedArraySet, and
SortedArrayMap), but slow for everything else (linear).

(Array+, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### one()

Any single value, or throws an exception if there are no values.  This
is very fast (constant time) for most collections.  For a sorted set,
`set.root.value` is always very fast to access, but changes whenever you
*access* a value, including using `has` or `find`.  In the interest of
being consistent across accesses, and only changing in response to
mutation, `one` returns the `min` of the set in logarithmic time.

(Array+, List, Deque, Set, Map, MultiMap, SortedSet, SortedMap,
LruSet, LruMap, SortedArray, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### only()

The one and only value, or throws an exception if there are no
values or more than one value.

(Array+, List, Deque, Set, Map, MultiMap, SortedSet, SortedMap,
LruSet, LruMap, SortedArray, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### sum()

(Array+, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict)

### average()

(Array+, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict)

### flatten()

(Array+, Iterator, List, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### zip(...collections)

(Array+, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### enumerate(zero)

(Array+, Iterator, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### clone(depth, memo)

Replicates the collection.  Clones the values deeply, to the
specified depth, using the memo to resolve reference cycles.  (which
must the `has` and `set` parts of the Map interface, allowing
objects for keys)  The default depth is infinite and the default
memo is a WeakMap.

`Object.clone` can replicate object literals inheriting directly
from `Object.prototype` or `null`, or any object that implements
`clone` on its prototype.  Any other object causes `clone` to throw
an exception.

The `clone` method on any other objects is not intended to be used
directly since they do not necessarily supply a default depth and
memo.

(Array+, Object+, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### constructClone(values)

Replicates a collection shallowly.  This is used by each `clone`
implementation to create a new collection of the same type, with the
same options (`equals`, `compare`, `hash` options), but it leaves
the job of deeply cloning the values to the more general `clone`
method.

(Array+, Object+, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict, Heap)

### equals(that, equals)

(Array+, Object+, List, Deque, Set, Map, MultiMap, SortedSet,
SortedMap, LruSet, LruMap, ~~SortedArray~~, SortedArraySet,
SortedArrayMap, FastSet, FastMap, Dict)

### compare(that)

(Array+, Object+, List, Deque, ~~SortedArray~~, ~~SortedArraySet~~)

### iterate

#### iterate()

Produces an iterator with a `next` method.  You may elect to get
richer iterators by wrapping this iterator with an `Iterator` from
the `iterator` module.  Iteration order of lists is resilient to
changes to the list.

(Array+, Iterator, List, ~~Deque~~, Set, SortedSet, LruSet,
SortedArray, SortedArraySet, FastSet)

#### iterate(start, end)

Returns an iterator for all values at indicies in the half-open
interval [start, end), that is, greater than start, and less than
end.

(Array+)

#### iterate(start, end)

Returns an iterator for all values in the half-open interval [start,
end), that is, greater than start, and less than end.  The iterator
is resilient against changes to the data.

(SortedSet)

### log(charmap, callback(node, write, writeAbove), log, logger)

Writes a tree describing the internal state of the data structure to
the console.

`charmap` is an object that notes which characters to use to draw
lines.  By default, this is the `TreeLog.unicodeRound` property from the
`tree-log` module.  `TreeLog.unicodeSharp` and `TreeLog.ascii` are
alternatives.  The properties are:

-   intersection: ╋
-   through: ━
-   branchUp: ┻
-   branchDown: ┳
-   fromBelow: ╭
-   fromAbove: ╰
-   fromBoth: ┣
-   strafe: ┃

`callback` is a customizable function for rendering each node of the tree.
By default, it just writes the value of the node.  It accepts the node and
a writer functions.  The `write` function produces the line on which the
node joins the tree, and each subsequent line.  The `writeAbove` function
can write lines before the branch.

`log` and `logger` default to `console.log` and `console`.  To write
the representation to an array instead, they can be `array.push` and
`array`.

(SortedSet)


### Iterator(iterable, start, stop, step)

*Redesigned in version 2.*

Creates an iterator from an iterable. Iterables include:

-   instances of Iterator, in which case the “iterable” will be simply returned
    instead of a new iterator.
-   objects with an `iterate(start, stop, step)` method, in which case the
    optional `start`, `stop`, and `step` arguments are forwarded. Collections
    implement this iterface, including Array.
-   objects with a `next()` method, which is to say existing iterators,
    though this iterator will only depend on the `next()` method and provide
    the much richer Iterator interface using it.
-   `next()` functions.

Iterators are defined by the upcoming version of ECMAScript. The `next()` method
returns what I am calling an “iteration”, an object that has a `value` property
and an optional `done` flag. When `done` is true, the iteration signals the end
of the iterator and may be accompanied by a “return value” instead of a “yield
value”.

In addition, Iterator produces iterations with an optional `index` property. The
indexes produced by an array are the positions of each value, which are
non-contiguous for sparse arrays.

*In version 1, iterators followed the old, Pythonic protocol established in
Mozilla’s SpiderMonkey, where iterators yielded values directly and threw
`StopIteration` to terminate.*

#### dropWhile(callback(value, index, iterator), thisp)

Returns an iterator that begins with the first iteration from this iterator to
fail the given test.

#### takeWhile(callback(value, index, iterator), thisp)

Returns an iterator that ends before the first iteration from this iterator to
fail the given test.

#### iterateMap(callback(value, index, iterator))

*Renamed in version 2 from `mapIterator` in version 1.*

Returns an iterator for a mapping on the source values.  Values are
consumed on demand.

#### iterateFilter(callback(value, index, iterator))

*Renamed in version 2 from `filterIterator` in version 1.*

Returns an iterator for those values from the source that pass the
given guard.  Values are consumed on demand.

#### iterateZip(...iterables)

*Introduced in version 2.*

Returns an iterator that incrementally combines the respective
values of the given iterations, first including itself.

#### iterateUnzip()

*Introduced in version 2.*

Assuming that this is an iterator that produces iterables, produces an iteration
of the reslective values from each iterable.

#### iterateConcat(...iterables)

*Renamed in version 2 from `concat` in version 1.*

Creates an iteration that first produces all the values from this iteration,
then from each subsequent iterable in order.

#### iterateFlatten()

*Introduced in version 2.*

Assuming that this is an iterator that produces iterables, creates an iterator
that yields all of the values from each of those iterables in order.

#### iterateEnumerate(start = 0)

*Renamed in version 2 from `enumerateIterator` in version 1.*

Returns an iterator that provides [index, value] pairs from the
source iteration.

#### recount(start=0)

*Introduced in version 2.*

Produces a new version of this iteration where the indexes are recounted. The
indexes for sparse arrays are not contiguous, as well as the iterators produced
by `filter`, `cycle`, `flatten`, and `concat` that pass iterations through
without alteration from various sources. `recount` smoothes out the sequence.


### Iterator utilities

#### cycle(iterable, times=Infinity)

Produces an iterator that will cycle through the values from a given iterable
some number of times, indefinitely by default. The given iterable must be able
to produce the sequence of values each time it is iterated, which is to say, not
an iterator, but any collection would do.

#### unzip(iterables)

Transposes a two dimensional iterable, which is to say, produces an iterator
that will yield a tuple of the respective values from each of the given
iterables.

#### zip(...iterables)

Transposes a two dimensional iterable, which is to say, produces an iterator
that will yield a tuple of the respective values from each of the given
iterables. `zip` differs from `unzip` only in that the arguments are variadic.

#### flatten(iterables)

*Renamed in version 2 from `concat` in version 1.*

Returns an iterator that will produce all the values from each of the given
iterators in order.

#### concat(...iterables)

*Renamed in version 2 from `chain` in version 1.*

Returns an iterator that will produce all the values from each of the given
iterators in order. Differs from `flatten` only in that the arguments are
variadic.

#### range(length)

Iterates `length` numbers starting from 0.

#### range(start, stop, step=1)

Iterates numbers from start to stop by step.

#### count(start, step)

Iterates numbers from start by step, indefinitely.

#### repeat(value, times)

Repeats the given value either finite times or indefinitely.


## Change Observers

*Introduced in version 2.*

All collections support change observers. There are three types of changes.
Property changes, range changes, and map changes. Whether a collection supports
a kind of change can be inferred by the existence of an `observe*` method
appropriate to the kind of change, `observeRangeChange` for example.

#### Observers

The `observe*` methods all return “observer” objects with some overlapping
interface. Most importantly, an “observer” has a `cancel()` method that will
remove the observer from the queue of observers for its corresponding object and
property name. To reduce garbage collection churn, the observer may be reused,
but if the observer is canceled during change dispatch, it will not be recycled
until all changes have been handled. Also, if an observer is cancelled during
change dispatch, it will be passed over. If an observer is created during change
dispatch, it will also be passed over, to be informed of any subsequent changes.

The observer will have a `handlerMethodName` property, based on a convention
that take into account all the parameters of the change observer and what
methods are available on the handler, such as `handleFooPropertyWillChange` or
simply null if the handler is a function. This method name can be overridden if
you need to break from convention.

The observer will also have a `dispatch` method that you can use to manually
force a change notification.

The observer will have a `note` property, as provided as an argument to the
observe method. This value is not used by the change observer system, but is
left for the user, for example to provide helpful information for inspecting why
the observer exists and what systems it participates in.

The observer will have a `childObserver` property. Handlers have the option of
returning an observer, if that observer needs to be canceled when this observer
notices a change. This facility allows observers to “stack”.

All kinds of changes have a `get*ChangeObservers` method that will return an
array of change observers. This function will consistently return the same array
for the same arguments, and the content of the array is itself observable.

#### Handlers

A handler may be an object with a handler method or a function. Either way, the
change observer will dispatch an argument pattern to the observer including both
the new and old values associated with the change and other parameters that
allow generic handlers to multiplex changes from multiple sources. See the
specific change observer documentation for details about the argument pattern
and handler method name convention.

Again, a handler has the option of returning an observer. This observer will be
canceled if there is a subsequent change. So for example, if you are observing
the "children" property of the "root" property of a tree, you would be able to
stack the "children" property observer on top of the "root" property observer,
ensuring that the children property observer does not linger on old roots.

If a handler throws an exception, it will not corrupt the state of the change
notification system, but it may corrupt the state of the observed object and the
assuptions of the rest of the program. Such errors are annotated by the change
dispatch system to increase awareness that all such errors are irrecoverable
programmer errors.

#### Capture

All observers support “change” and “will change” (“capture”) phases. Both phases
receive both the old and new values, but in the capture phase, the direct
interrogation of the object being observed will show that the change has not
taken effect, though change observers do not provide a facility for preventing a
change and throwing exceptions can corrupt the state of involved collections.
All “will change” methods exist to increase the readability of the program but
simply forward a true “capture” argument to the corresponding “change” method.
For example, `map.observeMapWillChange(handler)` just calls
`map.observeMapChange(handler, null, null, true)`, eliding the `name` and `note`
arguments not provided.

### Property Changes

The `observable-object` module provides facilities for observing changes to
properties on arbitrary objects, as well as a mix-in prototype that allows any
collection to support the property change observer interface directly. The
`observable-array` module alters the `Array` in this context to support the
property observer interface for its `"length"` property and indexed properties
by number, as long as those properties are altered by a method of the array
(which is to say, *caveat emptor: direct assignment to a property of an array is
not observable*). This shim does not introduce any overhead to arrays that are
not observed.

```javascript
var ObservableObject = require("collections/observable-object");
ObservableObject.observePropertyChange(object, name, handler, note, capture);
ObservableObject.observePropertyWillChange(object, name, handler, note, capture);
ObservableObject.dispatchPropertyChange(object, plus, minus);
ObservableObject.dispatchPropertyWillChange(object, plus, minus);
ObservableObject.getPropertyChangeObservers(object, name, capture)
ObservableObject.getPropertyWillChangeObservers(object, name, capture)
ObservableObject.makePropertyObservable(object, name);
ObservableObject.preventPropertyObserver(object, name);
```

All of these methods delegate to methods of the same name on an object if one
exists, making it possible to use these on arbitrary objects as well as objects
with custom property observer behavior. The property change observer interface
can be imbued on arbitrary objects.

```javascript
Object.addEach(Constructor.prototype, ObservableObject.prototype);
var object = new Constructor();

object.observePropertyChange(name, handler, note, capture);
object.observePropertyWillChange(name, handler, note);
object.dispatchPropertyChange(plus, minus, capture);
object.dispatchPropertyWillChange(plus, minus);
object.getPropertyChangeObservers(name, capture)
object.getPropertyWillChangeObservers(name)
object.makePropertyObservable(name);
object.preventPropertyObserver(name);
```

`observePropertyChange` and `observePropertyWillChange` accept a property
`name` and a `handler` and returns an `observer`.

#### Handlers

The arguments to a property change handler are:

-   `plus`: the new value
-   `minus`: the old value
-   `name` (`observer.propertyName`, the `name` argument to
    `observePropertyChange`)
-   `object` (`observer.object`, the `object` given to `observePropertyChange`)
-   `this` is the `handler` or undefined if the handler is a callable.

The prefereed handler method name for a property change observer is composed:

-   `"handle"`
-   `name`, with the first character capitalized
-   `"Property"`
-   `"Will"` if `capture`
-   `"Change"`

*The specific handler method name differs from those constructed by version 1,
in that it includes the term, `"Property"`. Thus, all observer handler method
names now receive a complete description of the kind of change, at the expense
of some verbosity.*

If this method does not exist, the method name falls back to the generic without
the property name:

-   `"handle"`
-   `"Property"`
-   `"Will"` if `capture`
-   `"Change"`

Otherwise, the handler must be callable, implementing `handler.call(this, plus,
minus, name, object)`, but not necessarily a function.

#### Observers

A property change observer has properties in addition to those common to all
observers.

-   `propertyName`
-   `value` the last value dispatched. This will be used if `minus` is not given
    when a change is dispatched and is otherwise is useful for inspecting
    observers.

#### Observability

Property change observers use various means to make properties observable. In
general, they install a “thunk” property on the object that intercepts `get` and
`set` calls. A thunk will never be installed over an existing thunk.

Observers take great care to do what makes sense with the underlying property
descriptor. For example, different kinds of thunks are installed for descriptors
with `get` and `set` methods than those with a simple `value`. If a property is
read-only, either indicated by `writable` being false or `get` being provided
without a matching `set`, no thunk is installed at all.

If a property is ostensibly immutable, for lack of a `set` method, but the value
returned by `get` does in fact change in response to exogenous changes, those
changes may be rigged to dispatch a property change manually, using one of the
above `dispatch` methods.

To avoid installing a thunk on every instance of particular constructor,
`makePropertyObservable` can be applied to a property of a prototype. To avoid
installing a thunk on a property at all, `preventPropertyObserver` can be
applied to either an instance or a prototype.

Properties of an `Array` cannot be observed with thunks, so the
`observable-array` module adds methods to the Array prototype that allow it to
be transformed into an observed array on demand. The transformation involves
replacing all the methods that modify the content of the array with versions
that report the changes. The observable array interface is installed either by
subverting the prototype of the instance, or by redefining these methods
directly onto the instance if the prototype is not mutable.

### Range Changes

Many collections represent a contiguous range of values in a fixed order. For
these collections, range change observation is available.

-   `Array` with `require("collections/observable-array")`
-   `List`&dagger;
-   `Deque`
-   `Set`&dagger;
-   `SortedSet`
-   `SortedArray`
-   `SortedArraySet`
-   `Heap`

*&dagger;Note that with `List` and `Set`, observing range changes often
nullifies any performance improvment that might be gained using them instead of
an array, deque, or array-backed set.*

`SortedSet` can grow to absurd proportions and still quickly dispatch range
change notifications at any position, owing to an algorithim that can
incrementally track the index of each node in time proportional to the logarithm
of the size of the collection.

The `observe-range-changes` module exports a **mixin** that provides the range
change interface for a collection.

```javascript
collection.observeRangeChange(handler, name, note, capture)
collection.observeRangeWillChange(handler, name, note)
collection.dispatchRangeChange(plus, minus, index, capture)
collection.dispatchRangeWillChange(plus, minus, index)
collection.getRangeChangeObservers(capture)
collection.getRangeWillChangeObservers()
collection.makeRangeChangeObservable()
```

The `name` is optional and only affects the handler method name computation.
The convention for the name of a range change handler method name is:

-   `"handle"`
-   `name` with the first character capitalized, if given, and only if the
    resulting method name is available on the handler.
-   `"Range"`
-   `"Will"` if `capture`
-   `"Change"`

The arguments of a range change are:

-   `plus`: values added at `index`
-   `minus`: values removed at `index` before `plus` was added
-   `index`
-   `collection`

The `makeRangeChangeObservable` method is overridable if a collection needs to
perform some operations apart from setting `dispatchesRangeChanges` in order to
become observable. For example, a `Set` has to establish observers on its own
`order` storage list.

### Map Changes

*Note: map change observers are very different than version 1 map change
listeners.*

Many collections represent a mapping from keys to values, irrespective of order.
For most of these collections, map change observation is available.

-   `Array` with `require("collections/observable-array")`
-   `Map`
-   `FastMap`
-   `LruMap`
-   `SortedMap`
-   `SortedArrayMap`
-   `Dict`
-   `Heap` only for key 0

```javascript
collection.observeMapChange(handler, name, note, capture)
collection.observeMapWillChange(handler, name, note)
collection.dispatchMapChange(plus, minus, index, capture)
collection.dispatchMapWillChange(plus, minus, index)
collection.getMapChangeObservers(capture)
collection.getMapWillChangeObservers()
collection.makeMapChangeObservable()
```

The `name` is optional and only affects the handler method name computation.
The convention for the name of a range change handler method name is:

-   `"handle"`
-   `name` with the first character capitalized, if given, and only if the
    resulting method name is available on the handler.
-   `"Map"`
-   `"Will"` if `capture`
-   `"Change"`

The arguments of a range change are:

-   `plus`: the new value
-   `minus`: the old value
-   `key`
-   `type`: one of `"create"`, `"update"`, or `"delete"`
-   `collection`

The `makeMapChangeObservable` method is overridable if a collection needs to
perform some operations apart from setting `dispatchesMapChanges` in order to
become observable.


## Change Listeners

*The change listener interface exists in version 1, but has been replaced with
Change Observers in version 2.*

All collections support change listeners.  There are three types of
changes.  Property changes, map changes, and range changes.

### Property Changes

`PropertyChanges` from the `listen/property-changes` module can
configure listeners for property changes to specific keys of any object.

With the `listen/array-changes` module required, `PropertyChanges` can
also listen to changes to the length and indexed properties of an array.
The only caveat is that watched arrays can only modify their contents
with method calls like `array.push`.  All methods of a watched array
support change dispatch.  In addition, arrays have a `set` method to
make setting the value at a particular index observable.

-   PropertyChanges.addOwnPropertyChangeListener(object, key, listener, before)
-   PropertyChanges.removeOwnPropertyChangeListener(object, key, listener, before)
-   PropertyChanges.dispatchOwnPropertyChange(object, key, value, before)
-   PropertyChanges.addBeforeOwnPropertyChangeListener(object, key, listener)
-   PropertyChanges.removeBeforeOwnPropertyChangeListener(object, key, listener)
-   PropertyChanges.dispatchBeforeOwnPropertyChange(object, key, value)
-   PropertyChanges.getOwnPropertyChangeDescriptor(object, key)

All of these functions delegate to methods of the same name if one
exists on the object.

-   object.addOwnPropertyChangeListener(key, listener, before)
-   object.removeOwnPropertyChangeListener(key, listener, before)
-   object.dispatchOwnPropertyChange(key, value, before)
-   object.addBeforeOwnPropertyChangeListener(key, listener)
-   object.removeBeforeOwnPropertyChangeListener(key, listener)
-   object.dispatchBeforeOwnPropertyChange(key, value)
-   object.getOwnPropertyChangeDescriptor(key)

Additionally, `PropertyChanges.prototype` can be **mixed into** other
types of objects to support the property change dispatch interface.  All
collections support this interface.

The **listener** for a property change receives the arguments `value`,
`key`, and `object`, just as a `forEach` or `map` callback.  The
listener may alternately be a delegate object that implements one of
these methods:

-   listener.handle + **key** + Change **or** WillChange
-   listener.handleProperty + Change **or** WillChange
-   listener.call

### Map Changes

A map change listener receives notifications for the creation, removal,
or updates for any entry in a map data structure.

With the `listen/array-changes` module required, `Array` can also
dispatch map changes for the values at each index.

-   collection.addMapChangeListener(listener, token, before)
-   collection.removeMapChangeListener(listener, token, before)
-   collection.dispatchMapChange(key, value, before)
-   collection.addBeforeMapChangeListener(listener)
-   collection.removeBeforeMapChangeListener(listener)
-   collection.dispatchBeforeMapChange(key, value)
-   collection.getMapChangeDescriptor()

The **listener** for a map change receives the `value`, `key`, and
collection `object` as arguments, the same pattern as a `forEach` or
`map` callback.  In the after change phase, a value of `undefined` may
indicate that the value was deleted or set to `undefined`.  In the
before change phase, a value of `undefined` may indicate the the value
was added or was previously `undefined`.

The listener may be a delegate object with one of the following methods,
in order of precedence:

-   listener.handleMap + Change **or** WillChange
-   listener.handle + **token** + Map + Change **or** WillChange
-   listener.call

The `listen/map-changes` module exports a map changes **mixin**.  The
methods of `MaxChanges.prototype` can be copied to any collection that
needs this interface.  Its mutation methods will then need to dispatch
map changes.

### Range Changes

A range change listener receives notifications when a range of values at
a particular position is added, removed, or replaced within an ordered
collection.

-   collection.**add**RangeChange**Listener**(listener, token, before)
-   collection.**remove**RangeChange**Listener**(listener, token, before)
-   collection.**dispatch**RangeChange(plus, minus, index, before)
-   collection.add**Before**RangeChange**Listener**(listener)
-   collection.remove**Before**RangeChange**Listener**(listener)
-   collection.dispatch**Before**RangeChange(plus, minus, index)
-   collection.**get**RangeChange**Descriptor**()

The **listener** for a range change is a function that accepts `plus`,
`minus`, and `index` arguments.  `plus` and `minus` are the values that
were added or removed at the `index`.  Whatever operation caused these
changes is equivalent to:

```javascript
var minus = collection.splice(index, minus.length, ...plus)
```

The listener can alternately be a delegate object with one of the
following methods in order of precedence:

-   handle + **token** + Range + Change **or** WillChange
-   handleRange + Change **or** WillChange
-   call

The following support range change dispatch:

-   `Array` with `require("collections/listen/array-changes")`
-   `SortedSet`
-   `SortedArray`
-   `SortedArraySet`

The `listen/range-changes` module exports a range changes **mixin**.
The methods of `RangeChanges.prototype` can be copied to any collection
that needs this interface.  Its mutation methods will need to dispatch
the range changes.

All **descriptors** are objects with the properties `changeListeners`
and `willChangeListeners`.  Both are arrays of listener functions or
objects, in the order in which they were added.


## Miscellanea

### Set and Map

Set and map are like hash tables, but not implemented with a block of
memory as they would be in a lower-level language.  Most of the work of
providing fast insertion and lookup based on a hash is performed by the
underlying plain JavaScript object.  Each key of the object is a hash
string and each value is a List of values with that hash.  The inner
list resolves collisions.  With a good `hash` method, the use of the
list can be avoided.

Sets and maps both have a `log` function that displays the internal
structure of the bucket list in an NPM-style.

```
┣━┳ 1
┃ ┗━━ {"key":1,"value":"a"}
┣━┳ 2
┃ ┣━━ {"key":2,"value":"c"}
┃ ┗━━ {"key":2,"value":"d"}
┗━┳ 3
  ┗━━ {"key":3,"value":"b"}
```


### Sorted Set and Sorted Map

A binary splay tree is a balanced binary tree that rotates the most
frequently used entries toward the root such that they can be accessed the
most quickly.  `sorted-set` and `sorted-map` are backed by a splay tree.

All map implementations use an underlying set implementation.  Any map
can be implemented trivially atop a set by wrapping `compare`, `equals`,
or `hash` to operate on the key of an entry.

The sorted set has a `root` node.  Each node has a `left` and `right`
property, which may be null.  Nodes are returned by all of the "find"
functions, and provided as the `key` argument to callbacks.

Both `sorted-set` and `sorted-map` implement a `log` function which can
produce NPM-style visualizations of the internal state of the sorted
tree.

```
> set.log(SortedSet.ascii)
  .-+ -3
  | '-- -2
.-+ -1
+ 0
| .-- 1
'-+ 2
  '-- 3
```

```
> set.log(SortedSet.unicodeRound)
  ╭━┳ -3
  ┃ ╰━━ -2
╭━┻ -1
╋ 0
┃ ╭━┳ 1
┃ ┃ ╰━━ 2
╰━┻ 3
```


### Object and Function Shims

The collection methods on the `Object` constructor all polymorphically
delegate to the corresponding method of any object that implements the
method of the same name.  So, `Object.has` can be used to check whether
a key exists on an object, or in any collection that implements `has`.
This permits the `Object` interface to be agnostic of the input type.

`Array.from` creates an array from any iterable.

`Array.unzip` transposes a collection of arrays, so rows become columns.

`Array.empty` is an empty array, frozen if possible.  Do not modify it.

`Object.from` creates an object from any map or collection.  For arrays
and array-like collections, uses the index for the key.

`Object.empty` is an empty object literal.

`Object.isObject(value)` tests whether it is safe to attempt to access
properties of a given value.

`Object.is(x, y)` compares objects for exact identity and is a good
alternative to `Object.equals` in many collections.

`Object.getValueOf(value)` safely and idempotently returns the value of
an object or value by only calling the `valueOf()` if the value
implements that method.

`Object.owns` is a shorthand for `Object.prototype.hasOwnProperty.call`.

`Object.can(value, name)` checks whether an object implements a method
on its prototype chain.  An owned function property does not qualify as
a method, to aid in distinguishing "static" functions.

`Object.concat(...maps)` and `Object.from(entries)` construct an object
by adding the entries of other objects in order.  The maps can be other
objects, arrays of entries, or map alike collections.

`Function.noop` is returns undefined.

`Function.identity` returns its first argument.

`Function.by(relation)` creates a comparator from a relation function.

`Function.get(key)` creates a relation that returns the value for the
property of a given object.


### References

- a SplayTree impementation buried in Fedor Indutny’s super-secret
  [Callgrind](https://github.com/indutny/callgrind.js). This
  implementation uses parent references.
- a SplayTree implementation adapted by [Paolo
  Fragomeni](https://github.com/hij1nx/forest) from the V8 project and
  based on the top-down splaying algorithm from "Self-adjusting Binary
  Search Trees" by Sleator and Tarjan. This does not use or require
  parent references, so I favored it over Fedor Indutny’s style.
- the interface of ECMAScript harmony [simple maps and
  sets](http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets)
- a SplayTree implementation from [JavaScript data
  structures](derrickburns/Javascript-Data-Structures) mainted by
  Derrick Burns that supports change-resilient iterators and a
  comprehensive set of introspection functions.

### Future work

Goals

- make array dispatch length property changes between range changes to
  be consistent with List.
- automate the generation of the method support tables in readme and
  normalize declaration order
- rearchitect ordered collections in terms of iteration instead of reduction,
  at least for methods that short circuit like some and every
- eliminate any/all
- comprehensive specs and spec coverage tests
- fast list splicing
- Make it easier to created a SortedSet with a criterion like
  Function.by(Function.get('name'))

More possible collections

- sorted-list (sorted, can contain duplicates, perhaps backed by splay
  tree with relaxation on the uniqueness invariant, or a skip list)
- sorted-multi-map (sorted, can contain duplicate entries)
- buffer (backed by a circular array, emits cull events)
- trie-set
- trie-map
- immutable-* (mutation functions return new objects that largely share
  the previous version's internal state, some perhaps backed by a hash
  trie)
- array-set (a set, for fast lookup, backed by an array for meaningful
  range changes)

