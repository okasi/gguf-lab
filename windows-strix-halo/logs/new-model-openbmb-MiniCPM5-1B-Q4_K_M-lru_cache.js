"use strict";
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
const C;
const N;
We;
'll use an array `cache` of size C, but we may use a map to store the value for a key.;
But;
for (O(1); amortized, we; can)
    use;
an;
array;
and;
a;
counter;
for (the; order.
    Let; 's use a simple list: `cache` array of size C, but we can also use a map from key to index in the array.)
    Alternatively, we;
can;
use;
a;
stack: we;
push;
new key;
when;
inserting(after, making, it, most, recent);
and;
pop;
from;
stack;
when;
evicting.
    However, when;
we;
have;
a;
PUT;
operation, we;
need;
to;
move;
the;
key;
to;
the;
most;
recent;
position.We;
can;
do
    : When;
while (we);
insert;
a;
key(not in cache);
-If;
cache;
size < C, push;
key;
and;
mark;
recent(maybe, by, setting, a, flag).
    - If;
cache;
size = C, find;
the;
least;
recently;
used(the, one, at, the, beginning, of, the, array);
if (we)
    use;
an;
array;
and;
pop;
from;
front ? but : ;
array;
pop;
from;
front;
is;
not;
O(1) in JavaScript ? Actually : , pop;
from;
front in array;
is;
O(n) in JavaScript ? Wait : , we;
can;
use;
a;
linked;
list ? But : ;
we;
are in TypeScript, we;
don;
't have a built-in doubly linked list.;
We;
are;
required;
O(1);
amortized;
per;
operation.So;
we;
need;
to;
use;
a;
data;
structure;
that;
allows;
O(1);
removal;
and;
insertion.
;
One;
way: use;
an;
array;
and;
mark;
the;
positions, but;
removal;
of;
the;
least;
recently;
used;
is;
O(n);
because;
we;
have;
to;
scan;
the;
array.
    However, the;
constraint;
is;
amortized;
O(1), so;
we;
can;
use;
a;
combination;
of;
a;
hash;
map;
and;
a;
linked;
list ? But : ;
we;
are;
not;
allowed;
to;
use / dev / stdin.
    Let;
's think: We can use a set to store the order? But set does not maintain order.;
Alternatively, we;
can;
use;
a;
binary;
heap ? But : ;
that;
is;
more;
complex.
;
Since;
the;
problem;
says;
O(1);
amortized;
per;
operation, we;
can;
use;
a;
combination;
of;
an;
array;
and;
a;
map;
to;
store;
the;
value, and;
then;
for (order; we; can)
    use;
a;
trick: we;
store;
the;
keys in the;
array;
and;
also;
maintain;
a;
separate;
map;
from;
index;
to;
key.But;
then;
to;
find;
the;
least;
recently;
used, we;
might;
need;
to;
scan;
the;
array, which;
is;
O(n) in worst;
But;
note: The;
number;
of;
operations;
is;
up;
to;
300000, and;
C;
up;
to;
200000.;
So;
O(n);
might;
be;
acceptable ? But : ;
we;
are;
required;
O(1);
amortized.
    Let;
's read: "O(1) amortized per operation." So we need to guarantee that each operation costs O(1) amortized.;
How;
to;
achieve;
O(1);
amortized ? We : ;
can;
use;
a;
data;
structure;
like;
a;
"lRU cache";
that;
uses;
a;
combination;
of;
a;
hash;
map;
and;
a;
doubly;
linked;
list.But;
implementing;
doubly;
linked;
list in TypeScript;
is;
not;
trivial.
;
We;
can;
use;
an;
array;
and;
mark;
the;
order;
by;
function () { }
var a, counter, that, points, to, the, end, cache, nodes, an, array, and, a, map, and, accept, that, the, ordering, is, O, C, cache, indexMap, headIndex;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    a = __addDisposableResource(env_1, void 0, false), counter = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), points = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), end = __addDisposableResource(env_1, void 0, false);
    of;
    the;
    array.When;
    we;
    insert, we;
    add;
    to;
    the;
    end;
    and;
    increment;
    the;
    counter.When;
    we;
    delete , we;
    mark;
    the;
    key;
    at;
    the;
    beginning(or, at, the, beginning, of, the, array).Then;
    the;
    least;
    recently;
    used;
    is;
    the;
    one;
    with (the)
        smallest;
    counter;
    value.
    ;
    We;
    can;
    store;
    the;
    keys in an;
    array;
    and;
    also;
    have;
    a;
    map;
    from;
    key;
    to;
    index(or, to, a, flag);
    for (deletion;;)
        .But;
    to;
    find;
    the;
    least;
    recently;
    used, we;
    need;
    to;
    know;
    the;
    minimum;
    index.That;
    would;
    be;
    O(n);
    if (we)
        scan.
        ;
    But;
    we;
    can;
    use;
    a;
    trick: we;
    only;
    need;
    to;
    know;
    the;
    least;
    recently;
    used;
    when;
    we;
    are;
    deleting.We;
    can;
    maintain;
    a;
    heap ? But : ;
    again, O(1);
    amortized;
    heap ? Not : ;
    exactly.
        Let;
    's consider a simpler approach: We will use an array `cache` of size C, and we will use an index to store the position of the key in the array. We will also maintain a map from key to index. Then, when we insert, we will put the key at the end of the array (so that the most recently used is at the end). When we delete, we will remove the key at the beginning (least recently used) and mark it deleted. Then the least recently used is the one with the smallest index (which we can track by maintaining a min index variable?).;
    But;
    to;
    maintain;
    O(1);
    amortized, we;
    need;
    to;
    update;
    the;
    min;
    index;
    when;
    we;
    insert;
    and;
    delete .That;
    is;
    tricky.
    ;
    Given;
    the;
    constraints, we;
    might;
    be;
    able;
    to;
    use;
    a;
    hash;
    map;
    and;
    an;
    array, and;
    accept;
    O(n);
    for (finding; the; least)
        recently;
    used ? But : ;
    the;
    problem;
    says;
    O(1);
    amortized;
    per;
    operation, so;
    we;
    should;
    avoid;
    O(n).
        Let;
    's think of a data structure that supports:
        - Insert(key);
    O(1)
        - Delete(key);
    O(1)
        - Get(key);
    O(1);
    But;
    ordering: we;
    need;
    to;
    know;
    which;
    key;
    is;
    most;
    recently;
    used.That;
    is;
    the;
    one;
    with (the)
        highest;
    index(or, lowest, index);
    if (we)
        reverse;
    We;
    can;
    use;
    a;
    combination;
    of;
    a;
    hash;
    map;
    to;
    store;
    the;
    value;
    and;
    a;
    doubly;
    linked;
    list.But;
    implementing;
    a;
    doubly;
    linked;
    list in TypeScript;
    is;
    not;
    too;
    hard: we;
    can;
    have;
    an;
    array;
    of;
    nodes, but;
    we;
    don;
    't know the size C beforehand. We can allocate a list of size C? But C is at most 200000, so we can allocate an array of 200001.;
    However, we;
    don;
    't know C at the beginning? The input gives C as first line. So we know C.;
    So;
    we;
    can;
    allocate;
    an;
    array;
    of;
    size;
    C.
        Let;
    's design:;
    cache = new Array(C).fill(0); // [index, value]? or just an array of values?
    We;
    need;
    to;
    store;
    the;
    key;
    and;
    value ? Actually : , the;
    problem;
    says;
    keys;
    are;
    strings, values;
    are;
    integers.So;
    we;
    store;
    the;
    key;
    and;
    the;
    value.
    ;
    But;
    for (order, we; only; need)
        to;
    know;
    the;
    key.So;
    we;
    can;
    store;
    the;
    key;
    and;
    its;
    value in the;
    cache;
    array.
    ;
    We;
    will;
    use;
    an;
    array `cache`;
    of;
    size;
    C, and;
    we;
    will;
    map;
    from;
    key;
    to;
    its;
    index in the;
    array.
    ;
    But;
    when;
    we;
    insert;
    a;
    key;
    that;
    is;
    not in cache, we;
    put;
    it;
    at;
    the;
    end(index = C - 1).Then;
    when;
    we;
    delete , we;
    remove;
    the;
    key;
    at;
    the;
    beginning(index = 0);
    and;
    mark;
    it;
    deleted.
    ;
    So;
    we;
    need;
    to;
    maintain;
    a;
    map;
    from;
    key;
    to;
    its;
    index.We;
    can;
    use;
    a;
    Map: `keyMap: Map<string, number>`.
        However, ;
    for (O(1); amortized, we; need)
        to;
    update;
    the;
    index;
    when;
    we;
    insert;
    and;
    delete .So;
    we;
    can;
    maintain;
    an;
    array `indexMap`;
    that;
    maps;
    key;
    to;
    its;
    current;
    index.But;
    when;
    we;
    insert;
    at;
    the;
    end, we;
    update;
    the;
    indexMap;
    for (that; key; to)
        the;
    end;
    index(which, increases, over, time).When;
    we;
    delete , we;
    remove;
    the;
    key;
    from;
    indexMap.
    ;
    But;
    if (we)
        delete a;
    key;
    that;
    is;
    at;
    the;
    end(least, recently, used);
    we;
    remove;
    from;
    the;
    beginning, so;
    the;
    index;
    changes.
        Let;
    's define:;
    Let `cache`;
    array;
    of;
    size;
    C, initially;
    empty.
        Let `indexMap`;
    map;
    from;
    key;
    to;
    index(0, to, C - 1).
        Insert(PUT);
    If;
    key;
    is in cache, update;
    its;
    index;
    to;
    the;
    end(so, that, it, becomes, most, recent).Actually, we;
    can;
    mark;
    that;
    by;
    setting;
    indexMap[key] = the;
    end;
    index.Then;
    we;
    don;
    't need to update the map.;
    If;
    key;
    is;
    not in cache, we;
    add;
    it;
    at;
    the;
    end: set;
    indexMap[key] = cache.length(which, is, C - 1).Then;
    set;
    the;
    last;
    element;
    to;
    the;
    key ? Actually : , we;
    can;
    store;
    the;
    key in the;
    cache;
    array;
    at;
    index;
    cache.length - 1.;
    So;
    we;
    can;
    do
        : function insert(key) {
            let newIndex = cache.length;
            cache[cache.length - 1] = [key, key]; // store key and value? Actually we can store just key, but we need value for output. So we store [key, value].
            indexMap[key] = newIndex;
        }
    while (But);
    wait, when;
    we;
    delete , we;
    need;
    to;
    remove;
    the;
    key;
    at;
    the;
    beginning.So;
    we;
    need;
    to;
    find;
    the;
    key;
    and;
    set;
    its;
    index;
    to - 1;
    or;
    remove;
    it.But;
    we;
    don;
    't have a direct way to remove a key from an indexMap because the indexMap stores the index, and the index is changing.;
    So;
    we;
    need;
    to;
    update;
    the;
    index;
    when;
    we;
    insert;
    and;
    delete .
        Alternatively, we;
    can;
    use;
    a;
    linked;
    list;
    with (an)
        array;
    of;
    nodes.We;
    can;
    store;
    the;
    key in an;
    array;
    node;
    at;
    a;
    given;
    index.Then;
    for (deletion, we; set; the)
        node;
    at;
    index;
    0;
    to;
    null;
    and;
    remove;
    from;
    index;
    0.;
    Then;
    we;
    update;
    the;
    indexMap;
    for (the; removed; key)
        to - 1.;
    But;
    implementing;
    a;
    doubly;
    linked;
    list in TypeScript;
    is;
    not;
    trivial.We;
    can;
    do
        it;
    while ();
    with (an)
        array;
    and;
    a;
    counter, but;
    we;
    don;
    't have a clear linked list structure.;
    Given;
    the;
    time, we;
    might;
    not;
    be;
    able;
    to;
    implement;
    an;
    O(1);
    amortized;
    data;
    structure.
        Let;
    's reconsider: The problem says "O(1) amortized per operation". It might be that we are allowed to use a data structure that has O(1) amortized? Actually, the LRU cache typically uses a hash map for O(1) lookup, but the ordering is done by a doubly linked list which is O(1) for insert and delete if we have a pointer to the node. But we don';
    t;
    have;
    pointers.
    ;
    We;
    can;
    implement;
    a;
    doubly;
    linked;
    list;
    with (the)
        node;
    at;
    index;
    0.;
    So;
    we;
    can;
    have;
    an;
    array;
    of;
    nodes: we;
    allocate;
    an;
    array;
    of;
    size;
    C(or, at, least, 200000);
    for (the; nodes.But; we)
        don;
    't know C at the beginning? The input gives C, so we know C. So we can allocate an array of size C.;
    So;
    we;
    can;
    do
        : const C;
    while ();
    nodes = new Array(C).fill(null);
    We;
    create;
    a;
    node;
    for (each; key ? Actually : , we; only)
        need;
    to;
    store;
    the;
    key;
    and;
    value, so;
    we;
    can;
    store;
    the;
    key;
    node;
    's value.;
    But;
    then;
    we;
    need;
    to;
    have;
    a;
    pointer;
    to;
    the;
    node;
    at;
    index;
    0 ? We : ;
    can;
    set;
    the;
    node;
    at;
    index;
    0;
    to;
    the;
    latest;
    key.
        Let;
    's design:;
    We;
    will;
    have;
    an;
    array `cache`;
    of;
    size;
    C, but;
    we;
    will;
    also;
    maintain;
    a `indexMap`;
    from;
    key;
    to;
    index.
    ;
    We;
    will;
    also;
    have;
    a `head`;
    node;
    that;
    is;
    the;
    least;
    recently;
    used ? Actually : , we;
    can;
    set;
    the;
    head;
    of;
    the;
    list;
    to;
    be;
    the;
    most;
    recently;
    used ? But : ;
    then;
    we;
    need;
    to;
    remove;
    the;
    head;
    when;
    we;
    insert.
    ;
    This;
    is;
    getting;
    complex.
    ;
    Given;
    the;
    constraints, I;
    think;
    we;
    can;
    implement;
    a;
    simple;
    LRU;
    cache;
    an = __addDisposableResource(env_1, void 0, false), array = __addDisposableResource(env_1, void 0, false), and = __addDisposableResource(env_1, void 0, false), a = __addDisposableResource(env_1, void 0, false), map = __addDisposableResource(env_1, void 0, false), and = __addDisposableResource(env_1, void 0, false), accept = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), ordering = __addDisposableResource(env_1, void 0, false), is = __addDisposableResource(env_1, void 0, false), O = __addDisposableResource(env_1, void 0, false);
    (n);
    for (some; operations ? But : ; the)
        problem;
    says;
    O(1);
    amortized, so;
    we;
    must;
    avoid;
    O(n).
        Let;
    's read the problem again: "O(1) amortized per operation." So we must guarantee that each operation takes O(1) amortized time.;
    There;
    is;
    a;
    known;
    data;
    structure: the;
    "LRU cache";
    with (a)
        hash;
    map;
    and;
    a;
    doubly;
    linked;
    list.The;
    doubly;
    linked;
    list;
    can;
    be;
    implemented;
    with (an)
        array;
    of;
    nodes, but;
    we;
    need;
    to;
    maintain;
    the;
    list in a;
    way;
    that;
    removal;
    at;
    the;
    beginning;
    is;
    O(1).We;
    can;
    have;
    an;
    array `lru`;
    that;
    points;
    to;
    the;
    head.Then;
    when;
    we;
    insert, we;
    add;
    at;
    the;
    end;
    and;
    update;
    the;
    head.When;
    we;
    delete , we;
    remove;
    from;
    the;
    head;
    and;
    update;
    the;
    head.
    ;
    So;
    we;
    can;
    implement: Let `cache`;
    be;
    an;
    array;
    of;
    size;
    C(or, a, list, of, nodes).We;
    will;
    store;
    the;
    key in the;
    node.
    ;
    We;
    will;
    have;
    a;
    `insert(key)`;
    -If;
    key;
    is in cache, update;
    its;
    position(most, recent);
    at;
    the;
    end.
        - Else, add;
    the;
    key;
    to;
    the;
    end;
    of;
    the;
    list, and;
    update;
    the;
    head;
    to;
    point;
    to;
    this;
    new key.
    ;
    We;
    need;
    to;
    maintain;
    the;
    head;
    so;
    that;
    when;
    we;
    delete , we;
    remove;
    from;
    head.
    ;
    So;
    we;
    can;
    have;
    an;
    array `cache`;
    that;
    stores;
    the;
    key;
    at;
    each;
    index.We;
    also;
    have;
    a `headIndex`;
    which;
    is;
    the;
    index;
    of;
    the;
    least;
    recently;
    used;
    node.
    ;
    We;
    can;
    implement: Let `cache`;
    array;
    of;
    size;
    C, initially;
    empty(but, we, may, not, use, all, initially);
    Let `headIndex`;
    the;
    index;
    of;
    the;
    least;
    recently;
    used;
    node.Initially - 1.;
    When;
    we;
    insert;
    a;
    key: -If;
    the;
    key;
    is;
    already in cache, we;
    update;
    its;
    position;
    to;
    the;
    end(by, moving, it, to, the, end).But;
    we;
    can;
    do
        : if (the)
            key;
    while (is);
    at;
    headIndex, then;
    we;
    update;
    headIndex;
    to;
    the;
    end;
    index.Otherwise, we;
    update;
    the;
    key;
    at;
    headIndex;
    to;
    the;
    end;
    index.
        - If;
    the;
    key;
    is;
    not in cache, we;
    add;
    it;
    at;
    the;
    end(index = cache.length - 1), and;
    set;
    headIndex;
    to;
    the;
    end;
    index.
    ;
    When;
    we;
    delete a;
    key: -If;
    the;
    key;
    is;
    at;
    headIndex, then;
    we;
    remove;
    it;
    from;
    headIndex;
    and;
    update;
    headIndex;
    to;
    the;
    next;
    index.
        - Otherwise, we;
    update;
    the;
    key;
    at;
    headIndex;
    to;
    the;
    next;
    index.
    ;
    This;
    way, the;
    order;
    is;
    maintained;
    at;
    the;
    head.
    ;
    But;
    we;
    need;
    to;
    update;
    the;
    map;
    from;
    key;
    to;
    index;
    when;
    we;
    remove.So;
    we;
    maintain `indexMap`.
        Let;
    's define:;
    cache = new Array(C).fill([]); // each element is [key, value]
    indexMap = new Map();
    headIndex = -1; // the index of the least recently used node
    Insert(PUT);
    if (indexMap.has(key)) {
        // key exists
        // Update the key to most recent: move it to the end
        updateKeyToEnd(key);
    }
    else {
        // new key
        // Add at the end
        cache[cache.length - 1] = [key, key];
        indexMap.set(key, cache.length - 1);
        // Update headIndex to the end index? Actually, headIndex should be the index of the least recently used, which is the first node.
        // So we update headIndex to the end index? But that would mean the first node becomes most recent? That's wrong.
        // Actually, we maintain that the headIndex is the index of the least recently used. So when we add a new key, we update headIndex to the end index? No, we want the least recently used to be at headIndex. So when we insert a new key, we should update headIndex to the index of the new key? But that would make the new key least recent? Actually, we insert at the end, so the new key is most recent.
        // Let's think: We want the least recently used to be at headIndex. So when we insert a new key, we should update headIndex to the end index? That would mean the new key is least recent? No, we insert at the end, so the new key is most recent. So we should update headIndex to the end index? But then headIndex would be the least recent? Let's set headIndex to 0 initially.
        // Actually, we can set headIndex to 0, and that means the first node (head) is the least recently used? That's confusing.
        // Let's set headIndex to the index of the first node (which is 0). Then when we insert a new key, we add it at the end, so the head remains at 0, and the new key is not at head. Then the least recently used is at headIndex=0. So we need to update headIndex when we remove.
        // So we will not update headIndex when inserting new key. We will only update headIndex when deleting.
        // When we delete, we remove from headIndex and update headIndex.
        // So in insert:
        if (indexMap.has(key)) {
            // update key to end
            moveKeyToEnd(key);
        }
        else {
            // add at the end
            cache[cache.length - 1] = [key, key];
            indexMap.set(key, cache.length - 1);
            // headIndex remains unchanged
        }
        Delete(DEL);
        if (indexMap.has(key)) {
            // remove from headIndex
            const oldIndex = headIndex;
            if (oldIndex === 0) {
                // head is the key to remove
                const keyToRemove = cache[oldIndex];
                // update headIndex to next index
                headIndex = (headIndex === 0) ? 1 : oldIndex + 1;
                // remove from map
                indexMap.delete(keyToRemove);
            }
            else {
                // update key at headIndex to next index
                const keyAtHead = cache[headIndex];
                moveKeyToNext(keyAtHead);
                headIndex = (headIndex === 0) ? 1 : headIndex + 1;
            }
        }
        else {
            // key
        }
        // key
    }
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
