## v1.2.3

- Dict Optimization to remove the need to mangle/unmangle keys. This minimize the amount of string creation and therefore garbage collection

## v1.2.2

- Vlad Alexandru Ionescu fixed a bug in dictionaries with single character keys.
- Optimizations for push to avoid creating unnecessary arrays through splice
- Fixes for a few regressions in listen and impacting Montage

## v1.2.0

-   Trevor Dixon fixed bugs in SortedSet find methods.
-   Adds toJSON method to all collections.
-   Adds deleteAll to some collections.
-   Eliminate some extra work in change listener registration and dispatch by
    using namespaced properties instead of a weak map, precomputing event
    handler method names, and reusing an array to capture a snapshot of active
    change listeners during dispatch.
-   Fix SortedArrayMap isSorted flag.
-   Fix Array find such that the sought value may be a wild card.
-   MultiMap provides the key to the bucket maker
-   Improve support for strings, maps, and arguments across implementations of
    addEach
-   Fix a bug in the generic join method
-   Dict uses $ in mangled names instead of ~, so names are more frequently
    valid identifiers. May have a performance win.
-   Ignore property changes in non-configurable objects.

## v1.1.0

-   Adds an LfuSet, a set useful as a cache with a least-frequently-used
    eviction strategy.
-   Fixes array `set` and `swap` for indexes outside the bounds of the existing
    array, for both observed and unobserved arrays.

## v1.0.2

-   Refinements on `Object.equals` and `Object.compare`. These are not
    necessarily backward compatible, but should be a strict improvement:
-   `Object.compare` will now return +/- Infinity for inequal strings,
    rather than +/- 1 which imply that the distance between any two inequal
    strings is always 1. `Object.compare` for numbers is suitable for finding
    the magnitude of the difference as well as the direction.
-   `Object.compare` and `Object.equals` will now delegate to either non-null,
    non-undefined argument if the other argument is null or undefined.
    This allows objects to be constructed that will identify themselves
    as equivalent to null or undefined, for example `Any` types, useful for
    testing.
-   `Object.equals` will only compare object literals derrived directly from the
    `Object.prototype`. All other objects that do not implement `compare` are
    incomparable.
-   First attempt at fixing `set`, `swap`, and `splice`, later fixed in v1.0.3.
    `splice` must truncate the `start` index to the array length. `swap` and
    `set` should not.

## v1.0.1

-   Bug fix for filter on map-like collections.

## v1.0.0 :cake:

-   Adds a Deque type based on a circular buffer of exponential
    capacity.  (@petkaantonov)
-   Implements `peek`, `peekBack`, `poke`, and `pokeBack` on array
    shim for Deque “isomorphism”.
-   Fixes the cases where a change listener is added or removed during
    change dispatch. Neither listener will be informed until the next
    change. (@asolove)
-   The property change listener system has been altered such that
    once a thunk has been installed on an object, it will not be
    removed, in order to avoid churn. Once a property has been
    observed, it is likely to be observed again.
-   Fixes `Object.equals` for comparing NaN to itself, which should
    report `true` such that collections that use `Object.equals` to
    identify values are able to find `NaN`. Previously, `NaN` could
    get stuck in a collection permanently.
-   In abstract, Collections previously identified duck types by
    looking only at the prototype chain, ignoring owned properties.
    Thus, an object could distinguish a property name that was being
    used as a key of a record, from the same property name that was
    being used as a method name. To improve performance and to face
    the reality that oftentimes an owned property is in fact a method,
    Collections no longer observe this distinction. That is, if an
    object has a function by the appropriate name, either by ownership
    or inheritance, it will be recognized as a method of a duck type.
    This particularly affects `Object.equals`, which should be much
    faster now.
-   Fixes `Object.equals` such that property for property comparison
    between objects only happens if they both descend directly from
    `Object.prototype`. Previously, objects would be thus compared if
    they both descended from the same prototype.
-   Accommodate *very* large arrays with the `swap` shim. Previously,
    the size of an array swap was limited by the size of the
    JavaScript run-time stack. (@francoisfrisch)
-   Fixes `splice` on an array when given a negative start index.
    (@stuk)
-   Some methods accept an optional `equals` or `index` argument
    that may or may not be supported by certain collections, like
    `find` on a `SortedSet` versus a `List`. Collections that do not
    support this argument will now throw an error instead of silently
    ignoring the argument.
-   Fixes `Array#clone` cycle detection.

## v0.2.2

-   `one` now returns a consistent value between changes of a sorted
    set.
-   All collections can now be required using the MontageJS style, as
    well as the Node.js style. I reserve the right to withdraw support
    for the current MontageJS style if in a future,
    backward-incompatible release of Montage migrated to the Node.js
    style.

## v0.2.1

-   Identify Maps with `isMap` property instead of `keys`, as ES6
    proposes `keys`, `values`, and `entries` methods for arrays.

## v0.2.0

-   Fixes the enumerability of dispatchesRangeChanges and
    dispatchesMapChanges on observable arrays (and others,
    incidentally).
-   List and Set now dispatch valid range changes, at the penalty of
    making updates linear when they are made observable.
-   Adds `join` method to generic collections.
-   Fixes a bug in `Object.has(object, value)`, where it would not
    delegate polymorphically to `object.has(value)`
-   Fixes `Object.addEach(object, undefined)`, such that it tolerates
    the case without throwing an error, like `addEach` on other
    collections.
-   Fixes change dispatch on LruSet (Paul Koppen) such that a single
    change event gets dispatched for both augmentation and truncation.
-   Fixes change dispatch on Dict, such that the value gets sent on
    addition.

## v0.1.24

-   Factored out WeakMap into separately maintained package.

## v0.1.23

-   Introduces `entries` and deprecates `items` on all map collections.
-   Fixes Map clear change dispatch.

## v0.1.22

-   Fixes Set clear change dispatch.

## v0.1.21

-   Fixes a bug when the `plus` argument of swap is not an array.

## v0.1.20

-   Fixes generic map change dispatch on clear.
-   Adds map change dispatch to Dict.

## v0.1.18, v0.1.19

-   Require total order on SortedSet
-   Remove Node v0.6 from supported versions
-   Add Node v0.10 to supported versions
-   Fixes `hrtime` handling (Alexy Kupershtokh)

## v0.1.17

...

## v0.0.5

-   The `observable-array` and `observable-object` modules have been
    moved to the Functional Reactive Bindings (`frb`) package as `array`
    and `object`.
-   `List`, `Set`, and `SortedSet` now support content change
    notifications compatibly with `frb`.
-   The `observable` module provides generics methods for observables.
    New collections need only call the appropriate dispatch functions if
    `isObservable` is true.

