
# Collections

This package contains JavaScript implementations of common data
structures with idiomatic iterfaces.

-   `sorted-set` a collection of unique values stored in stored order,
    backed by a splay tree.  The `equals` and `compare` functions can be
    overridden to provide alternate definitions of "unique".
-   `sorted-map` a collection of key value pairs stored in sorted order,
    backed by a sorted set.
-   `list` an ordered collection of values with fast insertion and
    deletion and forward and backward traversal, backed by a cyclic
    doubly linked list with a head node.
-   `iterator` a wrapper for any iterator the implements `next`,
    providing a rich lazy traversal interface.
-   `reducible` provides generic array-like methods for collections that
    implement `reduce`.

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
- incorporate iterability
- incorporate comprehensive introspection functions for slicing ranges
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

