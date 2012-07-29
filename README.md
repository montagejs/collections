
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
    overridden to provide alternate definitions of "unique".
-   `Map(copy, equals, hash)`: a collection of key and value items with
    unique keys, backed by a set.  Keys may be objects.
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
-   `keys()`: (Map, SortedMap) returns an array of the keys
-   `values()`: (Map, SortedMap) returns an array of the values
-   `items()`: (`items`, SortedMap) returns an array of `[key, value]`
    pairs for each item
-   `reduce(callback(result, value, key, object, depth), basis, thisp)`: (List, Set, Map, SortedSet, SortedMap)
-   `reduceRight(callback(result, value, key, object, depth), basis, thisp)`: (List, Map, SortedSet, SortedMap)
-   `forEach(callback(value, key, object, depth), thisp)`: (List, Set, Map, SortedSet, SortedMap)
-   `map(callback(value, key, object, depth), thisp)`: (List, Set, Map, SortedSet, SortedMap)
-   `toArray()`: (List, Set, Map, SortedSet, SortedMap)
-   `filter(callback(value, key, object, depth), thisp)`: (List, Set, Map, SortedSet, SortedMap)
-   `every(callback(value, key, object, depth), thisp)`: (List, Set, Map, SortedSet, SortedMap)
-   `some(callback(value, key, object, depth), thisp)`: (List, Set, Map, SortedSet, SortedMap)
-   `any()`: (List, Set, Map, SortedSet, SortedMap) whether any value is
    truthy
-   `all()`: (List, Set, Map, SortedSet, SortedMap) whether all values
    are truthy
-   `min()`: (List, Set, Map, SortedSet, SortedMap) the smallest value.
    This is fast for sorted collections (logarithic), but slow for
    everything else (linear).
-   `max()`: (List, Set, Map, SortedSet, SortedMap) the largest value.
    This is fast for sorted collections (logarithic), but slow for
    everything else (linear).
-   `one()`: (List, SortedSet) any single value, or throws an exception
    if there are no values.  This is very fast (constant) for all
    collections.  For a sorted set, the value is not deterministic.
-   `only()`: (List, SortedSet) the one and only value, or throws an
    exception if there are no values or more than one value.
-   `count()`: (List, Set, Map, SortedSet, SortedMap)
-   `sum()`: (List, Set, Map, SortedSet, SortedMap)
-   `average()`: (List, Set, Map, SortedSet, SortedMap)
-   `flatten()`: (List, Set, Map, SortedSet, SortedMap)
-   `clone(depth, memo)`: (SortedSet, TODO all others)
-   `wipe()`: (SortedSet, TODO all others)
-   `iterate()`: (List, Set, SortedSet, SortedMap)
-   `iterate(start, end)`: (SortedSet) returns an iterator for all
    values in the half-open interval [start, end), that is, greater than
    start, and less than end.  The iterator is resilient against
    changes to the data.
-   `log(charmap, stringify)`: (Set, Map, SortedSet) writes a tree
    describing the internal state of the data structure to the console.
-   `splay(value)`: (SortedSet) rotates the internal splay tree such
    that the root node is less than or equal to the given value.

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

- tests
- docs
- hash string map and set, using underlying object
- relax unique content constraint on splay trees to implement splay
  list and splay multi-map
- LRU cache sets and maps
- ARC cache sets and maps
- ordered set type based on list
- trie set and map
- immutable set and map structures using hash tries
- heap
- binary heap
- observable variants of all collection types
- alternative module systems song and dance

