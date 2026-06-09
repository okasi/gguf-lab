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
Object.defineProperty(exports, "__esModule", { value: true });
const data = fs.readFileSync(0, 'utf8').trim();
const lines = data.split('\n');
const firstLine = lines[0].split(' ');
const C = parseInt(firstLine[0], 10);
const N = parseInt(firstLine[1], 10);
Then;
for (i; from; 1)
    to;
N;
inclusive();
if (N)
    lines;
exist;
parse;
each;
line.
;
But;
careful: lines[0];
is;
first;
line;
then;
lines[1];
to;
lines[N];
are;
the;
operations.However, there;
might;
be;
extra;
empty;
lines;
at;
end ? We : ;
'll just iterate i from 1 to N, assuming exactly N lines after first.;
We;
can;
also;
use;
a;
more;
efficient;
method: use;
a;
string;
pointer;
and;
parse;
manually, but;
not;
necessary.
    We;
'll store GET results in an array: const getResults: number[] = [];;
Now;
implement;
LRUCache.
    We;
'll define:;
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
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;
    }
    addFront(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        else {
            this.tail = node;
        }
        this.head = node;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addFront(node);
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(node);
        }
        else {
            if (this.size === this.capacity) {
                // evict tail
                const tailNode = this.tail;
                this.map.delete(tailNode.key);
                this.removeNode(tailNode);
                this.size--;
            }
            const newNode = new Node(key, value);
            this.addFront(newNode);
            this.map.set(key, newNode);
            this.size++;
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.moveToFront(node);
        return node.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysOrdered() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
Now;
process;
operations: for (i; from; 1)
    to;
N: const line = lines[i];
const parts = line.split(' ');
const op = parts[0];
if (op === 'PUT') {
    const key = parts[1];
    const value = parseInt(parts[2], 10);
    cache.put(key, value);
}
else if (op === 'GET') {
    const key = parts[1];
    const res = cache.get(key);
    getResults.push(res);
}
else if (op === 'DEL') {
    const key = parts[1];
    cache.del(key);
}
After;
loop, output;
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
const remainingKeys = cache.getKeysOrdered();
if (remainingKeys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(remainingKeys.join(' '));
}
That;
's it.;
But;
we;
must;
ensure;
we;
use;
TypeScript.We;
'll write the code as a complete program with necessary imports.;
We;
'll include:;
Then;
the;
code.
;
We;
should;
be;
careful;
about;
integer;
parsing: values;
are;
signed;
32 - bit, but;
JavaScript;
numbers;
can;
handle;
that.
    Also, we;
need;
to;
consider;
performance: using Map, and, custom, linked, list, is, fine, Potential, pitfalls, we, remove, a, node, we, should, also, nullify, its, prev, and, next, to, avoid, memory, leaks, Not, necessary, We, should, also, consider, that, when, we, evict, tail, we, need, to, ensure, tail, is, not;
null.Since;
size;
equals;
capacity;
and;
we;
are;
inserting;
a;
new key, there;
must;
be;
at;
least;
one;
node, so;
tail;
exists.
    Similarly, when;
we;
remove;
node, ;
if (it)
    's the only node, head and tail become null.;
Now, about;
reading;
input: We;
'll use fs.readFileSync(0, ';
utf8;
'). But note: in Node.js, the argument to readFileSync can be ';
stdin;
' or 0. Usually, it';
s;
fs.readFileSync('/dev/stdin', 'utf8');
but;
they;
said;
"Read stdin with fs.readFileSync(0, ";
utf8;
")".That;
's fine: fs.readFileSync(0, ';
utf8;
') works? Actually, Node.js';
s;
fs.readFileSync;
expects;
a;
file;
path, but;
you;
can;
also;
use;
process.stdin.fd ? Typically : , to;
read;
from;
stdin, you;
can;
do
    fs.readFileSync(process.stdin.fd, 'utf8');
while (or);
just;
read;
from;
process.stdin.But;
they;
specifically;
said: "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, ";
utf8;
").";
In;
Node.js, fs.readFileSync(0, 'utf8');
works;
because;
0;
is;
the;
file;
descriptor;
for (stdin.Yes, that; 's valid.; But)
    we;
need;
to;
ensure;
we;
we;
need;
to;
output;
exactly;
first;
line;
GET;
results;
separated;
by;
spaces, or;
EMPTY;
second;
line;
remaining;
keys;
from;
most - recently - used;
to;
least - recently - used;
separated;
by;
spaces, or;
EMPTY.
;
Edge;
cases: if (there)
    are;
no;
GET;
operations, first;
line;
EMPTY.If;
cache;
empty;
at;
end, second;
line;
EMPTY.
    Now, we;
should;
test;
mentally.
    Example;
Suppose;
C = 2, N = 5;
PUT;
A;
1;
PUT;
B;
2;
GET;
A -  > returns;
1, moves;
A;
to;
front.Cache;
order: A(most, recent), B(least).Output;
GET;
result: 1.;
PUT;
C;
3 -  > capacity;
full, evict;
LRU;
which;
is;
B, then;
insert;
C;
at;
front.Order;
C, A.
;
GET;
B -  > returns - 1(since, B, evicted).GET;
results: 1, -1.;
DEL;
A -  > remove;
A.Cache;
C;
only.
;
GET;
C -  > returns;
3, moves;
to;
front(already, front).GET;
results: 1, -1, 3.;
After;
all, remaining;
keys: C.Output;
first;
line;
"1 -1 3", second;
line;
"C".
    Works.
    Now, consider;
if (there)
    are;
multiple;
GETs;
on;
same;
key, each;
moves;
to;
front.
    Now, about;
the;
output: we;
need;
to;
output;
first;
line;
and;
second;
line.We;
'll use console.log.;
Now, ensure;
we;
handle;
large;
input;
efficiently: splitting;
entire;
input;
into;
lines;
might;
be;
memory;
intensive;
but;
within;
limits(300, k, lines, each, line, maybe, up, to, 20, chars, total, maybe, 6, MB, which, is, fine).Alternatively, we;
could;
use;
a;
stream, but;
not;
needed.
;
But;
note: splitting;
by;
'\n';
creates;
an;
array;
of;
strings, which;
is;
okay.
    We;
'll also consider using a fast I/O: maybe reading as buffer and parsing manually, but not required.;
Now, we;
must;
write;
the;
code in TypeScript, ;
with (proper)
    types.
        We;
'll define Node as a class with properties.;
We;
'll also define LRUCache as a class.;
Then;
main;
function () { }
We;
'll wrap in an IIFE or just write at top level.;
We;
'll include:;
const fs = require('fs'); // but we can use import.
Since;
it;
's TypeScript, we can use import.;
But in Node.js;
with (CommonJS, we)
    might;
use;
require.However, we;
can;
use;
ES;
modules;
if (we)
    set;
type: module, but;
simpler;
to;
use;
require.
;
But;
the;
problem;
says;
"TypeScript program for Node.js".We;
can;
use;
either.Typically, we;
can;
use;
require.
;
But;
to;
be;
safe, we;
can;
use;
compile;
with (appropriate)
    settings.However, the;
code;
will;
be;
executed ? The : ;
environment;
might;
support;
ES;
modules;
if (we)
    have;
a;
package.json;
with (type)
    : module.But;
we;
don;
't know. Usually, in competitive programming environments, they use Node.js with CommonJS. So we can use require.;
But;
the;
instruction: "Return only TypeScript code, no explanation and no Markdown fence.";
So;
we;
just;
output;
the;
code.
    I;
'll write:;
But;
if (they)
    run;
with (tsc)
    and;
then;
node, it;
's fine.;
Alternatively, we;
can;
use: const fs = require('fs');
I;
'll use require to avoid module type issues.;
But;
it;
's TypeScript, so we can use require and it';
s;
fine.
    I;
'll write:;
const fs = require('fs');
Then;
the;
rest.
    Now, we;
need;
to;
ensure;
we;
parse;
integers;
correctly.
    Now, let;
's write the code.;
But;
we;
must;
be;
careful;
about;
the;
where;
the;
input;
might;
have;
extra;
whitespace;
at;
the;
end;
of;
lines ? Using : ;
split(' ');
will;
handle;
multiple;
spaces ? But : ;
keys;
and;
values;
are;
without;
spaces, so;
it;
's fine. However, there might be leading/trailing spaces? Usually not. But we can trim each line before splitting.;
Better: const parts = line.trim().split(/\s+/);
but;
that;
might;
be;
slower.I;
'll just use split(';
') and assume proper input.;
But;
to;
be;
safe, we;
can;
use;
split(' ');
and;
then;
maybe;
trim;
each;
part ? Not : ;
needed.
    Now, we;
need;
to;
consider;
that;
N;
can;
be;
up;
to;
300;
k, so;
we;
should;
avoid;
function main() {
    const data = fs.readFileSync(0, 'utf8').trim();
    if (data === '') {
        // No input? but constraints say there is at least one line.
        return;
    }
    const lines = data.split('\n');
    const firstLineParts = lines[0].split(' ');
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (line === undefined)
            break; // safety
        const parts = line.split(' ');
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const key = parts[1];
            const res = cache.get(key);
            getResults.push(res);
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
    const remainingKeys = cache.getKeysOrdered();
    if (remainingKeys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
var console, log, fs, Node, LRUCache, line, a, more, efficient, way, could, use, a, readline, but, they, specifically, said, to, use, fs, readFileSync, Map, which, is, O;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    console = __addDisposableResource(env_1, void 0, false), log = __addDisposableResource(env_1, void 0, false);
    for (each; GET; result)
        ;
    we;
    collect in array;
    and;
    join;
    at;
    end.
        Now, we;
    also;
    need;
    to;
    output;
    the;
    GET;
    results;
    line;
    if (there)
        are;
    many, joining;
    is;
    fine.
        Now, the;
    remaining;
    keys;
    line: we;
    traverse;
    the;
    linked;
    list;
    from;
    head;
    to;
    tail, which;
    is;
    O(size);
    at;
    most;
    C, which;
    is;
    up;
    to;
    200;
    k, fine.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any memory leaks or performance issues.;
    Now, let;
    's produce the final code.;
    We;
    'll write:;
    fs = require('fs');
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
            this.head = null;
            this.tail = null;
            this.size = 0;
        }
        removeNode(node) {
            if (node.prev) {
                node.prev.next = node.next;
            }
            else {
                this.head = node.next;
            }
            if (node.next) {
                node.next.prev = node.prev;
            }
            else {
                this.tail = node.prev;
            }
        }
        addFront(node) {
            node.prev = null;
            node.next = this.head;
            if (this.head) {
                this.head.prev = node;
            }
            else {
                this.tail = node;
            }
            this.head = node;
        }
        moveToFront(node) {
            this.removeNode(node);
            this.addFront(node);
        }
        put(key, value) {
            if (this.map.has(key)) {
                const node = this.map.get(key);
                node.value = value;
                this.moveToFront(node);
            }
            else {
                if (this.size === this.capacity) {
                    const tailNode = this.tail;
                    this.map.delete(tailNode.key);
                    this.removeNode(tailNode);
                    this.size--;
                }
                const newNode = new Node(key, value);
                this.addFront(newNode);
                this.map.set(key, newNode);
                this.size++;
            }
        }
        get(key) {
            if (!this.map.has(key)) {
                return -1;
            }
            const node = this.map.get(key);
            this.moveToFront(node);
            return node.value;
        }
        del(key) {
            if (this.map.has(key)) {
                const node = this.map.get(key);
                this.removeNode(node);
                this.map.delete(key);
                this.size--;
            }
        }
        getKeysOrdered() {
            const keys = [];
            let current = this.head;
            while (current) {
                keys.push(current.key);
                current = current.next;
            }
            return keys;
        }
    };
    main();
    Now, we;
    should;
    test;
    with (sample)
        input.
        ;
    But;
    we;
    need;
    to;
    ensure;
    that;
    we;
    handle;
    the;
    where;
    there;
    might;
    be;
    extra;
    lines;
    after;
    N ? The : ;
    problem;
    says;
    exactly;
    N;
    lines;
    follow.So;
    we;
    can;
    trust.
        Now, we;
    need;
    to;
    consider;
    that;
    the;
    input;
    might;
    have;
    trailing;
    newline;
    after;
    last;
    line, so;
    trim();
    removes;
    that.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    use;
    the;
    correct;
    file;
    descriptor: fs.readFileSync(0, 'utf8');
    works ? In : ;
    Node.js, fs.readFileSync;
    can;
    take;
    a;
    file;
    descriptor.;
    0;
    is;
    stdin.It;
    should;
    work.
    ;
    But;
    some;
    Node.js;
    versions;
    might;
    require;
    you;
    to;
    read;
    from;
    process.stdin.read();
    instead.However, the;
    problem;
    explicitly;
    says;
    to;
    use;
    fs.readFileSync(0, "utf8").So;
    we;
    'll follow.;
    Now, we;
    should;
    also;
    consider;
    that;
    the;
    input;
    might;
    be;
    large, and;
    reading;
    all;
    at;
    once;
    into;
    memory;
    is;
    fine.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any TypeScript errors. We used Map, Node, etc. All good.;
    Now, we;
    should;
    check;
    for (potential; bugs; )
        : In;
    removeNode, we;
    need;
    to;
    ensure;
    that;
    when;
    we;
    remove;
    the;
    tail, the;
    tail;
    pointer;
    is;
    updated;
    correctly.In;
    our;
    code, ;
    if (node.next)
        is;
    null, then;
    node;
    is;
    tail, we;
    set;
    this.tail = node.prev.That;
    's correct.;
    In;
    addFront, ;
    if (head)
        is;
    null, we;
    set;
    tail = node.Good.
    ;
    In;
    moveToFront, we;
    remove;
    node;
    then;
    add;
    to;
    front.That;
    works;
    even;
    if (node)
        is;
    head;
    or;
    tail.
    ;
    In;
    put, when;
    we;
    evict, we;
    get;
    tailNode = this.tail.Since;
    size == capacity, there;
    is;
    at;
    least;
    one;
    node, so;
    tail;
    is;
    not;
    null.
    ;
    In;
    del, we;
    remove;
    node;
    and;
    delete from;
    map.Good.
    ;
    In;
    getKeysOrdered, we;
    traverse;
    from;
    head;
    to;
    tail, which;
    gives;
    most;
    recent;
    to;
    least;
    recent.Good.
        Now, about;
    the;
    output: The;
    problem;
    says;
    "First line: all GET results separated by spaces, or EMPTY if there were no GET operations.";
    So;
    we;
    output;
    exactly;
    that.;
    "Second line: remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty.";
    So;
    we;
    output;
    that.
        Now, we;
    should;
    consider;
    if (there)
        are;
    any;
    GET;
    results;
    that;
    are - 1, they;
    should;
    be;
    output;
    Now, we;
    must;
    ensure;
    that;
    we;
    don;
    't output any extra spaces or newline. console.log adds newline, that';
    s;
    fine.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    input;
    may;
    have;
    multiple;
    spaces;
    between;
    key;
    and;
    value ? But : ;
    keys;
    are;
    non - empty;
    strings;
    without;
    spaces, so;
    split(' ');
    should;
    work.However, ;
    if (there)
        are;
    leading / trailing;
    spaces, split(' ');
    might;
    produce;
    empty;
    strings.To;
    be;
    safe, we;
    can;
    trim;
    the;
    line;
    first.I;
    'll add line = line.trim(); before split. That';
    s;
    safer.
    ;
    But;
    we;
    need;
    to;
    be;
    careful: if (we)
        trim, we;
    might;
    remove;
    spaces;
    that;
    are;
    part;
    of;
    key ? Keys : ;
    have;
    no;
    spaces, so;
    it;
    's fine.;
    I;
    'll add:;
    line = lines[i].trim();
    if (!line)
        continue; // maybe skip empty lines? But not expected.
    But;
    we;
    can;
    just;
    do
        : const parts = line.trim().split(/\s+/);
    while (But);
    that;
    's more robust. However, split(/\s+/) will handle multiple spaces and trim automatically. But it might be slower. I';
    ll;
    use;
    trim;
    and;
    split(' ');
    with (assumption)
        of;
    single;
    space.
    ;
    Given;
    constraints, it;
    's fine.;
    I;
    'll add trim to each line.;
    Now, we;
    also;
    need;
    to;
    handle;
    the;
    where;
    the;
    input;
    might;
    have;
    less;
    than;
    N;
    lines ? Not : ;
    likely.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    input;
    might;
    have;
    extra;
    whitespace;
    at;
    the;
    end;
    of;
    lines, like;
    "PUT key value  ".trim();
    will;
    remove;
    that.
        Now, we;
    also;
    need;
    to;
    consider;
    that;
    the;
    input;
    might;
    have;
    empty;
    lines;
    between;
    operations ? Not : ;
    according;
    to;
    spec, but;
    we;
    can;
    skip;
    empty;
    lines.
        I;
    'll add a check: if (line === ';
    ') continue; after trim.;
    But;
    we;
    need;
    to;
    ensure;
    we;
    still;
    process;
    exactly;
    N;
    operations.If;
    there;
    are;
    blank;
    lines, we;
    might;
    skip;
    and;
    not;
    process;
    N;
    operations.But;
    the;
    problem;
    says;
    "Next N lines are one of: PUT key value GET key DEL key".So;
    each;
    line;
    is;
    an;
    operation, no;
    blank;
    lines.So;
    we;
    can;
    just;
    process;
    lines[1];
    to;
    lines[N];
    inclusive.But;
    if (there)
        are;
    extra;
    newline;
    at;
    the;
    end, lines;
    array;
    might;
    have;
    an;
    extra;
    empty;
    string;
    after;
    split('\n');
    if (we)
        didn;
    't trim. For example, if input ends with newline, data.split(';
    n;
    ') will produce an extra empty string at the end. That';
    s;
    why;
    we;
    trim();
    the;
    whole;
    data;
    first, which;
    removes;
    trailing;
    newline, but;
    there;
    could;
    still;
    be;
    an;
    empty;
    string;
    at;
    the;
    end ? Actually : , ;
    if (we)
        do
            data.trim(), it;
        while (removes);
    leading;
    and;
    trailing;
    whitespace, including;
    newline;
    at;
    the;
    end.Then;
    split('\n');
    will;
    not;
    produce;
    an;
    extra;
    empty;
    string;
    because;
    the;
    string;
    ends;
    without;
    newline.However, ;
    if (there)
        are;
    multiple;
    newlines, trim;
    removes;
    them.So;
    it;
    's fine.;
    But;
    we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't lose any lines if there are leading/trailing spaces? Not an issue.;
    Now, we;
    also;
    need;
    to;
    consider;
    that;
    the;
    input;
    might;
    be;
    huge;
    and;
    splitting;
    into;
    lines;
    might;
    create;
    a;
    large;
    array, but;
    it;
    's okay.;
    Now, we;
    should;
    also;
    consider;
    a = __addDisposableResource(env_1, void 0, false), more = __addDisposableResource(env_1, void 0, false), efficient = __addDisposableResource(env_1, void 0, false), way = __addDisposableResource(env_1, void 0, false), could = __addDisposableResource(env_1, void 0, false), use = __addDisposableResource(env_1, void 0, false), a = __addDisposableResource(env_1, void 0, false);
    while (loop)
        reading;
    line;
    by;
    line;
    readline = __addDisposableResource(env_1, void 0, false), but = __addDisposableResource(env_1, void 0, false), they = __addDisposableResource(env_1, void 0, false), specifically = __addDisposableResource(env_1, void 0, false), said = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), use = __addDisposableResource(env_1, void 0, false), fs = __addDisposableResource(env_1, void 0, false), readFileSync = __addDisposableResource(env_1, void 0, false);
    (0, "utf8").So;
    we;
    read;
    all.
        Now, we;
    must;
    ensure;
    we;
    don;
    't use any external libraries.;
    Now, let;
    's write the final code.;
    But;
    we;
    need;
    to;
    be;
    careful: In;
    TypeScript, we;
    need;
    to;
    declare;
    types.We;
    'll use string, number, etc.;
    Now, we;
    might;
    want;
    to;
    make;
    the;
    code;
    shorter;
    but;
    it;
    's fine.;
    Now, we;
    should;
    also;
    consider;
    that;
    the;
    problem;
    might;
    require;
    the;
    program;
    to;
    be;
    single;
    file;
    with (no)
        additional;
    files.
        Now, we;
    will;
    output;
    the;
    code;
    But;
    before;
    finalizing, let;
    's double-check the LRU behavior: "PUT updates an existing key and makes it most recently used." That';
    s;
    what;
    we;
    do
        .;
    while ("If inserting and the cache is over capacity, evict the least recently used key.");
    We;
    do
        that.;
    while ("GET should output the value if present, otherwise -1, and a successful GET makes the key most recently used.");
    We;
    do
        that.;
    while ("DEL removes the key if present.");
    We;
    do
        that.
            Now, output;
    while ();
    "First line: all GET results separated by spaces, or EMPTY if there were no GET operations.";
    So;
    we;
    output;
    exactly;
    that.;
    "Second line: remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty.";
    So;
    we;
    output;
    that.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't output any extra lines or spaces.;
    Now, test;
    with (a)
        simple;
    Input: 2;
    3;
    PUT;
    A;
    1;
    PUT;
    B;
    2;
    GET;
    A;
    Processing: C = 2, N = 3.;
    PUT;
    A;
    1;
    cache: A;
    PUT;
    B;
    2;
    cache: A, B(A, most, recent ? Actually : , after, PUT, A, A, is, most, recent.Then, PUT, B, since, capacity, not, full, we, insert, B, at, front, making, B, most, recent, A, least, recent.So, order, B(most), A(least).
    , GET, A, A, present);
    return 1, move;
    A;
    to;
    front: order;
    becomes;
    A, B.GET;
    result: 1.;
    After;
    operations, remaining;
    keys: A, B(most, to, least).Output;
    first;
    line;
    "1", second;
    line;
    "A B".
    ;
    But;
    our;
    code: after;
    PUT;
    A, cache;
    head = A, tail = A.After;
    PUT;
    B, we;
    add;
    B;
    at;
    front: head = B, tail = A.GET;
    A: we;
    get;
    node;
    A, moveToFront;
    remove;
    A;
    from;
    middle(it, 's tail) and add to front: head = A, tail = B. So order: A, B. So remaining keys: A B. Good., Now, test);
    with (eviction)
        : Input: 2;
    4;
    PUT;
    A;
    1;
    PUT;
    B;
    2;
    PUT;
    C;
    3;
    GET;
    A;
    Processing: C = 2.;
    PUT;
    A: A;
    PUT;
    B: B, A(B, most, recent, A, least);
    PUT;
    C: capacity;
    full, evict;
    LRU(A), then;
    insert;
    C;
    at;
    front: C, B.
    ;
    GET;
    A: A;
    not;
    present, ;
    return -1.;
    GET;
    result: -1.;
    Remaining;
    keys: C, B(most, to, least).Output;
    first;
    line;
    "-1", second;
    line;
    "C B".
    ;
    Our;
    code: after;
    PUT;
    B, head = B, tail = A.PUT;
    C: evict;
    tail;
    A, remove;
    A, then;
    add;
    C;
    at;
    front: head = C, tail = B.GET;
    A: not;
    found, ;
    return -1.;
    Remaining;
    keys: C, B.Good.
        Now, test;
    with (DEL)
        : Input: 2;
    3;
    PUT;
    A;
    1;
    PUT;
    B;
    2;
    DEL;
    A;
    GET;
    B;
    After;
    PUT;
    A: A;
    PUT;
    B: B, A;
    DEL;
    A: remove;
    A, cache;
    B;
    only.
    ;
    GET;
    B: returns;
    2, moves;
    B;
    to;
    front(already, front).GET;
    result: 2.;
    Remaining;
    keys: B.
        Output;
    "2";
    and;
    "B".
    ;
    Our;
    code: after;
    DEL;
    A, we;
    remove;
    node;
    A, size--, tail;
    becomes;
    B, head;
    remains;
    B.GET;
    B: move;
    to;
    front, no;
    change.Good.
        Now, test;
    with (no)
        GET: Input: 2;
    2;
    PUT;
    A;
    1;
    PUT;
    B;
    2;
    Output: first;
    line;
    EMPTY, second;
    line;
    "B A"(most, to, least, B, most, recent, A, least).Actually;
    after;
    PUT;
    A, then;
    PUT;
    B, order;
    B, A.So;
    remaining;
    keys: B;
    A.So;
    output: EMPTY;
    and;
    "B A".
    ;
    Our;
    code: getResults;
    empty -  > EMPTY.getKeysOrdered;
    returns[B, A] -  > "B A".Good.
        Now, test;
    with (empty)
        cache;
    at;
    end: Input: 2;
    2;
    PUT;
    A;
    1;
    DEL;
    A;
    Output: first;
    line;
    EMPTY(no, GET), second;
    line;
    EMPTY(cache, empty).Our;
    code: after;
    DEL, size = 0, head = null, getKeysOrdered;
    returns[] -  > EMPTY.Good.
        Now, test;
    with (multiple)
        GETs;
    on;
    same;
    key: Input: 2;
    4;
    PUT;
    A;
    1;
    PUT;
    B;
    2;
    GET;
    A;
    GET;
    A;
    Processing: after;
    PUT;
    A, PUT;
    B: order;
    B, A.GET;
    A: returns;
    1, move;
    A;
    to;
    front: order;
    A, B.GET;
    A: returns;
    1, move;
    A;
    to;
    front(already, front);
    order;
    A, B.GET;
    results: 1;
    1.;
    Remaining: A;
    B.
    ;
    Our;
    code: first;
    GET;
    moves;
    A;
    to;
    front;
    second;
    GET;
    also;
    moves;
    A;
    to;
    front, but;
    it;
    's already front, so no change. Good.;
    Now, test;
    with (PUT)
        updating;
    existing;
    key: Input: 2;
    3;
    PUT;
    A;
    1;
    PUT;
    A;
    2;
    GET;
    A;
    Processing: PUT;
    A;
    1;
    A.PUT;
    A;
    2;
    update;
    value;
    to;
    2, move;
    to;
    front(still, A).GET;
    A: returns;
    2.;
    GET;
    result: 2.;
    Remaining: A.
    ;
    Our;
    code: put;
    when;
    key;
    exists;
    updates;
    value;
    and;
    moves;
    to;
    front.Good.
        Now, test;
    with (capacity)
        1;
    Input: 1;
    3;
    PUT;
    A;
    1;
    PUT;
    B;
    2;
    GET;
    A;
    Processing: PUT;
    A: A.PUT;
    B: evict;
    A(since, capacity, 1), then;
    insert;
    B: B.GET;
    A: -1.;
    GET;
    result: -1.;
    Remaining: B.
    ;
    Our;
    code: capacity = 1.;
    After;
    PUT;
    A, size = 1.;
    PUT;
    B: size == capacity, evict;
    tail;
    A, then;
    add;
    B, size = 1.;
    GET;
    A: -1.;
    Good.
        Now, test;
    with (large)
        values: values;
    are;
    signed;
    32 - bit, so;
    they;
    fit in JS;
    number.
        Now, we;
    must;
    ensure;
    that;
    we;
    use;
    parseInt;
    with (radix)
        10.;
    Now, about;
    performance: O(1);
    per;
    operation.Our;
    operations;
    are;
    O(1);
    amortized ? Actually : , each;
    operation;
    is;
    O(1);
    because;
    map;
    operations;
    are;
    O(1);
    average, and;
    linked;
    list;
    operations;
    are;
    O(1).So;
    it;
    's fine.;
    Now, we;
    should;
    also;
    consider;
    that;
    we;
    are;
    Map = __addDisposableResource(env_1, void 0, false), which = __addDisposableResource(env_1, void 0, false), is = __addDisposableResource(env_1, void 0, false), O = __addDisposableResource(env_1, void 0, false);
    (1);
    average.That;
    's fine.;
    Now, we;
    need;
    to;
    ensure;
    we;
    don;
    't have any memory leaks: when we remove a node, we don';
    t;
    nullify;
    its;
    references, but;
    that;
    's okay; the garbage collector will handle.;
    Now, we;
    should;
    also;
    consider;
    that;
    the;
    input;
    might;
    have;
    keys;
    that;
    are;
    numbers ? They : ;
    are;
    strings, so;
    fine.
        Now, we;
    must;
    ensure;
    that;
    we;
    output;
    exactly;
    first;
    line;
    GET;
    results;
    separated;
    by;
    spaces;
    if (there)
        are;
    many;
    GET;
    results, we;
    join;
    with (space.If)
        there;
    are;
    no;
    GET;
    results, output;
    EMPTY.
        Now, we;
    should;
    also;
    consider;
    that;
    the;
    output;
    might;
    be;
    large, but;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
