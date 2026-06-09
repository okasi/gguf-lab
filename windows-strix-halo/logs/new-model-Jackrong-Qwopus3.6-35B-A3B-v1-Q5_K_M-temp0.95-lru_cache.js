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
class Node {
}
But;
we;
can;
use;
a;
class {
}
with (public)
    fields.
        However, note;
the;
keys;
are;
non - empty;
strings;
without;
spaces.Values;
are;
signed;
32 - bit;
integers.
;
But;
wait: the;
problem;
says;
"signed 32-bit integers", but in TypeScript, numbers;
are;
64 - bit;
floats.However, ;
for (the; range - 2 ^ 31; to)
    2 ^ 31 - 1, we;
are;
safe;
because;
integers in that;
range;
can;
be;
represented;
exactly in double.
;
Steps;
for (eviction; ; )
    : When;
we;
need;
to;
evict, we;
remove;
the;
node;
just;
before;
the;
tail(tail.prev).But;
note: if (we)
    have;
sentinel;
nodes, then;
tail.prev;
is;
the;
least;
recent.
    However, ;
if (the)
    cache;
is;
full(size == C);
and;
we;
are;
inserting;
a;
new key, then;
we;
remove;
the;
node;
at;
tail.prev.
;
But;
note: we;
must;
update;
the;
cache;
map;
when;
we;
remove.
    Implementation;
Let;
's define:;
const cache = new Map();
const head = new Node('', -1, null, null); // dummy head
const tail = new Node('', -1, null, null); // dummy tail
head.next = tail;
tail.prev = head;
We;
'll also maintain a counter for the current size? Actually, we can use cache.size.;
However, note;
when;
we;
update;
an;
existing;
key, we;
don;
't change the size. So we only increment when we add a new key.;
But;
wait: when;
we;
evict, we;
remove;
one;
and;
then;
add;
one, so;
size;
remains;
the;
same.
;
We;
can;
use;
cache.size;
to;
check.
;
Steps;
for (PUT; ; )
    : const [op, key, valueStr] = line.split(' ');
const value = parseInt(valueStr);
if (cache.has(key)) {
    // update value and move to front
    const node = cache.get(key);
    node.value = value;
    // move to front
    remove(node);
    add(node);
}
else {
    if (cache.size >= C) {
        // evict the least recently used: which is tail.prev
        const lru = tail.prev;
        // remove lru from the list and from cache
        remove(lru);
        cache.delete(lru.key);
    }
    // add new node at front
    const node = new Node(key, value, null, null);
    add(node);
    cache.set(key, node);
}
Steps;
for (GET; ; )
    : const [op, key] = line.split(' ');
if (cache.has(key)) {
    const node = cache.get(key);
    // move to front
    remove(node);
    add(node);
    // record the value
    getResults.push(node.value.toString());
}
else {
    getResults.push("-1");
}
Steps;
for (DEL; ; )
    : const [op, key] = line.split(' ');
if (cache.has(key)) {
    const node = cache.get(key);
    remove(node);
    cache.delete(key);
}
But;
note: we;
must;
not;
add;
the;
node;
to;
getResults;
for (DEL; or; PUT.
    However, the)
    problem;
says: "GET should output the value if present, otherwise -1, and a successful GET makes the key most recently used.";
So;
we;
only;
output;
for (GET; operations.
; After)
    all;
operations, we;
traverse;
the;
list;
from;
head.next;
to;
tail;
to;
get;
the;
keys in order;
from;
most;
recent;
to;
least;
recent.
;
But;
note: the;
doubly;
linked;
list;
is;
maintained;
by;
our;
operations.
    Let;
's write the helper functions:;
function add(node) {
    // node will be added right after head
    node.prev = head;
    node.next = head.next;
    head.next.prev = node;
    head.next = node;
}
function remove(node) {
    const prev = node.prev;
    const next = node.next;
    if (prev)
        prev.next = next;
    if (next)
        next.prev = prev;
}
However, note;
we;
are;
function () { }
function main() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    // Filter out empty lines?
    const lines = input.filter(line => line.trim() !== '');
    if (lines.length === 0) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    const [C, N] = lines[0].split(' ').map(Number);
    const operations = lines.slice(1, 1 + N);
    const cache = new Map();
    const head = new Node('', -1, null, null); // dummy head
    const tail = new Node('', -1, null, null); // dummy tail
    head.next = tail;
    tail.prev = head;
    const getResults = [];
    // Helper functions
    function add(node) {
        // node will be added right after head
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }
    function remove(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev)
            prev.next = next;
        if (next)
            next.prev = prev;
    }
    for (const op of operations) {
        const parts = op.trim().split(' ');
        if (parts.length === 0)
            continue;
        const command = parts[0];
        if (command === 'PUT') {
            if (parts.length < 3)
                continue; // invalid, skip?
            const key = parts[1];
            const value = parseInt(parts[2]);
            if (cache.has(key)) {
                // update and move to front
                const node = cache.get(key);
                node.value = value;
                remove(node);
                add(node);
            }
            else {
                if (cache.size >= C) {
                    // evict the least recently used: the node just before tail
                    const lru = tail.prev;
                    // remove lru from the list and from cache
                    remove(lru);
                    cache.delete(lru.key);
                }
                const node = new Node(key, value, null, null);
                add(node);
                cache.set(key, node);
            }
        }
        else if (command === 'GET') {
            if (parts.length < 2)
                continue;
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key);
                // move to front
                remove(node);
                add(node);
                getResults.push(node.value.toString());
            }
            else {
                getResults.push("-1");
            }
        }
        else if (command === 'DEL') {
            if (parts.length < 2)
                continue;
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key);
                remove(node);
                cache.delete(key);
            }
        }
    }
    // Output GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    // Output remaining keys in order
    const keys = [];
    let current = head.next;
    while (current !== tail) {
        keys.push(current.key);
        current = current.next;
    }
    if (keys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keys.join(" "));
    }
}
var sentinel, nodes, so, head, next, and, tail, prev, will, always, exist, when, we, add, time, a, Map, C, N, operations, firstLine, C, N, operations, operations, operations, operations, keys, current, fs, readFileSync, Node;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    sentinel = __addDisposableResource(env_1, void 0, false), nodes = __addDisposableResource(env_1, void 0, false), so = __addDisposableResource(env_1, void 0, false), head = __addDisposableResource(env_1, void 0, false), next = __addDisposableResource(env_1, void 0, false), and = __addDisposableResource(env_1, void 0, false), tail = __addDisposableResource(env_1, void 0, false), prev = __addDisposableResource(env_1, void 0, false), will = __addDisposableResource(env_1, void 0, false), always = __addDisposableResource(env_1, void 0, false), exist = __addDisposableResource(env_1, void 0, false), when = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), add = __addDisposableResource(env_1, void 0, false);
    /remove?;
    But;
    when;
    we;
    remove;
    the;
    last;
    node(the, only, node, besides, sentinels), then;
    node.prev;
    and;
    node.next;
    will;
    be;
    head;
    and;
    tail;
    respectively, which;
    are;
    not;
    null.
    ;
    But in the;
    remove;
    we;
    are;
    setting;
    prev.next;
    and;
    next.prev.We;
    must;
    ensure;
    that;
    prev;
    and;
    next;
    are;
    not;
    null ? Actually : , because;
    of;
    sentinels, they;
    won;
    't be null when we remove a real node? ;
    However, when;
    we;
    remove;
    a;
    node;
    that;
    is;
    at;
    the;
    head(after, head);
    or;
    at;
    the;
    tail(before, tail), then;
    the;
    prev;
    or;
    next;
    might;
    be;
    the;
    sentinel.But;
    that;
    's okay because the sentinel nodes have prev and next set appropriately.;
    But;
    note: when;
    we;
    remove;
    a;
    node, we;
    are;
    breaking;
    the;
    links.We;
    must;
    set;
    the;
    prev;
    and;
    next;
    of;
    the;
    neighbors;
    to;
    point;
    to;
    each;
    other.
        Example;
    head -  > A -  > B -  > tail;
    If;
    we;
    remove;
    B: A.next = B.next(which, is, tail);
    tail.prev = B.prev(which, is, A);
    So;
    it;
    works.
        However, we;
    must;
    be;
    cautious: when;
    we;
    add;
    a;
    node, we;
    set;
    its;
    prev;
    and;
    next.Then;
    we;
    link;
    the;
    neighbors.
    ;
    But;
    note: when;
    we;
    add;
    a;
    node;
    at;
    the;
    front, we;
    set: node.prev = head;
    node.next = head.next; // which was the old first node (or tail if empty)
    head.next.prev = node; // the old first node (or tail) now has prev = node
    head.next = node; // head points to the new node
    This;
    is;
    standard.
    ;
    But;
    wait: what;
    if (the)
        list;
    is;
    empty ?
        Initially : head -  > tail;
    Then;
    we;
    add;
    node;
    A: A.prev = head;
    A.next = tail;
    tail.prev = A;
    head.next = A;
    Then;
    if (we)
        add;
    node;
    B: B.prev = head;
    B.next = head.next(which, is, A);
    A.prev = B;
    head.next = B;
    Then;
    the;
    order;
    is: head -  > B -  > A -  > tail.
    ;
    This;
    is;
    correct: most;
    recent;
    at;
    front.
        However, note;
    when;
    we;
    move;
    a;
    node;
    to;
    the;
    front, we;
    first;
    remove;
    it;
    and;
    then;
    add;
    it.But;
    when;
    we;
    remove;
    it, we;
    break the;
    links, and;
    then;
    we;
    add;
    it;
    at;
    the;
    front.So;
    the;
    order;
    is;
    updated.
    ;
    But;
    what;
    about;
    the;
    tail ? The : ;
    least;
    recent;
    is;
    the;
    one;
    just;
    before;
    the;
    tail.So;
    when;
    we;
    traverse;
    from;
    head.next;
    to;
    tail, we;
    get;
    the;
    keys in order;
    from;
    most;
    recent;
    to;
    least;
    recent.
        However, note;
    the;
    problem;
    says;
    "remaining keys from most-recently-used to least-recently-used".So;
    our;
    traversal;
    order;
    is;
    correct.
    ;
    But;
    wait: what;
    if (we)
        have;
    multiple;
    GETs;
    and;
    PUTs ? The : ;
    order;
    is;
    maintained.
        However, note;
    when;
    we;
    update;
    a;
    key(PUT);
    for (existing;;)
        or;
    GET, we;
    move;
    the;
    node;
    to;
    the;
    front.So;
    the;
    most;
    recently;
    used(by, time, of, operation);
    is;
    at;
    the;
    front.
    ;
    But;
    note: the;
    problem;
    says;
    "makes the key most recently used".So;
    we;
    are;
    time = __addDisposableResource(env_1, void 0, false);
    of;
    operation;
    This;
    is;
    standard;
    LRU.
        However, one;
    more;
    thing: when;
    we;
    evict, we;
    remove;
    the;
    least;
    recently;
    used, which;
    is;
    the;
    one;
    just;
    before;
    the;
    tail.
    ;
    So;
    the;
    implementation;
    seems;
    correct.
    ;
    But;
    note: the;
    constraints;
    are;
    large(C, up, to, 200000, N, up, to, 300000).We;
    must;
    ensure;
    that;
    the;
    doubly;
    linked;
    list;
    operations;
    are;
    O(1).They;
    are.
        However, we;
    are;
    a = __addDisposableResource(env_1, void 0, false), Map = __addDisposableResource(env_1, void 0, false);
    for (lookups, which; is; O(1))
        average.
        ;
    But;
    note: the;
    keys;
    are;
    strings.We;
    must;
    be;
    cautious;
    of;
    hash;
    collisions ? The : ;
    Map in JavaScript;
    uses;
    a;
    hash;
    table;
    and;
    should;
    be;
    O(1);
    average.
    ;
    We;
    must;
    also;
    consider;
    the;
    memory: we;
    are;
    creating;
    a;
    node;
    for (each; key in the; cache.The)
        cache;
    size;
    is;
    at;
    most;
    C, so;
    it;
    's fine.;
    Steps;
    for (reading; input; )
        : const input = fs.readFileSync(0, "utf8").trim().split('\n');
    [C, N] = input[0].split(' ').map(Number);
    operations = input.slice(1);
    But;
    note: the;
    operations;
    might;
    have;
    empty;
    lines ? We : ;
    should;
    filter;
    out;
    empty;
    lines.
        Actually, the;
    problem;
    says;
    "Next N lines", so;
    we;
    can;
    take;
    the;
    next;
    N;
    lines.
        However, the;
    input;
    might;
    have;
    trailing;
    newlines ? We : ;
    can;
    do
        : const lines = input.filter(line => line.trim() !== '');
    while ();
    if (lines.length < 1) {
        // no operations? but N>=1, so this shouldn't happen.
    }
    firstLine = lines[0].split(' ');
    C = parseInt(firstLine[0]);
    N = parseInt(firstLine[1]);
    operations = lines.slice(1).slice(0, N); // just in case there are extra lines
    But;
    the;
    problem;
    says;
    "Next N lines", so;
    we;
    take;
    exactly;
    N;
    operations.
        However, the;
    input;
    might;
    have;
    exactly;
    N;
    lines ? We : ;
    can;
    assume;
    so.
    ;
    But;
    to;
    be;
    safe, we;
    take;
    the;
    next;
    N;
    non - empty;
    lines ? Actually : , the;
    problem;
    does;
    not;
    specify;
    that;
    there;
    are;
    extra;
    lines.We;
    'll take the next N lines after the first.;
    But;
    note: the;
    input;
    might;
    have;
    empty;
    lines;
    at;
    the;
    end ? We : ;
    'll filter out empty lines for the operations? Actually, the operations are given as one per line. We can do:;
    operations = lines.slice(1).filter(line => line.trim() !== '');
    However, the;
    problem;
    says;
    "Next N lines", so;
    we;
    should;
    take;
    the;
    next;
    N;
    lines, but;
    if (there)
        are;
    empty;
    lines in between ? The : ;
    problem;
    does;
    not;
    specify.We;
    'll assume the input is well-formed: exactly N lines of operations.;
    But;
    to;
    be;
    safe, we;
    can;
    take;
    the;
    next;
    N;
    lines;
    regardless;
    of;
    empty ? Actually : , the;
    problem;
    says;
    "Next N lines", so;
    we;
    take;
    the;
    next;
    N;
    lines.But;
    if (there)
        are;
    empty;
    lines, then;
    we;
    might;
    have;
    fewer;
    than;
    N;
    operations ?
        We : ;
    'll do:;
    operations = lines.slice(1);
    // We are only going to process the first N operations? But the problem says "Next N lines", so we take the first N operations from the operations list? But if there are less than N, we process what we have? 
    However, the;
    problem;
    says;
    "N operations", so;
    we;
    assume;
    there;
    are;
    exactly;
    N;
    operations.
    ;
    But;
    note: the;
    constraints;
    say;
    1 <= N <= 300000, so;
    we;
    can;
    have;
    up;
    to;
    300000;
    operations.
        We;
    'll process the first N operations from the operations list. But if the operations list has more than N, we ignore the rest? The problem says "Next N lines", so we take the next N lines. So we should take the next N lines, which are the next N non-empty lines? Actually, the input format is strict.;
    We;
    'll do:;
    operations = lines.slice(1, 1 + N);
    Because;
    the;
    first;
    line;
    is;
    the;
    header, then;
    the;
    next;
    N;
    lines;
    are;
    operations.
    ;
    But;
    if (there)
        are;
    fewer;
    than;
    N;
    lines, then;
    we;
    process;
    what;
    we;
    have ? The : ;
    problem;
    says;
    "Next N lines", so;
    we;
    expect;
    exactly;
    N.But;
    we;
    'll be safe.;
    However, the;
    problem;
    says;
    "Next N lines", so;
    we;
    can;
    take: const operations = input.slice(1);
    // and then take the first N? But if there are less than N, we take all.
    But;
    the;
    problem;
    says;
    "Next N lines", so;
    we;
    assume;
    there;
    are;
    exactly;
    N.We;
    'll take the first N operations from the operations list, but if there are less, we take all.;
    Actually, the;
    problem;
    says: "Next N lines are one of: ...".So;
    we;
    can;
    take;
    the;
    next;
    N;
    lines.But;
    if (there)
        are;
    fewer, we;
    process;
    the;
    available.
        However, the;
    constraints;
    say;
    N >= 1, so;
    we;
    have;
    at;
    least;
    one;
    operation.
        Let;
    's code accordingly.;
    But;
    note: we;
    must;
    not;
    output;
    anything;
    until;
    the;
    end ? The : ;
    problem;
    says;
    "Output";
    meaning;
    the;
    entire;
    output;
    at;
    the;
    end ?
        We : ;
    'll collect the GET results and then output at the end.;
    Steps: const getResults = [];
    // ... process operations ...
    // Then output:
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    // Now for the keys in order:
    keys = [];
    current = head.next;
    while (current !== tail) {
        keys.push(current.key);
        current = current.next;
    }
    if (keys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keys.join(" "));
    }
    However, note;
    the;
    problem;
    says;
    "remaining keys from most-recently-used to least-recently-used".Our;
    traversal;
    from;
    head.next;
    to;
    tail;
    gives;
    that;
    order.
    ;
    But;
    wait: what;
    if (we)
        have;
    a;
    key;
    that;
    was;
    just;
    updated ? It : ;
    is;
    moved;
    to;
    the;
    front.So;
    the;
    order;
    is;
    correct.
    ;
    But;
    note: when;
    we;
    evict, we;
    remove;
    the;
    node;
    just;
    before;
    the;
    tail.So;
    the;
    order;
    is;
    maintained.
    ;
    One;
    more;
    thing: when;
    we;
    remove;
    a;
    node, we;
    break the;
    links.But;
    when;
    we;
    remove;
    the;
    last;
    node(the, only, node, besides, sentinels), then;
    the;
    list;
    becomes;
    empty(head.next = tail).Then;
    when;
    we;
    traverse, we;
    stop.
    ;
    So;
    it;
    's correct.;
    However, we;
    must;
    be;
    cautious: when;
    we;
    add;
    a;
    node, we;
    set;
    its;
    prev;
    and;
    next.But;
    when;
    we;
    remove;
    a;
    node, we;
    set;
    the;
    neighbors;
    to;
    point;
    to;
    each;
    other.But;
    what;
    if (the)
        node;
    is;
    the;
    only;
    node ? Then : ;
    head.next;
    becomes;
    tail, and;
    tail.prev;
    becomes;
    head.Then;
    when;
    we;
    add;
    again, we;
    set;
    the;
    new node;
    's prev to head and next to tail, and then head.next = new node, and tail.prev = new node. So it works.;
    Let;
    's write the code.;
    But;
    note: we;
    must;
    not;
    use / dev / stdin.We;
    are;
    reading;
    from;
    stdin;
    with (fs.readFileSync(0, "utf8").
    )
        We;
    must;
    also;
    consider: the;
    input;
    might;
    be;
    large, so;
    we;
    should;
    avoid;
    splitting;
    the;
    entire;
    input;
    into;
    lines;
    if (it)
        's too big? But the constraints are 300000 operations, so the input size is about 300000 * (length of line) which might be a few megabytes. It should be fine.;
    However, we;
    can;
    use;
    readline;
    for (large; inputs ? But : ; the)
        problem;
    says;
    "Do not use /dev/stdin", and;
    we;
    are;
    fs = __addDisposableResource(env_1, void 0, false), readFileSync = __addDisposableResource(env_1, void 0, false);
    (0, "utf8");
    which;
    is;
    acceptable.
    ;
    But;
    note: the;
    problem;
    says;
    "Read stdin with fs.readFileSync(0, ";
    utf8;
    ")".So;
    we;
    do
        that.
        ;
    while (Code);
    structure: import * as fs from 'fs';
    Node = class Node {
        constructor(key, value, prev, next) {
            this.key = key;
            this.value = value;
            this.prev = prev;
            this.next = next;
        }
    };
    main();
    But;
    wait: what;
    about;
    the;
    order;
    of;
    the;
    keys ? The : ;
    problem;
    says;
    "from most-recently-used to least-recently-used".Our;
    traversal;
    from;
    head.next;
    to;
    tail;
    gives;
    that;
    order.
        However, note;
    when;
    we;
    move;
    a;
    node;
    to;
    the;
    front, we;
    break the;
    links;
    and;
    then;
    add;
    it;
    at;
    the;
    front.So;
    the;
    order;
    is;
    maintained.
    ;
    But;
    one;
    issue: when;
    we;
    update;
    a;
    key(PUT);
    for (existing;;)
        or;
    GET, we;
    move;
    the;
    node;
    to;
    the;
    front.But;
    when;
    we;
    update, we;
    change;
    the;
    value.That;
    is;
    taken;
    care;
    of.
        However, we;
    must;
    be;
    cautious: when;
    we;
    move;
    a;
    node;
    to;
    the;
    front, we;
    remove;
    it;
    from;
    its;
    current;
    position;
    and;
    then;
    add;
    it;
    at;
    the;
    front.But;
    what;
    if (the)
        node;
    is;
    already;
    at;
    the;
    front ? Then : ;
    we;
    remove;
    it;
    and;
    add;
    it;
    again ? That : ;
    is;
    inefficient ? But : ;
    the;
    remove;
    and;
    add;
    are;
    O(1).However, we;
    can;
    optimize: if (the)
        node;
    is;
    already;
    at;
    the;
    front(i.e., node.prev === head), then;
    we;
    don;
    't need to move. But the problem says "makes the key most recently used", so if it is already the most recent, we don';
    t;
    need;
    to;
    do
        anything ? Actually : , we;
    while (still);
    need;
    to;
    update;
    the;
    value in the;
    PUT;
    But;
    for (the; order, ; )
        if (it)
            is;
    already;
    the;
    most;
    recent, we;
    don;
    't need to move it. However, the problem does not require that we only move if it is not at the front. But to avoid unnecessary operations, we can check.;
    However, the;
    problem;
    says;
    "makes the key most recently used", so;
    if (it)
        is;
    already;
    the;
    most;
    recent, then;
    it;
    remains;
    so.So;
    we;
    can;
    skip;
    the;
    move;
    if (it)
        is;
    already;
    at;
    the;
    front.
        Similarly, ;
    for (GET; ; )
        : if (the)
            node;
    is;
    already;
    at;
    the;
    front, we;
    don;
    't need to move it. But we still need to record the value.;
    But;
    note:  in the;
    PUT;
    for (an; existing; key, we)
        update;
    the;
    value;
    and;
    then;
    move;
    to;
    front.But;
    if (it)
        is;
    already;
    at;
    the;
    front, we;
    don;
    't need to move? Actually, the order is the same. So we can skip the move.;
    However, the;
    problem;
    does;
    not;
    require;
    that;
    we;
    minimize;
    the;
    number;
    of;
    operations.But;
    for (performance, we; can; avoid)
        unnecessary;
    moves.
        Let;
    's add a check:;
    if (cache.has(key)) {
        const node = cache.get(key);
        // update value
        node.value = value;
        // if not already at the front, move to front
        if (node.prev !== head) { // not at front? Actually, head is the dummy head, so the first real node is head.next. So if node is head.next, then it is at the front.
            remove(node);
            add(node);
        }
    }
    Similarly, ;
    for (GET; ; )
        : if (cache.has(key)) {
            const node = cache.get(key);
            if (node.prev !== head) { // not at front
                remove(node);
                add(node);
            }
            getResults.push(node.value.toString());
        }
    But;
    note: what;
    if (the)
        node;
    is;
    the;
    only;
    node ? Then : ;
    it;
    is;
    at;
    the;
    front ? Actually : , the;
    first;
    real;
    node;
    is;
    head.next.So;
    if (node === head.next, then)
        it;
    is;
    at;
    the;
    front.
    ;
    So;
    we;
    can;
    check: if (node !== head.next)
        then;
    move.
        However, what;
    if (the)
        list;
    has;
    more;
    than;
    one;
    node ? Then : ;
    the;
    front;
    node;
    is;
    head.next.So;
    we;
    can;
    check: if (node === head.next)
        then;
    it;
    is;
    at;
    the;
    front.
        So;
    if (node !== head.next) {
        remove(node);
        add(node);
    }
    But;
    note: when;
    we;
    remove;
    a;
    node;
    that;
    is;
    not;
    at;
    the;
    front, we;
    break the;
    links.Then;
    we;
    add;
    it;
    at;
    the;
    front.So;
    it;
    becomes;
    the;
    new head.next.
    ;
    This;
    optimization;
    avoids;
    unnecessary;
    moves.
        Similarly, ;
    for (DEL; ; )
        : we;
    don;
    't need to check the position, just remove.;
    Let;
    's update the code accordingly.;
    However, note;
    when;
    we;
    evict, we;
    remove;
    the;
    node;
    just;
    before;
    the;
    tail.But;
    that;
    node;
    might;
    be;
    anywhere ? Actually : , we;
    are;
    removing;
    tail.prev.So;
    we;
    don;
    't need to check if it is at the front? Because the front is head.next, and the tail is at the end. So if the list has more than one node, then the node before tail is not the front? Unless the list has only one node? ;
    Example: List: head -  > A -  > tail;
    Then;
    tail.prev;
    is;
    A.But;
    A;
    is;
    also;
    head.next ? So : ;
    it;
    is;
    at;
    the;
    front ? Then : ;
    when;
    we;
    remove;
    A, we;
    set: A.prev.next = A.next -  > head.next;
    tail;
    A.next.prev = A.prev -  > tail.prev;
    head;
    Then;
    the;
    list;
    becomes;
    head -  > tail.
    ;
    But;
    note: if (the)
        list;
    has;
    only;
    one;
    node, then;
    that;
    node;
    is;
    both;
    at;
    the;
    front;
    and;
    at;
    the;
    back.So;
    we;
    are;
    removing;
    the;
    only;
    node.
    ;
    But;
    the;
    eviction;
    condition;
    is: if (the)
        cache;
    is;
    full(size >= C);
    and;
    we;
    are;
    inserting;
    a;
    new key.Then;
    we;
    remove;
    the;
    least;
    recently;
    used.If;
    the;
    list;
    has;
    only;
    one;
    node, then;
    we;
    remove;
    that;
    node.So;
    we;
    don;
    't need to check the position for eviction.;
    So;
    we;
    don;
    't need to optimize eviction.;
    Therefore, we;
    only;
    optimize;
    the;
    moves;
    for (PUT(existing); and; GET.
        Let)
        's update the code.;
    But;
    note:  in the;
    PUT;
    for (existing, we; update; the)
        value;
    and;
    then;
    move;
    to;
    front();
    if (not)
        already;
    at;
    front;
    In;
    the;
    GET;
    we;
    move;
    to;
    front();
    if (not)
        already;
    at;
    front;
    and;
    then;
    record;
    the;
    value.
        Code;
    if (cache.has(key)) {
        const node = cache.get(key);
        if (command === 'PUT') {
            node.value = value;
            if (node !== head.next) {
                remove(node);
                add(node);
            }
        }
        else if (command === 'GET') {
            if (node !== head.next) {
                remove(node);
                add(node);
            }
            getResults.push(node.value.toString());
        }
    }
    But;
    wait:  in the;
    GET;
    we;
    are;
    moving;
    the;
    node;
    to;
    the;
    front;
    and;
    then;
    recording;
    the;
    value.But;
    what;
    if (the)
        node;
    is;
    already;
    at;
    the;
    front ? Then : ;
    we;
    don;
    't move it, but we still record the value. Correct.;
    However, note;
     in the;
    PUT;
    we;
    update;
    the;
    value;
    and;
    then;
    move;
    to;
    front();
    if (not)
        at;
    front;
    Then;
    we;
    don;
    't record anything for GET. Correct.;
    But;
    what;
    about;
    the;
    DEL;
    We;
    just;
    remove;
    the;
    node;
    and;
    update;
    the;
    cache.No;
    move.
    ;
    This;
    should;
    be;
    correct.
        Let;
    's test with a small example.;
    Example: C = 2, N = 3;
    PUT;
    a;
    1;
    GET;
    a;
    GET;
    a;
    Operations: PUT;
    a;
    1;
    cache: a -  > 1, list;
    head -  > a -  > tail;
    GET;
    a: cache;
    has;
    a -  > move;
    a;
    to;
    front ? It : ;
    is;
    already;
    at;
    front.So;
    no;
    move.Record;
    value: 1.;
    GET;
    a: cache;
    has;
    a -  > move;
    a;
    to;
    front ? It : ;
    is;
    already;
    at;
    front.So;
    no;
    move.Record;
    value: 1.;
    Output;
    for (GET; ; )
        : "1 1";
    Then;
    remaining;
    keys: a -  > so;
    "a";
    But;
    what;
    if ()
        : PUT;
    a;
    1;
    PUT;
    b;
    2;
    GET;
    a;
    Steps: PUT;
    a;
    1;
    list: head -  > a -  > tail;
    PUT;
    b;
    2;
    cache;
    size = 1, which;
    is < C;
    2, so;
    no;
    eviction.
    ;
    add;
    b;
    at;
    front: list: head -  > b -  > a -  > tail;
    GET;
    a: cache;
    has;
    a -  > move;
    a;
    to;
    front ? It : ;
    is;
    not;
    at;
    front(a, is, after, b).So;
    remove;
    a;
    and;
    add;
    at;
    front.
    ;
    remove;
    a: a.prev(b).next = a.next(tail);
    a.next(tail).prev = a.prev(b);
    then;
    add;
    a;
    at;
    front: a.prev = head;
    a.next = head.next(b);
    b.prev = a;
    head.next = a;
    list: head -  > a -  > b -  > tail;
    record;
    value: 1;
    Output;
    for (GET; ; )
        : "1";
    Then;
    remaining;
    keys: a, b -  > "a b";
    But;
    the;
    problem;
    says: "GET should output the value if present, otherwise -1, and a successful GET makes the key most recently used.";
    After;
    GET;
    a, a;
    becomes;
    the;
    most;
    recently;
    used.So;
    the;
    order;
    should;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
