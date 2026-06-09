"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    // remove a given node from list
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    // add node at front (after head)
    addNodeToFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    // move node to front
    moveToFront(node) {
        this.removeNode(node);
        this.addNodeToFront(node);
    }
    // get value; returns -1 if not found
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }
    // put key-value; updates or inserts
    put(key, value) {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
        }
        else {
            node = new Node(key, value);
            this.map.set(key, node);
            this.addNodeToFront(node);
            this.size++;
            if (this.size > this.capacity) {
                // evict LRU: remove tail.prev
                const lru = this.tail.prev;
                if (lru !== this.head) { // should be true if size > capacity
                    this.removeNode(lru);
                    this.map.delete(lru.key);
                }
                this.size--;
            }
        }
    }
    // delete key
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    // get all keys in order from most recent to least recent
    getAllKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
Now, parse;
input: Read;
all;
input, split;
by;
newline.First;
line: "C N".Then;
iterate;
N;
lines.
;
We;
need;
to;
collect;
GET;
results in order.
    Edge;
if (there)
    are;
no;
GET;
operations, output;
"EMPTY";
on;
first;
line.
;
Second;
line: if (cache)
    empty;
after;
all;
ops, output;
"EMPTY".
    Otherwise, join;
keys;
with (spaces.
)
    We;
need;
to;
be;
careful;
about;
large;
I / O;
use;
process.stdout.write;
or;
console.log ? The : ;
problem;
says;
"Return only TypeScript code", but;
for (output; we; can)
    use;
console.log.However, ;
for (large; outputs, maybe; use)
    process.stdout.write.But;
we;
can;
just;
collect;
and;
print.
;
Given;
constraints, N;
up;
to;
300;
k, output;
could;
be;
large;
but;
manageable.
    We;
'll implement main function.;
We;
'll parse lines using input.split(';
n;
'). But note that there might be trailing empty lines; we should trim.;
Let;
's write:;
const fs = __importStar(require("fs"));
const data = fs.readFileSync(0, 'utf8');
const lines = data.trim().split(/\r?\n/);
if (lines.length < 1)
    return; // but should be fine
const firstLine = lines[0].trim();
const [Cstr, Nstr] = firstLine.split(/\s+/);
const C = parseInt(Cstr, 10);
const N = parseInt(Nstr, 10);
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val);
    }
    else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
// output first line
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
// second line
const keys = cache.getAllKeys();
if (keys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(keys.join(' '));
}
But;
we;
need;
to;
ensure;
that;
the;
code;
is;
complete;
and;
compiles.Use;
Map;
from;
'typescript'(built -  in ).No;
external;
dependencies.
;
We;
should;
consider;
that;
values;
are;
signed;
32 - bit;
integers;
parseInt;
will;
parse;
correctly.
;
We;
need;
to;
be;
careful;
about;
performance: using Map, is, fine, One, nuance, problem, says;
"PUT key value";
and;
"GET key";
and;
"DEL key".Keys;
are;
non - empty;
strings;
without;
spaces.So;
splitting;
by;
whitespace;
is;
fine.
    Now, we;
should;
consider;
that;
the;
cache;
capacity;
could;
be;
up;
to;
200;
k, and;
N;
up;
to;
300;
k, so;
our;
implementation;
should;
be;
fine.
;
We;
also;
need;
to;
ensure;
that;
the;
LRU;
order;
after;
operations;
is;
correct: most;
recent;
first.In;
our;
implementation, head.next;
is;
most;
recent, tail.prev;
is;
least;
recent.So;
getAllKeys;
from;
head.next;
to;
tail.prev;
gives;
most;
recent;
to;
least;
recent.
    Now, test;
with (sample ? The : )
    problem;
didn;
't provide sample, but we can reason.;
Edge;
Cases: -PUT;
with (capacity)
    1;
first;
PUT;
adds, second;
PUT;
evicts;
previous.
    - GET;
after;
eviction;
returns - 1.
    - DEL;
on;
nonexistent;
key;
does;
nothing.
    - PUT;
on;
existing;
key;
updates;
value;
and;
moves;
to;
front.
    - GET;
on;
existing;
moves;
to;
front.
    - After;
all;
ops, ;
if (cache)
    empty, output;
EMPTY.
    - If;
no;
GET, first;
line;
EMPTY.
    Now, we;
need;
to;
output;
exactly;
first;
line: all;
GET;
results;
separated;
by;
spaces, or;
EMPTY;
if (there)
    were;
no;
GET;
operations.Second;
line: remaining;
keys;
from;
most - recently - used;
to;
least - recently - used;
separated;
by;
spaces, or;
EMPTY;
if (cache)
    is;
empty.
;
Our;
code;
does;
that.
;
Potential;
pitfalls: When;
we;
evict, we;
remove;
tail.prev.But;
we;
need;
to;
ensure;
that;
the;
node;
we;
remove;
is;
not;
the;
sentinel.Since;
size > capacity, there;
must;
be;
at;
least;
one;
real;
node.But;
we;
check;
lru !== this.head.
    Also, after;
removing, we;
decrement;
size.
    Now, about;
the;
use;
of;
fs.readFileSync(0, "utf8");
That;
reads;
from;
stdin;
file;
descriptor;
0.;
That;
's fine.;
We;
'll include import statement.;
Now, we;
should;
ensure;
that;
the;
TypeScript;
code;
is;
self - contained;
and;
compiles.Use;
Node;
's built-in types.;
We;
'll write the code without any extra explanation.;
Now, we;
need;
to;
consider;
memory: Map;
with (up)
    to;
200;
k;
entries, each;
Node;
object.That;
's okay.;
Now, we;
might;
want;
to;
optimize;
by;
function main() {
    const data = fs.readFileSync(0, 'utf8');
    const lines = data.trim().split(/\r?\n/);
    if (lines.length === 0)
        return;
    const firstLine = lines[0].trim();
    const [Cstr, Nstr] = firstLine.split(/\s+/);
    const C = parseInt(Cstr, 10);
    const N = parseInt(Nstr, 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        if (i >= lines.length)
            break; // safety
        const line = lines[i].trim();
        if (line === '')
            continue; // skip empty lines
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (cmd === 'GET') {
            const key = parts[1];
            getResults.push(cache.get(key));
        }
        else if (cmd === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }
    // output first line
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    // second line
    const keys = cache.getAllKeys();
    if (keys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keys.join(' '));
    }
}
var arrays, Node, LRUCache, split, Map, which, is, ES6, but, Node, js, supports, it, Now, we, should, consider, that, we, need, to, output, exactly, as, required, No, extra, spaces, or, newlines, console, log, adds, newline, that, readline, but, that, arrays, and, indices, But, Node, objects, are, fine, Now, we, should, consider, that, we, might, need, to, ensure, that, we, don;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    arrays = __addDisposableResource(env_1, void 0, false);
    for (linked; list ? But : ; doubly)
        linked;
    list;
    with (Node)
        objects;
    is;
    fine.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    handle;
    the;
    where;
    N;
    lines;
    may;
    be;
    less;
    than;
    expected ? But : ;
    assume;
    valid;
    input.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    input;
    may;
    have;
    trailing;
    spaces;
    or;
    empty;
    lines.We;
    'll trim each line.;
    Now, we;
    can;
    produce;
    final;
    code.
    ;
    But;
    we;
    should;
    also;
    consider;
    that;
    the;
    problem;
    says;
    "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, ";
    utf8;
    ").";
    So;
    we;
    are;
    doing;
    that.
        Now, final;
    code: import * as fs from 'fs';
    Node = class Node {
        constructor(key, value) {
            this.key = key;
            this.value = value;
            this.prev = null;
            this.next = null;
        }
    };
    LRUCache = class LRUCache {
        constructor(capacity) {
            this.capacity = capacity;
            this.map = new Map();
            this.head = new Node('', 0);
            this.tail = new Node('', 0);
            this.head.next = this.tail;
            this.tail.prev = this.head;
            this.size = 0;
        }
        removeNode(node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        addNodeToFront(node) {
            node.prev = this.head;
            node.next = this.head.next;
            this.head.next.prev = node;
            this.head.next = node;
        }
        moveToFront(node) {
            this.removeNode(node);
            this.addNodeToFront(node);
        }
        get(key) {
            const node = this.map.get(key);
            if (!node) {
                return -1;
            }
            this.moveToFront(node);
            return node.value;
        }
        put(key, value) {
            let node = this.map.get(key);
            if (node) {
                node.value = value;
                this.moveToFront(node);
            }
            else {
                node = new Node(key, value);
                this.map.set(key, node);
                this.addNodeToFront(node);
                this.size++;
                if (this.size > this.capacity) {
                    const lru = this.tail.prev;
                    if (lru !== this.head) {
                        this.removeNode(lru);
                        this.map.delete(lru.key);
                    }
                    this.size--;
                }
            }
        }
        del(key) {
            const node = this.map.get(key);
            if (node) {
                this.removeNode(node);
                this.map.delete(key);
                this.size--;
            }
        }
        getAllKeys() {
            const keys = [];
            let curr = this.head.next;
            while (curr !== this.tail) {
                keys.push(curr.key);
                curr = curr.next;
            }
            return keys;
        }
    };
    main();
    Now, we;
    need;
    to;
    ensure;
    that;
    the;
    code;
    is;
    correct;
    TypeScript.Use;
    strict;
    mode ? Not : ;
    necessary.
    ;
    One;
    nuance: In;
    the;
    put;
    method, when;
    we;
    evict, we;
    do
        : const lru = this.tail.prev;
    while ();
    if (lru !== this.head) {
        this.removeNode(lru);
        this.map.delete(lru.key);
    }
    this.size--;
    But;
    we;
    already;
    incremented;
    size, so;
    after;
    evict;
    we;
    decrement;
    size.That;
    's fine.;
    But;
    note: If;
    capacity;
    is;
    0 ? But : ;
    constraints;
    say;
    1 <= C, so;
    at;
    least;
    1.;
    Now, we;
    should;
    also;
    consider;
    that;
    when;
    we;
    remove;
    a;
    node, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't accidentally remove the sentinel. The check lru !== this.head ensures that.;
    Now, we;
    should;
    test;
    with (a)
        small;
    example;
    manually.
        Example;
    C = 2, N = 6;
    PUT;
    1;
    10;
    PUT;
    2;
    20;
    GET;
    1;
    PUT;
    3;
    30;
    GET;
    2;
    DEL;
    1;
    GET;
    1;
    GET;
    3;
    Let;
    's simulate:;
    After;
    PUT;
    1;
    cache: 1 -  > 10, size = 1, order;
    1;
    After;
    PUT;
    2;
    size = 2, order;
    2, 1(most, recent, first);
    GET;
    1;
    returns;
    10, order;
    1, 2;
    PUT;
    3;
    insert;
    3, size;
    becomes;
    3 > capacity;
    2, evict;
    LRU(which, is, 2).So;
    remove;
    2.;
    order: 3, 1.;
    size = 2.;
    GET;
    2;
    returns - 1, order;
    unchanged: 3, 1;
    DEL;
    1;
    remove;
    1, order;
    3.;
    size = 1.;
    GET;
    1;
    returns - 1;
    GET;
    3;
    returns;
    30, order;
    3(most, recent);
    GET;
    results: 10, -1, -1, 30 -  > "10 -1 -1 30";
    Remaining;
    keys: "3";
    But;
    check: after;
    GET;
    3, it;
    becomes;
    most;
    recent, but;
    only;
    one;
    key, so;
    order;
    is;
    just;
    3.;
    So;
    output;
    first;
    line: "10 -1 -1 30", second;
    "3".
        Now, ;
    if (no)
        GET, first;
    line;
    EMPTY.
        Now, ;
    if (after)
        all;
    ops;
    cache;
    empty, second;
    line;
    EMPTY.
        Now, we;
    need;
    to;
    consider;
    that;
    the;
    problem;
    says;
    "remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty.";
    So;
    we;
    output;
    keys in that;
    order.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    keys;
    are;
    strings;
    without;
    spaces, so;
    joining;
    with (spaces)
        is;
    fine.
        Now, we;
    should;
    ensure;
    that;
    we;
    use;
    fast;
    I / O ? Not : ;
    necessary, but;
    we;
    can;
    use;
    process.stdout.write;
    for (large; output.However, console.log; is)
        fine.
            Now, we;
    might;
    want;
    to;
    avoid;
    creating;
    many;
    Node;
    objects;
    if (we)
        reuse ? Not : ;
    needed.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have memory leaks: after removal, we delete from map, but Node objects may still be reachable? They become garbage collected.;
    Now, we;
    should;
    consider;
    that;
    the;
    Map;
    uses;
    string;
    keys, which;
    is;
    fine.
        Now, we;
    should;
    ensure;
    that;
    we;
    parse;
    integers;
    correctly;
    values;
    are;
    signed;
    32 - bit, so;
    parseInt;
    works.
        Now, we;
    need;
    to;
    be;
    careful;
    about;
    the;
    where;
    the;
    input;
    may;
    have;
    leading / trailing;
    spaces;
    on;
    lines.We;
    trim.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    number;
    of;
    lines;
    may;
    be;
    exactly;
    N + 1, but;
    there;
    might;
    be;
    extra;
    blank;
    lines;
    at;
    end;
    we;
    skip;
    empty;
    lines.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    commands;
    are;
    -sensitive ? They : ;
    are;
    uppercase, we;
    can;
    produce;
    final;
    code.
    ;
    But;
    we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any compilation errors due to missing types. We';
    ll;
    add;
    needed.
        Now, the;
    code;
    should;
    be;
    fine.
    ;
    One;
    more;
    nuance: In;
    the;
    put;
    method, when;
    we;
    have;
    an;
    existing;
    key, we;
    update;
    value;
    and;
    move;
    to;
    front.That;
    's correct.;
    Now, we;
    might;
    want;
    to;
    test;
    with (capacity)
        1;
    PUT;
    A;
    1;
    PUT;
    B;
    2;
    GET;
    A -  > should;
    be - 1;
    because;
    evicted ? Actually : ;
    after;
    PUT;
    B, cache;
    capacity;
    1, so;
    A;
    is;
    evicted.So;
    GET;
    A;
    returns - 1.;
    Good.
        Now, we;
    need;
    to;
    ensure;
    that;
    after;
    eviction, the;
    map;
    is;
    updated.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    problem;
    says;
    "PUT updates an existing key and makes it most recently used. If inserting and the cache is over capacity, evict the least recently used key.";
    So;
    when;
    inserting, ;
    if (capacity)
        exceeded, evict.Our;
    implementation;
    does;
    that.
        Now, we;
    need;
    to;
    consider;
    that;
    the;
    order;
    after;
    GET;
    is;
    most;
    recent.Our;
    moveToFront;
    does;
    that.
        Now, we;
    need;
    to;
    consider;
    that;
    after;
    DEL, the;
    key;
    is;
    removed, and;
    the;
    order;
    of;
    remaining;
    keys;
    remains.
        Now, we;
    need;
    to;
    ensure;
    that;
    the;
    output;
    format: first;
    line: all;
    GET;
    results;
    separated;
    by;
    spaces.If;
    there;
    are;
    many;
    GET;
    results, they;
    could;
    be;
    large;
    numbers.That;
    's fine.;
    Now, we;
    should;
    consider;
    that;
    the;
    input;
    may;
    contain;
    negative;
    values;
    for (PUT.parseInt; will; handle)
        negative.
            Now, we;
    should;
    also;
    consider;
    that;
    the;
    cache;
    capacity;
    may;
    be;
    larger;
    than;
    the;
    number;
    of;
    distinct;
    keys, so;
    no;
    eviction.
        Now, we;
    should;
    consider;
    that;
    the;
    key;
    may;
    be;
    numeric ? But : ;
    keys;
    are;
    strings, so;
    we;
    treat, we;
    should;
    consider;
    that;
    the;
    key;
    may;
    be;
    something;
    like;
    "1";
    and;
    value;
    also;
    "1".That;
    's fine.;
    Now, we;
    should;
    consider;
    that;
    the;
    number;
    of;
    operations;
    N;
    could;
    be;
    up;
    to;
    300;
    k, so;
    our;
    loop;
    is;
    fine.
        Now, we;
    should;
    consider;
    that;
    we;
    are;
    split = __addDisposableResource(env_1, void 0, false);
    (/\s+/);
    which;
    is;
    okay.
        Now, we;
    should;
    consider;
    that;
    we;
    are;
    Map = __addDisposableResource(env_1, void 0, false), which = __addDisposableResource(env_1, void 0, false), is = __addDisposableResource(env_1, void 0, false), ES6 = __addDisposableResource(env_1, void 0, false), but = __addDisposableResource(env_1, void 0, false), Node = __addDisposableResource(env_1, void 0, false), js = __addDisposableResource(env_1, void 0, false), supports = __addDisposableResource(env_1, void 0, false), it = __addDisposableResource(env_1, void 0, false), Now = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), should = __addDisposableResource(env_1, void 0, false), consider = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), need = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), output = __addDisposableResource(env_1, void 0, false), exactly = __addDisposableResource(env_1, void 0, false), as = __addDisposableResource(env_1, void 0, false), required = __addDisposableResource(env_1, void 0, false), No = __addDisposableResource(env_1, void 0, false), extra = __addDisposableResource(env_1, void 0, false), spaces = __addDisposableResource(env_1, void 0, false), or = __addDisposableResource(env_1, void 0, false), newlines = __addDisposableResource(env_1, void 0, false), console = __addDisposableResource(env_1, void 0, false), log = __addDisposableResource(env_1, void 0, false), adds = __addDisposableResource(env_1, void 0, false), newline = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false);
    's fine.;
    Now, we;
    might;
    want;
    to;
    use;
    process.stdout.write;
    to;
    avoid;
    extra;
    newline;
    at;
    end ? But : ;
    console.log;
    adds;
    newline, which;
    is;
    typical.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't output any debug info.;
    Now, we;
    can;
    produce;
    final;
    code.
    ;
    But;
    we;
    should;
    double - check;
    the;
    eviction;
    condition: when;
    we;
    insert;
    a;
    new key;
    and;
    size > capacity, we;
    evict.However, ;
    if (capacity)
        is;
    0 ? Not : ;
    allowed.So;
    fine.
        Now, we;
    should;
    also;
    consider;
    that;
    after;
    eviction, we;
    should;
    ensure;
    that;
    the;
    evicted;
    key;
    is;
    removed;
    from;
    map.We;
    do
        that.
            Now, we;
    while (should);
    consider;
    that;
    when;
    we;
    remove;
    a;
    node, we;
    must;
    be;
    careful;
    that;
    the;
    node;
    's prev and next are still pointing to something, but after removal it';
    s;
    disconnected.That;
    's fine.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    have;
    a;
    bug: In;
    removeNode, we;
    assume;
    node.prev;
    and;
    node.next;
    are;
    not;
    null.Since;
    we;
    always;
    maintain;
    the;
    linked;
    list;
    with (sentinels, that)
        's safe.;
    Now, we;
    should;
    consider;
    that in the;
    put;
    method, after;
    adding;
    a;
    new node, we;
    increment;
    size, then;
    check;
    if (size > capacity.But)
        what;
    if (capacity)
        is;
    0 ? Not : ;
    possible.So;
    fine.
        Now, we;
    should;
    consider;
    that;
    when;
    we;
    evict, we;
    do
        : const lru = this.tail.prev;
    while ();
    if (lru !== this.head) {
        this.removeNode(lru);
        this.map.delete(lru.key);
    }
    this.size--;
    But;
    note: we;
    already;
    incremented;
    size, so;
    after;
    eviction;
    size;
    becomes;
    capacity.That;
    's correct.;
    Now, we;
    should;
    consider;
    that;
    if (capacity)
        is;
    1, and;
    we;
    have;
    one;
    node, then;
    after;
    adding;
    second, size;
    becomes;
    2, we;
    evict, size;
    becomes;
    1.;
    Good.
        Now, we;
    should;
    consider;
    that;
    the;
    LRU;
    order;
    after;
    multiple;
    GETs;
    is;
    correct.
        Now, we;
    should;
    consider;
    that;
    the;
    GET;
    operation;
    should;
    not;
    change;
    the;
    cache;
    if (key)
        not;
    found;
    we;
    return -1.;
    That;
    's fine.;
    Now, we;
    should;
    consider;
    that;
    the;
    DEL;
    operation;
    should;
    not;
    affect;
    order;
    if (key)
        not;
    present.
        Now, we;
    should;
    consider;
    that;
    the;
    getAllKeys;
    method;
    returns;
    keys in order;
    from;
    head;
    to;
    tail, which;
    is;
    most;
    recent;
    to;
    least;
    recent.That;
    matches;
    requirement.
        Now, we;
    should;
    consider;
    that;
    the;
    output;
    for (keys; should; be)
        separated;
    by;
    spaces, no;
    trailing;
    space.join(' ');
    does;
    that.
        Now, we;
    should;
    consider;
    that;
    if (there)
        are;
    many;
    keys, the;
    string;
    could;
    be;
    long, but;
    that;
    's fine.;
    Now, we;
    should;
    consider;
    that;
    we;
    need;
    to;
    use;
    fast;
    I / O;
    for (reading ? fs.readFileSync : ; is; synchronous)
        and;
    reads;
    all;
    at;
    once, which;
    is;
    fine;
    for (300; k; lines.
        Now, we)
        should;
    consider;
    that;
    we;
    might;
    want;
    to;
    use;
    a;
    more;
    efficient;
    parser, but;
    not;
    necessary.
        Now, we;
    should;
    consider;
    that;
    we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't exceed memory due to storing all lines. 300k lines with short strings is maybe a few MB, fine.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    want;
    to;
    use;
    a;
    buffer;
    and;
    parse;
    line;
    by;
    line, but;
    not;
    needed.
        Now, we;
    should;
    consider;
    that;
    the;
    problem;
    might;
    be;
    from;
    some;
    competitive;
    programming;
    site, and;
    they;
    expect;
    exact;
    output.We;
    'll ensure.;
    Now, we;
    should;
    consider;
    that;
    the;
    first;
    line;
    of;
    output;
    is;
    GET;
    results;
    separated;
    by;
    spaces.If;
    there;
    are;
    many;
    GET;
    results, we;
    should;
    not;
    include;
    a;
    trailing;
    space.join(' ');
    does;
    that.
        Now, we;
    should;
    consider;
    that;
    if (there)
        are;
    no;
    GET;
    results, we;
    output;
    "EMPTY".That;
    's correct.;
    Now, we;
    should;
    consider;
    that;
    if (after)
        all;
    ops;
    the;
    cache;
    is;
    empty, we;
    output;
    "EMPTY".That;
    's correct.;
    Now, we;
    should;
    consider;
    that;
    the;
    keys;
    output;
    should;
    be;
    from;
    most;
    recent;
    to;
    least;
    recent.Our;
    getAllKeys;
    does;
    that.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    output;
    the;
    keys in the;
    order;
    they;
    were;
    last;
    used, ;
    with (ties ? But : )
        LRU;
    order;
    is;
    well - defined.
        Now, we;
    should;
    consider;
    that;
    the;
    problem;
    might;
    require;
    that;
    after;
    a;
    GET, the;
    key;
    becomes;
    most;
    recent, which;
    we;
    do
        .
            Now, we;
    while (should);
    consider;
    that;
    after;
    a;
    PUT;
    on;
    existing;
    key, it;
    becomes;
    most;
    recent, which;
    we;
    do
        .
            Now, we;
    while (should);
    consider;
    that;
    after;
    a;
    DEL, the;
    key;
    is;
    removed, and;
    the;
    order;
    of;
    remaining;
    keys;
    is;
    unchanged;
    except;
    the;
    removed;
    one.
        Now, we;
    should;
    consider;
    that;
    if (we)
        have;
    capacity;
    C;
    and;
    we;
    have;
    fewer;
    than;
    C;
    keys, no;
    eviction.
        Now, we;
    should;
    consider;
    that;
    the;
    cache;
    capacity;
    is;
    the;
    maximum;
    number;
    of;
    items, not;
    the;
    number;
    of;
    keys ? It : ;
    's capacity for items, so yes.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    same;
    key;
    is;
    inserted;
    multiple;
    times;
    our;
    code;
    updates;
    value;
    and;
    moves;
    to;
    front.
        Now, we;
    should;
    consider;
    that;
    the;
    value;
    for (PUT; is; signed)
        32 - bit;
    integer, so;
    it;
    fits in JavaScript;
    number(which, is, double, but, 32 - bit, integers, are, safe).We;
    'll use number.;
    Now, we;
    should;
    consider;
    that;
    the;
    GET;
    results;
    should;
    be;
    output, including - 1;
    for (missing.That; 's fine.; Now, we)
        should;
    consider;
    that;
    the;
    output;
    for (GET; results; might)
        be;
    large, but;
    we;
    join;
    with (spaces.
        Now, we)
        should;
    consider;
    that;
    we;
    might;
    need;
    to;
    use;
    BigInt ? Not : ;
    needed.
        Now, we;
    should;
    consider;
    that;
    we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any off-by-one errors in the linked list.;
    Now, we;
    should;
    consider;
    that;
    the;
    sentinel;
    nodes;
    are;
    not;
    included in size;
    count.
        Now, we;
    should;
    consider;
    that;
    the;
    size;
    variable;
    is;
    maintained;
    correctly: incremented;
    on;
    insert, decremented;
    on;
    eviction;
    or;
    deletion.
        Now, we;
    should;
    consider;
    that;
    when;
    we;
    evict, we;
    decrement;
    size;
    after;
    removing, but;
    we;
    already;
    had;
    size > capacity, after;
    eviction;
    size;
    becomes;
    capacity.Good.
        Now, we;
    should;
    consider;
    that;
    when;
    we;
    delete , we;
    decrement;
    size.
        Now, we;
    should;
    consider;
    that;
    when;
    we;
    update;
    an;
    existing;
    key, size;
    remains;
    unchanged.
        Now, we;
    should;
    consider;
    that;
    the;
    map;
    always;
    reflects;
    the;
    current;
    keys.
        Now, we;
    should;
    consider;
    that;
    the;
    code;
    is;
    efficient.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    input;
    has;
    Windows;
    line;
    endings(r, n).We;
    split;
    with (/\r?\n/.
        Now, we)
        should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    there;
    is;
    extra;
    whitespace;
    at;
    the;
    end;
    of;
    lines.We;
    trim;
    each;
    line.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    first;
    line;
    has;
    extra;
    spaces.We;
    split;
    with (/\s+/.
        Now, we)
        should;
    consider;
    that;
    the;
    commands;
    might;
    be in lowercase ? The : ;
    problem;
    says;
    uppercase, so;
    we;
    assume;
    uppercase.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    output;
    exactly, no;
    extra;
    newline;
    at;
    the;
    end ? console.log : ;
    adds;
    newline, which;
    is;
    typical.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    use;
    process.stdout.write;
    to;
    avoid;
    extra;
    newline;
    on;
    the;
    last;
    line ? But : ;
    it;
    's fine.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    N;
    is;
    large;
    and;
    we;
    want;
    to;
    avoid;
    storing;
    all;
    lines.But;
    we;
    already;
    read;
    all;
    lines, which;
    is;
    okay.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    want;
    to;
    use;
    a;
    more;
    memory - efficient;
    approach: read;
    line;
    by;
    line;
    readline = __addDisposableResource(env_1, void 0, false), but = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false);
    's more complex and not required.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    use;
    a;
    faster;
    map: plain;
    object;
    with (string)
        keys;
    could;
    be;
    slightly;
    faster;
    but;
    Map;
    is;
    fine.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    ensure;
    that;
    the;
    key;
    strings;
    are;
    not;
    mutated;
    they;
    are.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    key;
    is;
    something;
    that;
    could;
    be;
    used;
    name;
    but;
    Map;
    handles;
    that.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    use;
    a;
    custom;
    hash;
    table ? Not : ;
    needed.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    output;
    the;
    keys in order, but;
    we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't include sentinel keys.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    cache;
    is;
    empty;
    after;
    all;
    ops, we;
    output;
    EMPTY.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    there;
    are;
    no;
    GET;
    operations, we;
    output;
    EMPTY.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    there;
    are;
    no;
    operations ? N >= 1 : , so;
    at;
    least;
    one;
    operation.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    input;
    ends;
    prematurely;
    we;
    break ;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    lines;
    contain;
    multiple;
    spaces;
    we;
    split;
    by / ;
    s + /.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    key;
    or;
    value;
    contains;
    leading;
    zeros ? parseInt : ;
    will;
    parse;
    correctly.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    value;
    is;
    negative;
    and;
    we;
    output - 1;
    for (missing; that; 's fine.)
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    ensure;
    that;
    the;
    output;
    for (GET; results; does)
        not;
    have;
    any;
    extra;
    spaces;
    at;
    ends.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    use;
    a;
    faster;
    method;
    for (output; ; )
        : process.stdout.write(getResults.join(' ') + '\n');
    but;
    console.log;
    is;
    fine.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    number;
    of;
    GET;
    results;
    is;
    huge, and;
    join;
    could;
    cause;
    memory;
    issue, but;
    300;
    k;
    numbers;
    is;
    okay.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    use;
    a;
    buffer;
    for (output, but; not; needed.
        Now, we)
        should;
    consider;
    that;
    we;
    might;
    need;
    to;
    use;
    a;
    more;
    efficient;
    linked;
    list;
    arrays = __addDisposableResource(env_1, void 0, false), and = __addDisposableResource(env_1, void 0, false), indices = __addDisposableResource(env_1, void 0, false), But = __addDisposableResource(env_1, void 0, false), Node = __addDisposableResource(env_1, void 0, false), objects = __addDisposableResource(env_1, void 0, false), are = __addDisposableResource(env_1, void 0, false), fine = __addDisposableResource(env_1, void 0, false), Now = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), should = __addDisposableResource(env_1, void 0, false), consider = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), might = __addDisposableResource(env_1, void 0, false), need = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), ensure = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), don = __addDisposableResource(env_1, void 0, false);
    't have any memory leaks due to circular references? The linked list nodes have prev and next pointers; after removal, they become unreachable, so GC will collect.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    capacity;
    is;
    larger;
    than;
    the;
    number;
    of;
    distinct;
    keys, so;
    size;
    never;
    exceeds;
    capacity.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    cache;
    is;
    full;
    and;
    we;
    do
        PUT;
    while (on);
    existing;
    key;
    no;
    eviction, just;
    update;
    and;
    move;
    to;
    front.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    cache;
    is;
    full;
    and;
    we;
    do
        GET;
    while (on);
    existing;
    key;
    no;
    eviction, just;
    move;
    to;
    front.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    cache;
    is;
    full;
    and;
    we;
    do
        DEL;
    while (on);
    a;
    key;
    size;
    decreases, so;
    no;
    eviction;
    needed.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    cache;
    is;
    empty;
    and;
    we;
    do
        DEL;
    while (nothing.
        Now, we);
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    cache;
    is;
    empty;
    and;
    we;
    do
        GET;
    while (returns - 1.);
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    cache;
    is;
    empty;
    and;
    we;
    do
        PUT;
    while (adds.
        Now, we);
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    capacity;
    is;
    1;
    and;
    we;
    do
        multiple;
    while (PUTs);
    each;
    new PUT;
    evicts;
    previous.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    capacity;
    is;
    large;
    and;
    we;
    have;
    many;
    keys;
    no;
    eviction.
        Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    handle;
    the;
    where;
    the;
    key;
    is;
    something;
    like;
    "1";
    and;
    we;
    also;
    have;
    a;
    value;
    "1".That;
    's fine.;
    Now, we;
    should;
    consider;
    that;
    we;
    might;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any bug with the sentinel nodes: head and tail are never removed, and we never insert before head or after tail incorrectly.;
    Now, we;
    should;
    consider;
    that in addNodeToFront, we;
    add;
    after;
    head.That;
    's correct.;
    Now, we;
    should;
    consider;
    that in removeNode, we;
    update;
    prev.next;
    and;
    next.prev.That;
    's correct.;
    Now, we;
    should;
    consider;
    that;
    after;
    removing;
    the;
    tail.prev, we;
    need;
    to;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
