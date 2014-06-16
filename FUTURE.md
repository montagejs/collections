
## Future work

Goals

- make array dispatch length property changes between range changes to
  be consistent with List.
- comprehensive specs and spec coverage tests
- fast list splicing
- revise map changes to use separate handlers for add/delete
- revise tokens for range and map changes to specify complete alternate
  delegate methods, particularly for forwarding directly to dispatch
- Make it easier to created a SortedSet with a criterion like
  Function.by(Function.get('name'))
- evaluate exposing observeProperty, observeRangeChange, and observeMapChange
  instead of the aEL/rEL inspired API FRB exposes today, to minimize
  book-keeping and garbage collection
- possibly refactor to make shimming more opt-in

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
- array set (a set, for fast lookup, backed by an array for meaningful
  range changes)

