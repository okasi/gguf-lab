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
const fs = __importStar(require("fs"));
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const first = lines[0].split(' ');
const C = parseInt(first[0], 10);
const N = parseInt(first[1], 10);
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line)
        continue; // maybe empty lines
    const parts = line.split(' ');
    const op = parts[0];
    if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (op === 'GET') {
        const key = parts[1];
        const result = cache.get(key);
        getResults.push(result);
    }
    else if (op === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
// Output
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
// Keys
const keys = cache.getKeysFromMostRecentToLeast();
if (keys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(keys.join(' '));
}
Now, implement;
LRUCache: class Node {
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
        this.head = new Node('', 0); // sentinel
        this.tail = new Node('', 0); // sentinel
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    addNode(node) {
        // insert before tail
        node.prev = this.tail.prev;
        node.next = this.tail;
        this.tail.prev.next = node;
        this.tail.prev = node;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    moveToTail(node) {
        this.removeNode(node);
        this.addNode(node);
    }
    removeHead() {
        if (this.head.next === this.tail)
            return null;
        const node = this.head.next;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
        return node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.moveToTail(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToTail(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNode(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeHead(); // this decrements size
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
    getKeysFromMostRecentToLeast() {
        const keys = [];
        let node = this.tail.prev;
        while (node !== this.head) {
            keys.push(node.key);
            node = node.prev;
        }
        return keys;
    }
}
That;
's the core.;
But;
we;
need;
to;
consider;
that;
the;
sentinel;
nodes;
have;
empty;
key.That;
's fine.;
Now, we;
must;
ensure;
that;
the;
code;
runs;
with (Node.js)
    and;
TypeScript.We;
might;
need;
to;
compile;
TypeScript;
first, but;
the;
problem;
likely;
expects;
that;
the;
code;
can;
be;
executed;
with (ts - node)
    or;
they;
will;
compile.Usually in such;
problems, they;
accept;
JavaScript.But;
the;
instruction;
says;
TypeScript.We;
'll output TypeScript code with appropriate types.;
We;
also;
need;
to;
handle;
possible;
large;
input;
and;
avoid;
stack;
overflow ? Not : ;
relevant.
;
One;
potential;
issue: In;
removeNode, we;
assume;
node.prev;
and;
node.next;
are;
not;
null.Since;
we;
only;
call;
removeNode;
on;
nodes;
that;
are in the;
list();
with (proper)
    links;
it;
's safe.;
In;
addNode, we;
also;
assume;
tail.prev;
is;
not;
null.
;
We;
also;
need;
to;
consider;
that;
when;
we;
call;
removeHead;
after;
adding;
a;
node, we;
might;
be;
removing;
the;
node;
we;
just;
added;
if (capacity)
    is;
0 ? But : ;
capacity >= 1, so;
after;
adding, size;
becomes;
1, which;
is;
not > capacity;
if (capacity = 1, so)
    we;
don;
't evict. If capacity=1 and we add a second distinct key, size becomes 2 > 1, we evict the head. That';
s;
fine.
    Now, we;
need;
to;
ensure;
that;
the;
order;
of;
keys;
after;
all;
operations;
is;
correct.The;
traversal;
from;
tail.prev;
to;
head.next;
yields;
most;
recent;
first.
    Now, we;
should;
test;
with (a)
    small;
example.
    Example;
C = 2, N = 7;
PUT;
A;
1;
PUT;
B;
2;
GET;
A -  > 1, order;
A(most, recent), B;
PUT;
C;
3 -  > evict;
B, order;
C, A;
GET;
B -  > -1;
DEL;
A;
GET;
C -  > 3;
Remaining;
keys: C(most, recent);
then ? After : ;
DEL;
A, order;
C;
only.So;
second;
line: C.
;
Our;
implementation: after;
PUT;
A;
1;
list: head -  > A -  > tail.GET;
A: move;
to;
tail, but;
it;
's already tail? Actually after put, A is at tail. GET moves it to tail again (no change). After PUT B 2: list: head -> A -> B -> tail. GET A: move A to tail => order: B, A. So after GET A, order: B (least), A (most). Then PUT C 3: insert C, size becomes 3 > 2, evict head which is B. So after eviction, list: head -> A -> C -> tail. Then GET B -> -1. DEL A: remove A, list: head -> C -> tail. GET C -> 3, move C to tail (already tail). Remaining keys: C. So output: first line: "1 -1 3"? Actually GET results: first GET A ->1, then GET B -> -1, then GET C ->3, so "1 -1 3". Second line: "C". That matches.;
Now, we;
need;
to;
ensure;
that;
the;
output;
lines;
are;
exactly;
first;
line;
all;
GET;
results;
separated;
by;
spaces, or;
EMPTY.Second;
line;
keys;
from;
most;
recent;
to;
least;
recent, or;
EMPTY.
    Now, we;
need;
to;
consider;
that;
the;
input;
may;
have;
extra;
whitespace;
or;
trailing;
newline.We;
'll trim and split by newline.;
We;
'll also need to handle that there may be empty lines at the end. We';
ll;
only;
process;
up;
to;
N;
lines.
    Now, we;
need;
to;
output;
exactly;
'll also consider using fast I/O? Not necessary, but we can use process.stdin? The requirement says "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." So we must use fs.readFileSync.;
Now, we;
need;
to;
write;
the;
code in a;
single;
file.
    We;
'll include import statement.;
Now, we;
need;
to;
ensure;
that;
the;
code;
is;
TypeScript.We;
'll use strict mode maybe, but not required.;
We;
'll define types for Node etc.;
We;
'll also consider that the Map';
s;
get;
and;
set;
are;
O(1);
average.
    Now, let;
's produce the final code.;
But;
we;
should;
also;
consider;
potential;
issues;
with (using)
    sentinel;
nodes;
and;
the;
fact;
that;
we;
are;
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLineParts = lines[0].split(' ');
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const parts = line.split(' ');
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    const keys = cache.getKeysFromMostRecentToLeast();
    if (keys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keys.join(' '));
    }
}
var Node, constructor, a, simpler, approach, all, operations, we, could, iterate, the, map, split, lines, Node, LRUCache, parts, line, parts, op, Map, which, is, efficient, Now, we, can, produce, the, final, code, But, the, problem, says, that, Now, we, need, to, output, only, TypeScript, code, no, explanation, and, no, Markdown, fence, So, we, will, output, the, code, as, plain, text, Now, we, should, also, consider, that, we, might, need, to, set, the, Node, js, environment, to, run, TypeScript, Typically, they, would, compile, it, first, But, we, can, include, a, comment, about, compilation, No, we, just, output, code, Now, we, should, also, consider, using, a, faster, I;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    Node = __addDisposableResource(env_1, void 0, false), constructor = __addDisposableResource(env_1, void 0, false);
    with (dummy)
        values.It;
    's fine.;
    Now, we;
    might;
    want;
    to;
    optimize;
    by;
    not;
    creating;
    Node;
    objects;
    for (sentinel ? It : ; 's fine.; Now, we)
        'll produce the code.;
    But;
    the;
    problem;
    says;
    "Return only TypeScript code, no explanation and no Markdown fence.";
    So;
    we;
    should;
    output;
    the;
    code;
    without;
    any;
    backticks;
    or;
    extra;
    text.
        Thus, final;
    answer: the;
    TypeScript;
    code.
        We;
    'll include the necessary import.;
    Now, we;
    need;
    to;
    ensure;
    that;
    the;
    code;
    is;
    correct;
    and;
    compiles.
    ;
    One;
    more;
    thing: In;
    the;
    getKeysFromMostRecentToLeast;
    method, we;
    traverse;
    from;
    tail.prev;
    back;
    to;
    head.However, ;
    if (the)
        list;
    is;
    empty(size = 0), tail.prev;
    is;
    head, so;
    the;
    loop;
    condition;
    node !== this.head;
    will;
    be;
    false, and;
    we;
    return empty;
    array.That;
    's correct.;
    Now, we;
    might;
    also;
    consider;
    a = __addDisposableResource(env_1, void 0, false), simpler = __addDisposableResource(env_1, void 0, false), approach = __addDisposableResource(env_1, void 0, false), all = __addDisposableResource(env_1, void 0, false), operations = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), could = __addDisposableResource(env_1, void 0, false), iterate = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), map = __addDisposableResource(env_1, void 0, false);
     in order ? But : ;
    map;
    doesn;
    't guarantee LRU order. So we must use linked list.;
    Now, we;
    should;
    test;
    with (edge)
        cases: capacity;
    1, many;
    operations.
        Example;
    C = 1, N = 3;
    PUT;
    A;
    1, PUT;
    B;
    2, GET;
    A -  > -1, GET;
    B -  > 2.;
    After;
    PUT;
    A: list: A.PUT;
    B: insert;
    B, size;
    becomes;
    2 > 1, evict;
    head(A).So;
    list: B.GET;
    A -  > -1, GET;
    B -  > 2.;
    Remaining;
    keys: B.Output;
    "-1 2";
    and;
    "B".Works.
        Now, test;
    DEL: C = 2, PUT;
    A1, PUT;
    B2, DEL;
    A, GET;
    B -  > 2, remaining;
    B.Good.
        Now, test;
    PUT;
    update: C = 2, PUT;
    A1, PUT;
    B2, PUT;
    A3, GET;
    A -  > 3, remaining;
    order: A(most, recent), B ? Actually : ;
    after;
    PUT;
    A3, we;
    update;
    A;
    and;
    move;
    to;
    tail, so;
    order: B(least), A(most).So;
    remaining;
    keys: A, B ? Wait : ;
    most;
    recent;
    to;
    least;
    recent: A;
    then;
    B.So;
    output;
    "A B".Good.
        Now, we;
    need;
    to;
    ensure;
    that;
    the;
    order;
    after;
    multiple;
    GETs: each;
    GET;
    moves;
    to;
    tail, so;
    order;
    changes.
        Now, we;
    need;
    to;
    consider;
    that;
    the;
    input;
    may;
    have;
    keys;
    that;
    are;
    numeric ? They : ;
    are;
    strings, so;
    fine.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    parse;
    integers;
    correctly: parseInt;
    with (radix)
        10.;
    Now, we;
    need;
    to;
    ensure;
    that;
    the;
    code;
    runs;
    within;
    time;
    limits.O(1);
    per;
    operation, total;
    O(N);
    time.Memory;
    O(C);
    for (nodes.
        Now, we; should; also)
        consider;
    that;
    we;
    might;
    have;
    many;
    GET;
    results, and;
    we;
    store;
    them in an;
    array, then;
    join.That;
    's fine.;
    Now, we;
    need;
    to;
    output;
    the;
    code.
    ;
    But;
    the;
    problem;
    says;
    "Write a complete TypeScript program for Node.js.";
    So;
    we;
    should;
    include;
    the;
    code.
        We;
    'll also include a main execution block.;
    Now, we;
    need;
    to;
    be;
    careful;
    about;
    the;
    line;
    splitting: we;
    used;
    split(/\r?\n/);
    to;
    handle;
    Windows;
    line;
    endings.But;
    we;
    could;
    also;
    just;
    split('\n');
    and;
    then;
    trim;
    each;
    line.However, split('\n');
    will;
    keep;
    r;
    if (present ? Actually : , )
        if (input)
            has;
    r;
    n, split('\n');
    will;
    give;
    lines;
    with (trailing)
        ;
    r.So;
    better;
    to;
    use;
    split(/\r?\n/);
    or;
    replace;
    r;
    with (nothing.We)
        'll use split(';
    n;
    ') and then for each line, trim? But trimming might affect keys? Keys are non-empty without spaces, so trimming is safe. However, trimming could remove leading/trailing spaces that are not part of key? The input likely doesn';
    t;
    have;
    extra;
    spaces.But;
    to;
    be;
    safe, we;
    can;
    split;
    by;
    whitespace;
    for (each; line ? Actually : ; each)
        line;
    has;
    exactly;
    three;
    tokens;
    for (PUT, two; ; )
        for (GET / DEL.So; we; can)
            split;
    by;
    space.Using;
    line.split(' ');
    will;
    handle;
    multiple;
    spaces ? It : ;
    will;
    produce;
    empty;
    strings;
    if (multiple)
        spaces.But;
    input;
    is;
    well - formed, so;
    it;
    's fine.;
    We;
    'll parse lines after the first.;
    We;
    can;
    also;
    read;
    all;
    tokens;
    at;
    once;
    split = __addDisposableResource(env_1, void 0, false);
    (/\s+/);
    but;
    then;
    we;
    need;
    to;
    know;
    structure.Better;
    to;
    process;
    line;
    by;
    line.
        We;
    'll do:;
    lines = input.split(/\r?\n/);
    if (lines[0] === '')
        lines.shift(); // maybe empty first line due to trim? We'll trim input first.
    We;
    'll do: const input = fs.readFileSync(0, ';
    utf8;
    ').trim(); then const lines = input.split(/\r?\n/);;
    That;
    should;
    work.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    only;
    process;
    N;
    lines;
    after;
    the;
    first.There;
    might;
    be;
    extra;
    lines ? We : ;
    'll only loop i from 1 to N inclusive, but if lines length is less than N+1, we may have issues. But assume input is correct.;
    Now, we;
    'll produce final code.;
    But;
    we;
    might;
    want;
    to;
    use;
    a;
    faster;
    parsing;
    method ? Not : ;
    needed.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    cache;
    capacity;
    C;
    can;
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
    memory;
    for (nodes; up; to)
        200;
    k, fine.
        Now, we;
    'll write the code with proper types.;
    We;
    'll also add a check for N=0? Not possible because N>=1.;
    Now, we;
    'll produce the final answer.;
    But;
    before;
    finalizing, we;
    should;
    double - check;
    the;
    output;
    format: "First line: all GET results separated by spaces, or EMPTY if there were no GET operations. Second line: remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty.";
    So;
    if (there)
        are;
    GET;
    operations, we;
    output;
    the;
    results;
    even;
    if (some)
        are - 1.;
    If;
    none, "EMPTY".For;
    keys, ;
    if (cache)
        empty, "EMPTY".
            Now, we;
    need;
    to;
    ensure;
    that;
    we;
    output;
    exactly;
    that, ;
    with (no)
        trailing;
    spaces.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    keys;
    order;
    from;
    most;
    recent;
    to;
    least;
    recent: that;
    is;
    the;
    order;
    of;
    the;
    linked;
    list;
    from;
    tail;
    to;
    head.Our;
    traversal;
    does;
    that.
        Now, we;
    should;
    also;
    consider;
    that;
    after;
    all;
    operations, the;
    linked;
    list;
    order;
    is;
    correct.
        Now, we;
    can;
    write;
    the;
    code.
    ;
    But;
    there;
    is;
    a;
    nuance: In;
    the;
    PUT;
    operation, ;
    if (the)
        key;
    already;
    exists, we;
    update;
    value;
    and;
    move;
    to;
    tail.That;
    's correct.;
    Now, we;
    need;
    to;
    ensure;
    that;
    when;
    we;
    evict, we;
    evict;
    the;
    least;
    recently;
    used, which;
    is;
    head.next.
        Now, we;
    also;
    need;
    to;
    consider;
    that;
    the;
    sentinel;
    nodes;
    have;
    no;
    key, but;
    we;
    never;
    output;
    them.
        Now, let;
    's write the code with proper formatting.;
    We;
    'll also include a main function to avoid global scope.;
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
        addNode(node) {
            node.prev = this.tail.prev;
            node.next = this.tail;
            this.tail.prev.next = node;
            this.tail.prev = node;
        }
        removeNode(node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        moveToTail(node) {
            this.removeNode(node);
            this.addNode(node);
        }
        removeHead() {
            if (this.head.next === this.tail)
                return null;
            const node = this.head.next;
            this.removeNode(node);
            this.map.delete(node.key);
            this.size--;
            return node;
        }
        get(key) {
            const node = this.map.get(key);
            if (!node)
                return -1;
            this.moveToTail(node);
            return node.value;
        }
        put(key, value) {
            const node = this.map.get(key);
            if (node) {
                node.value = value;
                this.moveToTail(node);
            }
            else {
                const newNode = new Node(key, value);
                this.map.set(key, newNode);
                this.addNode(newNode);
                this.size++;
                if (this.size > this.capacity) {
                    this.removeHead();
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
        getKeysFromMostRecentToLeast() {
            const keys = [];
            let node = this.tail.prev;
            while (node !== this.head) {
                keys.push(node.key);
                node = node.prev;
            }
            return keys;
        }
    };
    main();
    Now, we;
    should;
    check;
    for (any; potential; issues)
        : -In;
    removeNode, we;
    use;
    non - null;
    assertion(!);
    because;
    we;
    assume;
    node.prev;
    and;
    node.next;
    are;
    not;
    null.Since;
    we;
    only;
    call;
    removeNode;
    on;
    nodes;
    that;
    are;
    properly;
    linked, it;
    's safe. But to be safe, we could check, but not needed.
        - In;
    addNode, we;
    assume;
    tail.prev;
    is;
    not;
    null.Since;
    we;
    always;
    have;
    at;
    least;
    head;
    and;
    tail, tail.prev;
    is;
    at;
    least;
    head, so;
    it;
    's not null.
        - In;
    removeHead, we;
    check;
    if (head.next === tail, then)
        return null.That;
    's correct.
        - In;
    getKeysFromMostRecentToLeast, we;
    traverse;
    from;
    tail.prev.If;
    list;
    empty, tail.prev;
    is;
    head, so;
    loop;
    condition;
    node !== head;
    is;
    false, keys;
    empty.
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
    have;
    extra;
    whitespace.We;
    used;
    split(' ');
    which;
    might;
    produce;
    empty;
    strings;
    if (multiple)
        spaces.But;
    the;
    input;
    is;
    well - formed.However, to;
    be;
    robust, we;
    could;
    use;
    split(/\s+/);
    but;
    then;
    we;
    need;
    to;
    ensure;
    we;
    have;
    the;
    right;
    number;
    of;
    parts.For;
    PUT, we;
    need;
    3;
    parts;
    for (GET / DEL, 2; parts.We; can)
        use;
    split(/\s+/);
    and;
    then;
    check.But;
    simpler: use;
    split(' ');
    and;
    it;
    's fine.;
    But;
    note: if (there)
        are;
    leading / trailing;
    spaces in a;
    line, split(' ');
    would;
    produce;
    empty;
    first;
    element.For;
    example, " PUT A 1";
    would;
    give['', 'PUT', 'A', '1'];
    if (we)
        split;
    by;
    space.That;
    would;
    cause;
    op;
    to;
    be;
    '';
    and;
    cause;
    errors.To;
    avoid, we;
    can;
    trim;
    each;
    line;
    before;
    splitting.So;
    we;
    should;
    do
        : const line = lines[i].trim();
    while ();
    if (!line)
        continue;
    then;
    parts = line.split(/\s+/);
    That;
    would;
    handle;
    multiple;
    spaces;
    and;
    leading / trailing.But;
    we;
    can;
    also;
    just;
    use;
    trim;
    and;
    split(' ').However, split(' ');
    on;
    a;
    trimmed;
    string;
    with (single)
        spaces;
    works.If;
    there;
    are;
    multiple;
    spaces, split(' ');
    will;
    produce;
    empty;
    strings.For;
    example, "PUT  A 1" -  > split(' ');
    gives['PUT', '', 'A', '1'].That;
    would;
    cause;
    op = 'PUT', but;
    then;
    parts[1];
    would;
    be;
    '';
    not;
    'A'.So;
    it;
    's safer to use split(/\s+/) which splits on any whitespace and ignores multiple spaces.;
    Thus, we;
    'll change: const parts = line.trim().split(/\s+/); That will give array of tokens.;
    We;
    'll do:;
    line = lines[i];
    if (!line.trim())
        continue; // skip empty lines
    parts = line.trim().split(/\s+/);
    op = parts[0];
    if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
    }
    else if (op === 'GET') {
        const key = parts[1];
    }
    else if (op === 'DEL') {
        const key = parts[1];
    }
    That;
    is;
    robust.
        Now, we;
    also;
    need;
    to;
    ensure;
    that;
    the;
    first;
    line;
    parsing;
    is;
    robust: const firstLineParts = lines[0].trim().split(/\s+/);
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
    on;
    lines, but;
    trim;
    handles.
        Now, we;
    should;
    also;
    consider;
    that;
    N;
    may;
    be;
    up;
    to;
    300;
    k, and;
    we;
    are;
    storing;
    all;
    lines in an;
    array.That;
    's fine memory-wise.;
    Now, we;
    should;
    also;
    consider;
    that;
    we;
    are;
    Map = __addDisposableResource(env_1, void 0, false), which = __addDisposableResource(env_1, void 0, false), is = __addDisposableResource(env_1, void 0, false), efficient = __addDisposableResource(env_1, void 0, false), Now = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), can = __addDisposableResource(env_1, void 0, false), produce = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), final = __addDisposableResource(env_1, void 0, false), code = __addDisposableResource(env_1, void 0, false), But = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), problem = __addDisposableResource(env_1, void 0, false), says = __addDisposableResource(env_1, void 0, false);
    "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, ";
    utf8;
    ").";
    We;
    are;
    that = __addDisposableResource(env_1, void 0, false), Now = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), need = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), output = __addDisposableResource(env_1, void 0, false), only = __addDisposableResource(env_1, void 0, false), TypeScript = __addDisposableResource(env_1, void 0, false), code = __addDisposableResource(env_1, void 0, false), no = __addDisposableResource(env_1, void 0, false), explanation = __addDisposableResource(env_1, void 0, false), and = __addDisposableResource(env_1, void 0, false), no = __addDisposableResource(env_1, void 0, false), Markdown = __addDisposableResource(env_1, void 0, false), fence = __addDisposableResource(env_1, void 0, false), So = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), will = __addDisposableResource(env_1, void 0, false), output = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), code = __addDisposableResource(env_1, void 0, false), as = __addDisposableResource(env_1, void 0, false), plain = __addDisposableResource(env_1, void 0, false), text = __addDisposableResource(env_1, void 0, false), Now = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), should = __addDisposableResource(env_1, void 0, false), also = __addDisposableResource(env_1, void 0, false), consider = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), might = __addDisposableResource(env_1, void 0, false), need = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), set = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), Node = __addDisposableResource(env_1, void 0, false), js = __addDisposableResource(env_1, void 0, false), environment = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), run = __addDisposableResource(env_1, void 0, false), TypeScript = __addDisposableResource(env_1, void 0, false), Typically = __addDisposableResource(env_1, void 0, false), they = __addDisposableResource(env_1, void 0, false), would = __addDisposableResource(env_1, void 0, false), compile = __addDisposableResource(env_1, void 0, false), it = __addDisposableResource(env_1, void 0, false), first = __addDisposableResource(env_1, void 0, false), But = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), can = __addDisposableResource(env_1, void 0, false), include = __addDisposableResource(env_1, void 0, false), a = __addDisposableResource(env_1, void 0, false), comment = __addDisposableResource(env_1, void 0, false), about = __addDisposableResource(env_1, void 0, false), compilation = __addDisposableResource(env_1, void 0, false), No = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), just = __addDisposableResource(env_1, void 0, false), output = __addDisposableResource(env_1, void 0, false), code = __addDisposableResource(env_1, void 0, false), Now = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), should = __addDisposableResource(env_1, void 0, false), also = __addDisposableResource(env_1, void 0, false), consider = __addDisposableResource(env_1, void 0, false), using = __addDisposableResource(env_1, void 0, false), a = __addDisposableResource(env_1, void 0, false), faster = __addDisposableResource(env_1, void 0, false), I = __addDisposableResource(env_1, void 0, false);
    /O method like process.stdin.read() but we are using fs.readFileSync which reads all at once. That's acceptable.;
    Now, final;
    code.
    ;
    But;
    we;
    might;
    want;
    to;
    use;
    a;
    simpler;
    approach: use;
    a;
    Map;
    and;
    maintain;
    order;
    via;
    a;
    Set ? Not : ;
    needed.
        Now, we;
    'll produce the final answer.;
    One;
    more;
    thing: In;
    the;
    output, we;
    need;
    to;
    output;
    the;
    keys;
    from;
    most - recently - used;
    to;
    least - recently - used.Our;
    traversal;
    from;
    tail.prev;
    to;
    head;
    gives;
    that;
    order.However, we;
    must;
    ensure;
    that;
    after;
    all;
    operations, the;
    order;
    is;
    correct.For;
    example,
    ;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
