
# Collections

This package contains JavaScript implementations of common data
structures with idiomatic iterfaces.

-   `List(copy, equals)`: an ordered collection of values with fast
    insertion and deletion and forward and backward traversal, backed by
    a cyclic doubly linked list with a head node.  Lists support most of
    the Array interface, except that they use and return nodes instead
    of integer indicies in analogous functions.
-   `Set(copy, equals, hash)`: a collection of unique values stored like
    a hash table.  The underlying storage is a plain JavaScript object
    that maps hashes to lists of values that share the same hash.
    Values may be objects.  The `equals` and `hash` functions can be
    overridden to provide alternate definitions of "unique".  This
    collection is intended to be replaced by a native implementation
    that does not rely on `hash`.
-   `Map(copy, equals, hash)`: a collection of key and value items with
    unique keys, backed by a set.  Keys may be objects.  This collection
    is intended to be replaced by a native implementation that does not
    rely on `hash`.
-   `SortedSet(copy, equals, compare)`: a collection of unique values
    stored in stored order, backed by a splay tree.  The `equals` and
    `compare` functions can be overridden to provide alternate
    definitions of "unique".
-   `SortedMap(copy, equals, compare)`: a collection of key value pairs
    stored in sorted order, backed by a sorted set.
-   `Iterator(iterable)`: a wrapper for any iterable that implements
    `iterate` or iterator the implements `next`, providing a rich lazy
    traversal interface.

## Collection Methods

-   `has(key)`: (Map, SortedMap) whether a value for the given key
    exists.
-   `has(value)`: (List, Set, SortedSet) whether a value exists.
    collection.  This is slow for list (linear), but fast (logarithmic)
    for Set and SortedSet.
-   `get(key)`: (Map, SortedMap) the value for a key, or undefined.
-   `get(value)`: (List, Set, SortedSet) gets the equivalent value, or
    undefined.
-   `set(key, value)`: (Map, SortedMap) sets the value for a key.
-   `add(value)`: (List, Set, SortedSet) adds a value.  Sets silently
    drop the value if an equivalent value already exists.
-   `add(value, key)`: (Map, SortedMap) sets the value for a key,
    convenient in conjunction with `forEach` due to the callback
    argument order.
-   `delete(key)`: (Map, SortedMap) deletes the value for a given key.
    Returns whether the key was found.
-   `delete(value)`: (List, Set, SortedSet) deletes a value.  Returns
    whether the value was found.
-   `find(value)`: (List, SortedSet) finds a value.  For List and Set,
    returns the node at which the value was found.
-   `findLast(value)`: (List) finds the last equivalent value, returning
    the node at which the value was found.
-   `findLeast()`: (SortedSet) finds the smallest value, returning the
    node at which it was found, or undefined.  This is fast
    (logarithmic) and performs no rotations.
-   `findLeastGreaterThan(value)`: (SortedSet) finds the smallest
    value greater than the given value.  This is fast (logarithic) but
    does cause rotations.
-   `findLeastGreaterThanOrEqual(value)`: (SortedSet) finds the
    smallest value greater than or equal to the given value.  This is
    fast (logarithmic) but does cause rotations.
-   `findGreatest()`: (SortedSet)
-   `findGreatestLessThan(value)`: (SortedSet)
-   `findGreatestLessThanOrEqual(value)`: (SortedSet)
-   `push(...values)`: (List, Array)
-   `pop()`: (List, Array)
-   `shift()`: (List, Array)
-   `unshift(...values)`: (List, Array)
-   `slice(start, end)`: (List, Array)
-   `splice(start, length, ...values)`: (List, Array)
-   `swap(start, length, values)`: (List) performs a splice without
    variadic arguments.
-   `concat(...iterables)`: (Iterator, TODO List)
-   `keys()`: (Map, SortedMap) returns an array of the keys
-   `values()`: (Map, SortedMap) returns an array of the values
-   `items()`: (`items`, SortedMap) returns an array of `[key, value]`
    pairs for each item
-   `reduce(callback(result, value, key, object, depth), basis, thisp)`:
    (Iterator, List, Set, Map, SortedSet, SortedMap)
-   `reduceRight(callback(result, value, key, object, depth), basis,
    thisp)`: (List, Map, SortedSet, SortedMap)
-   `forEach(callback(value, key, object, depth), thisp)`:
    (Iterator, List, Set, Map, SortedSet, SortedMap)
-   `map(callback(value, key, object, depth), thisp)`:
    (Iterator, List, Set, Map, SortedSet, SortedMap)
-   `toArray()`:
    (Iterator, List, Set, Map, SortedSet, SortedMap)
-   `filter(callback(value, key, object, depth), thisp)`:
    (List, Set, Map, SortedSet, SortedMap)
-   `every(callback(value, key, object, depth), thisp)`:
    (Iterator, List, Set, Map, SortedSet, SortedMap) whether every
    value passes a given guard.  Stops evaluating the guard after the
    first failure.  Iterators stop consuming after the the first
    failure.
-   `some(callback(value, key, object, depth), thisp)`:
    (List, Set, Map, SortedSet, SortedMap) whether there is a value that
    passes a given guard.  Stops evaluating the guard after the first
    success.  Iterators stop consuming after the first success.
-   `any()`: (Iterator, List, Set, Map, SortedSet, SortedMap) whether
    any value is truthy
-   `all()`: (Iterator, List, Set, Map, SortedSet, SortedMap) whether
    all values are truthy
-   `min()`: (Iterator, List, Set, Map, SortedSet, SortedMap) the
    smallest value.  This is fast for sorted collections (logarithic),
    but slow for everything else (linear).
-   `max()`: (Iterator, List, Set, Map, SortedSet, SortedMap) the
    largest value.  This is fast for sorted collections (logarithic),
    but slow for everything else (linear).
-   `one()`: (List, SortedSet) any single value, or throws an exception
    if there are no values.  This is very fast (constant) for all
    collections.  For a sorted set, the value is not deterministic.
-   `only()`: (List, SortedSet) the one and only value, or throws an
    exception if there are no values or more than one value.
-   `count()`: (List, Set, Map, SortedSet, SortedMap)
-   `sum()`: (Iterator, List, Set, Map, SortedSet, SortedMap)
-   `average()`: (Iterator, List, Set, Map, SortedSet, SortedMap)
-   `flatten()`: (Iterator, List, Set, Map, SortedSet, SortedMap)
-   `zip(...collections)`: (List, Set, Map, SortedSet, SortedMap)
-   `enuemrate(zero)`: (Iterator, TODO List, Set, Map, SortedSet,
    SortedMap)
-   `sorted(compare)`: (List, Set, Map)
-   `clone(depth, memo)`: (List, Set, Map, SortedSet, SortedMap)
    replicates the collection.  If `Object.clone` is shimmed, clones the
    values deeply, to the specified depth, using the given memo to
    resolve reference cycles (which must the `has` and `set` parts of
    the Map interface, allowing objects for keys)
-   `wipe()`: (List, Set, Map, SortedSet, SortedMap)
-   `equals(that)`: (TODO)
-   `compare(that)`: (TODO)
-   `iterate()`: (List, Set, SortedSet, SortedMap)
-   `iterate(start, end)`: (SortedSet) returns an iterator for all
    values in the half-open interval [start, end), that is, greater than
    start, and less than end.  The iterator is resilient against
    changes to the data.
-   `log(charmap, stringify)`: (Set, Map, SortedSet) writes a tree
    describing the internal state of the data structure to the console.
-   `splay(value)`: (SortedSet) rotates the internal splay tree such
    that the root node is less than or equal to the given value.

Iterator

-   `dropWhile(callback(value, index, iterator), thisp)`
-   `takeWhile(callback(value, index, iterator), thisp)`
-   `mapIterator(callback(value, index, iterator))`: (Iterator) returns
    an iterator for a mapping on the source values.  Values are consumed
    on demand.
-   `filterIterator(callback(value, index, iterator))`: (Iterator) returns
    an iterator for those values from the source that pass the given
    guard.  Values are consumed on demand.

Iterator utilities

-   `cycle(iterable, times)`
-   `concat(iterables)`
-   `transpose(iterables)`
-   `zip(...iterables)`: variadic transpose
-   `chain(...iterables)`: variadic concat
-   `range(start, stop, step)`: iterates from start to stop by step
-   `count(start, step)`: iterates from start by step, indefinitely
-   `repeat(value, times)`: repeats the given value either finite times
    or indefinitely

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

All "map" implementations use an underlying "set" implementation.  Any
map can be implemented trivially atop a set by wrapping "compare",
"equals", or "hash" to operate on the key of an item.

The default equality comparison function is `===` or `Object.equals` if
it is shimmed.  The default comparator uses `>` and `<` or
`Object.compare` if that has been shimmed.

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

- tests
- docs
- shallow change dispatch and listeners
- alternative module systems song and dance
- optional new on constructors
- missing value constructor

More methods

- equals
- compare
- fast list splicing

More collections

- sorted-list (sorted, can contain duplicates, perhaps backed by splay
  tree with relaxation on the uniqueness invariant)
- sorted-multi-map (sorted, can contain duplicate entries, perhaps
  backed by sorted-list)
- multi-map (unordered, can contain duplicates)
- ordered-set (preserves traversal order based on insertion, unique
  values)
- ordered-map (preserves traversal order based on insertion, unique
  keys)
- ordered-multi-map (preserves traversal order based on insertion, may
  contain duplicate keys)
- string-set (set of strings, backed by a trie)
- dict (string-map, map of strings to values, backed by a string set)
- immutable-* (mutation functions return new objects that largely share
  the previous version's internal state, some perhaps backed by a hash
  trie)
- lru-set (least recently used cache)
- lru-map
- arc-set (adaptive replacement cache)
- arc-map

Consolidate shims from ES5-Shim and elsewhere

- weak-map-shim
- object-shim
- object-sham
- array-shim
- array-sham
- date-shim

- array heap implementation
- binary heap implementation

