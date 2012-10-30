[![build status](https://secure.travis-ci.org/kriskowal/collections.png)](http://travis-ci.org/kriskowal/collections)

# Collections

This package contains JavaScript implementations of common data
structures with idiomatic iterfaces, including extensions for Array and
Object.

-   **List(values, equals, content)**

    An ordered collection of values with fast insertion and deletion and
    forward and backward traversal, backed by a cyclic doubly linked
    list with a head node.  Lists support most of the Array interface,
    except that they use and return nodes instead of integer indicies in
    analogous functions.

-   **Set(values, equals, hash, content)**

    A collection of unique values.  The set can be iterated in the order
    of insertion.  With a good hash function for the stored values,
    insertion and removal are fast regardless of the size of the
    collection.  Values may be objects.  The `equals` and `hash`
    functions can be overridden to provide alternate definitions of
    "unique".  `Set` is backed by `FastSet` and `List`.

-   **Map(map, equals, hash, content)**

    A collection of key and value items with unique keys.  Keys may be
    objects.  The collection iterates in the order of insertion.  `Map`
    is backed by `Set`.

-   **MultiMap(map, content, equals, hash)**

    A collection of keys mapped to collections of values.  The default
    `content` collection is an `Array`, but it can be a `List` or any
    other array-like object.  `MultiMap` inherits `Map` but overrides
    the `content` constructor.

-   **WeakMap()**

    A non-iterable collection of key value pairs.  Keys must objects and
    do not benefit from `hash` functions.  Some engines already
    implement `WeakMap`.  The non-iterable requirement makes it possible
    for weak maps to collect garbage when the key is no longer
    available, without betraying when the key is collected.  The shimmed
    implementation undetectably annotates the given key and thus does
    not necessarily leak memory, but cannot collect certain reference
    graphs.  This WeakMap shim was implemented by Mark Miller of Google.

-   **SortedSet(values, equals, compare, content)**

    A collection of unique values stored in stored order, backed by a
    splay tree.  The `equals` and `compare` functions can be overridden
    to provide alternate definitions of "unique".

-   **SortedMap(map, equals, compare, content)**

    A collection of key value pairs stored in sorted order.  `SortedMap`
    is backed by `SortedSet` and the `GenericMap` mixin.

-   **LruSet(values, maxLength, equals, hash, content)**

    A cache with the Least-Recently-Used strategy for truncating its
    content when it’s length exceeds `maxLength`.  `LruSet` is backed by
    a `Set` and takes advantage of the already tracked insertion order.
    Both getting and setting a value constitute usage, but checking
    whether the set has a value and iterating values do not.

-   **LruMap(map, maxLength, equals, hash, content)**

    A cache of items backed by an `LruSet`.

-   **SortedArray(values, equals, compare, content)**

    A collection of values stored in a stable sorted order, backed by an
    array.

-   **SortedArraySet(values, equals, compare, content)**

    A collection of unique values stored in sorted order, backed by a
    plain array.  If the given values are an actual array, the sorted
    array set takes ownership of that array and retains its content.  A
    sorted array set performs better than a sorted set when it has
    roughly less than 100 values.

-   **SortedArrayMap(values, equals, compare, content)**

    A collection of key value pairs stored in sorted order, backed by a
    sorted array set.

-   **FastSet(values, equals, hash, content)**

    A collection of unique values stored like a hash table.  The
    underlying storage is a `Dict` that maps hashes to lists of values
    that share the same hash.  Values may be objects.  The `equals` and
    `hash` functions can be overridden to provide alternate definitions
    of "unique".

-   **FastMap(map, equals, hash, content)**

    A collection of key and value items with unique keys, backed by a
    set.  Keys may be objects.  `FastMap` is backed by `FastSet` and the
    `GenericMap` mixin.

-   **Dict(values, content)**

    A collection of string to value mappings backed by a plain
    JavaScript object.  The keys are mangled to prevent collisions with
    JavaScript properties.

-   **Iterator(iterable)**

    A wrapper for any iterable that implements `iterate` or iterator the
    implements `next`, providing a rich lazy traversal interface.

-   **Array**

    An ordered collection of values with fast random access, push, and
    pop, but slow splice. The `array` module provides extensions so it
    hosts all the expressiveness of other collections.  The `array-shim`
    module shims EcmaScript 5 methods onto the array prototype if they
    are not natively implemented.

-   **Object**

    Can be used as a mapping of owned string keys to arbitrary values.
    The `object` module provides extensions for the `Object` constructor
    that support the map collection interface and can delegate to
    methods of collections, allowing them to gracefully handle both
    object literals and collections.

## Constructor Arguments

For all of these constructors, the argument `values` is an optional
collection of initial values, and may be an array.  If the `values` are
in a map collection, the the values are taken, but the keys are ignored.

-   **map**

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

-   **equals(x, y)**

    The default `equals` operator is implemented in terms of `===`, but
    treats `NaN` as equal to itself and `-0` as distinct from `+0`.  It
    also delegates to an `equals` method of either the left or right
    argument if one exists.  The default equality operator is shimmed as
    `Object.equals`.

-   **compare(x, y)**

    The default `compare` operator is implemented in terms of `<` and
    `>`.  It delegates to the `compare` method of either the left or
    right argument if one exists.  It inverts the result if it uses the
    falls to the right argument.  The default comparator is shimmed as
    `Object.compare`.

-   **hash(value)**

    The default `hash` operator uses `toString` for values and provides
    a [Unique Label][] for arbitrary objects.  The default hash is
    shimmed as `Object.hash`.

[Unique Label]: (http://wiki.ecmascript.org/doku.php?id=harmony:weak_maps#unique_labeler)

-   **content(key or value)**

    The default `content` function is `Function.noop`, which returns
    `undefined`.  The content function is used when you `get` a
    nonexistant value from any collection.  The `content` function
    becomes a member of the collection object, so `content` is called
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

-   **has(key)**

    Whether a value for the given key exists.

    (Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
    Dict)

    **has(value, opt_equals)**

    Whether a value exists in this collection.  This is slow for list
    (linear), but fast (logarithmic) for SortedSet and SortedArraySet,
    and very fast (constant) for Set.

    (Array+, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
    FastSet)

-   **get(key or index)**

    The value for a key.  If a Map or SortedMap lacks a key, returns
    `content(key)`.

    (Array+, Map, SortedMap, SortedArrayMap, WeakMap, Object+)

    **get(value)**

    Gets the equivalent value, or falls back to `content(value)`.

    (List, Set, SortedSet, LruSet, SortedArray, SortedArraySet, FastSet)

-   **set(key or index, value)**

    Sets the value for a key.

    (Map, MultiMap, WeakMap, SortedMap, LruMap, SortedArrayMap, FastMap,
    Dict)

-   **add(value)**

    Adds a value.  Ignores the operation and returns false if an
    equivalent value already exists.

    (Array+, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
    FastSet)

-   **addEach(values)**

    Copies values from another collection to this one.

    (Array+, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
    FastSet)

    **addEach(mapping)**

    Copies items from another collection to this map.  If the mapping
    implements `keys` (indicating that it is a mapping) and `forEach`,
    all of the key value pairs are copied.  If the mapping only
    implements `forEach`, it is assumed to contain `[key, value]` arrays
    which are copied instead.

    (Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
    Dict)

-   **delete(key)**

    Deletes the value for a given key.  Returns whether the key was
    found.

    (Map, MultiMap, WeakMap, SortedMap, LruMap, SortedArrayMap, FastMap,
    Dict)

    **delete(value)**

    Deletes a value.  Returns whether the value was found.

    (Array+, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet,
    FastSet)

-   **deleteEach(values or keys)**

    Deletes every value or every value for each key.

    (Array+, List, Set, Map, MultiMap, WeakMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **indexOf(value)**

    Returns the position in the collection of a value, or `-1` if it is
    not found.  Returns the position of the first of equivalent values.
    For an Array this takes linear time.  For a SortedArray and
    SortedArraySet, it takes logarithmic time to perform a binary
    search.  For a SortedSet, this takes ammortized logarithmic time
    since it incrementally updates the number of nodes under each
    subtree as it rotates.

    (Array, ~~List~~, SortedSet, SortedArray, SortedArraySet)

-   **lastIndexOf(value)**

    Returns the position in the collection of a value, or `-1` if it is
    not found.  Returns the position of the last of equivalent values.

    (Array, ~~List~~, SortedArray, SortedArraySet)

-   **find(value, opt_equals)**

    Finds a value.  For List and SortedSet, returns the node at which
    the value was found.  For SortedSet, the optional `equals` argument
    is ignored.

    (Array+, List, SortedSet)

-   **findLast(value, opt_equals)**

    Finds the last equivalent value, returning the node at which the
    value was found.

    (Array+, List, SortedArray, SortedArraySet)

-   **findLeast()**

    Finds the smallest value, returning the node at which it was found,
    or undefined.  This is fast (logarithmic) and performs no rotations.

    (SortedSet)

-   **findLeastGreaterThan(value)**

    Finds the smallest value greater than the given value.  This is fast
    (logarithic) but does cause rotations.

    (SortedSet)

-   **findLeastGreaterThanOrEqual(value)**

    Finds the smallest value greater than or equal to the given value.
    This is fast (logarithmic) but does cause rotations.

    (SortedSet)

-   **findGreatest()**

    (SortedSet)

-   **findGreatestLessThan(value)**

    (SortedSet)

-   **findGreatestLessThanOrEqual(value)**

    (SortedSet)

-   **push(...values)**

    Adds values to the end of a collection.

    (Array, List)

    **push(...values)** for non-dequeues

    Adds values to their proper places in a collection.
    This method exists only to have the same interface as other
    collections.

    (Set, SortedSet, LruSet, SortedArray, SortedArraySet, FastSet)

-   **unshift(...values)**

    Adds values to the beginning of a collection.

    (Array, List)

    **unshift(...values)** for non-dequeues

    Adds values to their proper places in a collection.
    This method exists only to have the same interface as other
    collections.

    (Set, SortedSet, LruSet, SortedArray, SortedArraySet, FastSet)

-   **pop()**

    Removes and returns the value at the end of a collection.

    (Array, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet)

-   **shift()**

    Removes and returns the value at the beginning of a collection.

    (Array, List, Set, SortedSet, LruSet, SortedArray, SortedArraySet)

-   **slice(start, end)**

    Returns an array of the values contained in the
    half-open interval [start, end), that is, including the start and
    excluding the end.  For lists and arrays, both terms may be numeric
    positive or negative indicies.  For a list, either term may be a
    node.

    (Array, List, SortedSet, SortedArray, SortedArraySet)

-   **splice(start, length, ...values)**

    Works as with an array, but for a list, the start may be an index or
    a node.

    (Array, List, SortedArray, SortedSet, SortedArraySet)

-   **swap(start, length, values)**

    Performs a splice without variadic arguments.

    (Array+, List, SortedArray, SortedSet, SortedArraySet)

-   **clear()**

    Deletes the all values.

    (Array+, Object+, List, Set, Map, MultiMap, WeakMap, SortedSet,
    SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **sort(compare)**

    Sorts a collection in place.  The comparator by only be a function.
    The default comparator coerces unlike types rather than fail to
    compare.

    (Array)

-   **sorted(compare, by, order)**

    Returns a collection as an array in sorted order.  Accepts an
    optional `compare(x, y)` function, `by(property(x))` function, and
    `order` indicator, `-1` for descending, `1` for ascending, `0` for
    stable.

    Instead of a `compare` function, the comparator can be an object
    with `compare` and `by` functions.  The default `compare` value is
    `Object.compare`.

    The `by` function must be a function that accepts a value from the
    collection and returns a representative value on which to sort.

    (Array+, List, Set, Map, SortedSet, LruSet, SortedArray,
    SortedArraySet, FastSet)

-   **reverse()**

    Reverses a collection in place.

    (Array, List)

-   **reversed()**

    Returns a collection of the same type with this collection's
    contents in reverse order.

    (Array, List)

-   **concat(...iterables)**

    Produces a new collection of the same type containing all the values
    of itself and the values of any number of other collections.  Favors
    the last of duplicate values.  For map-like objects, the given
    iterables are treated as map-like objects and each successively
    updates the result.  Array is like a map from index to value.  List,
    Set, and SortedSet are like maps from nodes to values.

    (Array, ~~Object+~~, Iterator, List, Set, Map, MultiMap,
    SortedSet, SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **keys()**

    Returns an array of the keys.

    (Object, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
    Dict)

-   **values()**

    Returns an array of the values

    (Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
    Dict)

-   **items()**

    Returns an array of `[key, value]` pairs for each item

    (Object+, Map, MultiMap, SortedMap, LruMap, SortedArrayMap, FastMap,
    Dict)

-   **reduce(callback(result, value, key, object, depth), basis,
    thisp)**:

    (Array, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **reduceRight(callback(result, value, key, object, depth), basis,
    thisp)**:

    (Array, List, SortedSet, ~~SortedMap~~, SortedArray, SortedArraySet,
    ~~SortedArrayMap~~)

-   **forEach(callback(value, key, object, depth), thisp)**

    Calls the callback for each value in the collection.  The iteration
    of lists is resilient to changes to the list.  Particularly, nodes
    added after the current node will be visited and nodes added before
    the current node will be ignored, and no node will be visited twice.

    (Array, Object+, Iterator, List, Set, Map, MultiMap, WeakMap,
    SortedSet, SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **map(callback(value, key, object, depth), thisp)**

    (Array, Object+, Iterator, List, Set, Map, MultiMap, WeakMap,
    SortedSet, SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **toArray()**

    (Array+, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **toObject()**

    Converts any collection to an object, treating this collection as a
    map-like object.  Array is like a map from index to value.

    (Array+ Iterator, List, Map, MultiMap, SortedMap, LruMap,
    SortedArrayMap, FastMap, Dict)

-   **filter(callback(value, key, object, depth), thisp)**

    (Array, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **every(callback(value, key, object, depth), thisp)**

    Whether every value passes a given guard.  Stops evaluating the
    guard after the first failure.  Iterators stop consuming after the
    the first failure.

    (Array, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **some(callback(value, key, object, depth), thisp)**

    Whether there is a value that passes a given guard.  Stops
    evaluating the guard after the first success.  Iterators stop
    consuming after the first success.

    (Array, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **any()**

    Whether any value is truthy.

    (Array+, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **all()**

    Whether all values are truthy.

    (Array+, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **min()**

    The smallest value.  This is fast for sorted collections (logarithic
    for SortedSet, constant for SortedArray, SortedArraySet, and
    SortedArrayMap), but slow for everything else (linear).

    (Array+, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **max()**

    The largest value.  This is fast for sorted collections (logarithic
    for SortedSet, constant for SortedArray, SortedArraySet, and
    SortedArrayMap), but slow for everything else (linear).

    (Array+, Iterator, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **one()**

    Any single value, or throws an exception if there are no values.
    This is very fast (constant) for all collections.  For a sorted set,
    the value is not deterministic and depends on what value was most
    recently accessed.

    (Array+, List, Set, Map, MultiMap, SortedSet, SortedMap, LruSet,
    LruMap, SortedArray, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **only()**

    The one and only value, or throws an exception if there are no
    values or more than one value.

    (Array+, List, Set, Map, MultiMap, SortedSet, SortedMap, LruSet,
    LruMap, SortedArray, SortedArray, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **sum()**

    (Array+, Iterator, List, Set, Map, MultiMap, WeakMap, SortedSet,
    SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **average()**

    (Array+, Iterator, List, Set, Map, MultiMap, WeakMap, SortedSet,
    SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **flatten()**

    (Array+, Iterator, List, Set, Map, MultiMap, WeakMap, SortedSet,
    SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **zip(...collections)**

    (Array+, Iterator, List, Set, Map, MultiMap, WeakMap, SortedSet,
    SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **enumrate(zero)**

    (Iterator, ~~other collections~~)

-   **clone(depth, memo)**

    Replicates the collection.  If `Object.clone` is shimmed, clones the
    values deeply, to the specified depth, using the given memo to
    resolve reference cycles (which must the `has` and `set` parts of
    the Map interface, allowing objects for keys)

    (Array+, List, Set, Map, SortedSet, SortedMap, Object+)
    (Array+, Object+, List, Set, Map, MultiMap, WeakMap, SortedSet,
    SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **constructClone(values)**

    Replicates a collection shallowly.  This is used by each `clone`
    implementation to create a new collection of the same type, with the
    same options (`equals`, `compare`, `hash` options), but it leaves
    the job of deeply cloning the values to the more general `clone`
    method.

    (Array+, Object+, List, Set, Map, MultiMap, WeakMap, SortedSet,
    SortedMap, LruSet, LruMap, SortedArray, SortedArraySet,
    SortedArrayMap, FastSet, FastMap, Dict)

-   **equals(that)**

    (Array+, Object+, List, Set, Map, MultiMap, SortedSet, SortedMap,
    LruSet, LruMap, ~~SortedArray~~, SortedArraySet, SortedArrayMap,
    FastSet, FastMap, Dict)

-   **compare(that)**

    (~~Array+~~, Object+, ~~List~~, ~~SortedArray~~, ~~SortedArraySet~~)

-   **iterate()**

    Produces an iterator with a `next` method.  You may elect to get
    richer iterators by wrapping this iterator with an `Iterator` from
    the `iterator` module.  Iteration order of lists is resilient to
    changes to the list.

    (Array+, Iterator, List, Set, SortedSet, LruSet, SortedArray,
    SortedArraySet, FastSet)

    **iterate(start, end)**

    Returns an iterator for all values at indicies in the half-open
    interval [start, end), that is, greater than start, and less than
    end.

    (Array+)

    **iterate(start, end)**

    Returns an iterator for all values in the half-open interval [start,
    end), that is, greater than start, and less than end.  The iterator
    is resilient against changes to the data.

    (SortedSet)

-   **log(charmap, callback(node, write, writeAbove), log, logger)**

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

    `log` and `loger` default to `console.log` and `console`.  To write
    the representation to an array instead, they can be `array.push` and
    `array`.

    (SortedSet)


### Iterator

-   **dropWhile(callback(value, index, iterator), thisp)**

-   **takeWhile(callback(value, index, iterator), thisp)**

-   **mapIterator(callback(value, index, iterator))**

    Returns an iterator for a mapping on the source values.  Values are
    consumed on demand.

-   **filterIterator(callback(value, index, iterator))**

    Returns an iterator for those values from the source that pass the
    given guard.  Values are consumed on demand.


### Iterator utilities

-   **cycle(iterable, times)**

-   **concat(iterables)**

-   **transpose(iterables)**

-   **zip(...iterables)**

    Variadic transpose.

-   **chain(...iterables)**

    Variadic concat.

-   **range(start, stop, step)**

    Iterates from start to stop by step.

-   **count(start, step)**

    Iterates from start by step, indefinitely.

-   **repeat(value, times)**

    Repeats the given value either finite times or indefinitely.


### Observables

`List`, `Set`, and `SortedSet` can be observed for content changes.

A content change handler can have various forms.  The simplest form is a
function that accepts `plus`, `minus`, and `index` as arguments where
`plus` is an array of added values, `minus` is an array of deleted
values, and `index` is the position of the change or undefined.  In that
case, `this` will be the collection that dispatches the event.

Alternately, you can dispatch events to a handler object.  If the
handler has a `handleContentChange` function (for noticing a change
after it has occurred) or a `handleContentWillChange` function (for
noticing a change before it has occurred), the event will be dispatched
to one of those.  The function has the same `(plus, minus, index)`
signature.

You can also dispatch change events to a DOM-compatible
`handleEvent(event)` method, in which case the handler will receive an
event with `phase`, `currentTarget`, `target`, `plus`, `minus`, and
`index` properties.  `phase` is either `"before"` or `"after"`.  The
targets are both the collection in flux.

-   `(plus, minus, index)`
-   `handleContentChange(plus, minus, index)`
-   `handleContentWillChange(plus, minus, index)`
-   `handleEvent({phase, currentTarget, target, plus, minus, index})`

The methods of the collection for managing content changes are generic,
in the `observable` module, and have the following forms:

-   `addContentChangeListener(listener, beforeChange)`
-   `removeContentChangeListener(listener, beforeChange)`
-   `dispatchContentChange(plus, minus, index)`
-   `addBeforeContentChangeListener(listener)`
-   `removeBeforeContentChangeListener(listener)`
-   `dispatchBeforeContentChange(plus, minus, index)`
-   `getContentChangeDescriptor()`


## List

Lists are backed by a cyclic doubly-linked list with a head node.  The
nodes are returned by "find" methods and accepted by "slice" and
"splice" as representatives of positions within the list.  Their
properties and methods are part of the interface of the structure.

-   `prev`: the previous node, or the `head` of the list if this is the
    first node
-   `next`: the next node, or the `head` of the list if this is the last
    node


## Set and Map

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


## Sorted Set and Sorted Map

A binary splay tree is a balanced binary tree that rotates the most
frequently used items toward the root such that they can be accessed the
most quickly.  `sorted-set` and `sorted-map` are backed by a splay tree.

All map implementations use an underlying set implementation.  Any map
can be implemented trivially atop a set by wrapping `compare`, `equals`,
or `hash` to operate on the key of an item.

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


## Object and Function Shims

The collection methods on the `Object` constructor all polymorphically
defer to the corresponding method of any object that implements the
method of the same name.  So, `Object.has` can be used to check whether
a key exists on an object, or in any collection that implements `has`.
This permits the `Object` interface to be agnostic of the input type.

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

`Function.noop` is returns undefined.

`Function.identity` returns its first argument.


## References

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

## Future work

Goals

- comprehensive specs and spec coverage tests
- item change dispatch and listeners for Map, SortedMap, FastMap
- remove iterator dependency of FastSet

More methods

- equals
- compare
- fast list splicing
- set intersection, union, difference, symmetric difference

More possible collections

- arc-set (adaptive replacement cache)
- arc-map
- sorted-list (sorted, can contain duplicates, perhaps backed by splay
  tree with relaxation on the uniqueness invariant)
- sorted-multi-map (sorted, can contain duplicate entries, perhaps
  backed by sorted-list)
- string-set (set of strings, backed by a trie)
- immutable-* (mutation functions return new objects that largely share
  the previous version's internal state, some perhaps backed by a hash
  trie)
- array heap implementation
- binary heap implementation

