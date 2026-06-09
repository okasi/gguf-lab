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
class MinHeap {
    constructor() { this.heap = []; }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    peek() {
        return this.heap[0];
    }
    size() { return this.heap.length; }
    bubbleUp(idx) {
        const item = this.heap[idx];
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1;
            if (this.heap[parentIdx][0] <= item[0])
                break;
            this.heap[idx] = this.heap[parentIdx];
            idx = parentIdx;
        }
        this.heap[idx] = item;
    }
    sinkDown(idx) {
        const half = this.heap.length >> 1;
        const item = this.heap[idx];
        while (idx < half) {
            let childIdx = (idx << 1) + 1;
            const right = childIdx + 1;
            if (right < half && this.heap[right][0] < this.heap[childIdx][0]) {
                childIdx = right;
            }
            if (this.heap[childIdx][0] >= item[0])
                break;
            this.heap[idx] = this.heap[childIdx];
            idx = childIdx;
        }
        this.heap[idx] = item;
    }
}
But;
careful: In;
sinkDown, we;
compare;
with (item[0](cost).However, the)
    heap;
property;
is;
that;
parent <= children.So;
if (child)
    's cost is less than item[0], we swap. In the loop, we check if childIdx < half and if right child exists and its cost less than left child';
s;
cost, we;
choose;
right.Then;
if (heap[childIdx][0] >= item[0], )
    break;
else
    we;
move;
child;
up.That;
's correct.;
Alternatively, we;
can;
use;
simpler: push;
and;
pop;
with (array.splice ? Not : )
    efficient.
        We;
'll implement.;
Now;
Dijkstra: Initialize;
dist[H][W];
with (Infinity(or, a, large, number).Set)
    dist[startR][startC] = 0.;
Heap;
push[0, startR, startC].
;
While;
heap;
not;
empty: const [d, r, c] = heap.pop();
if (d > dist[r][c])
    continue;
if (r === targetR && c === targetC)
    return d; // early exit
For;
each;
direction(dr, dc) in [(-1, 0), (1, 0), (0, -1), (0, 1)];
let nr = r + dr, nc = c + dc;
if (nr < 0 || nr >= H || nc < 0 || nc >= W)
    continue;
const cell = grid[nr][nc];
if (cell === '#')
    continue;
let cost = 0;
if (cell === 'S' || cell === 'T')
    cost = 0;
else
    cost = parseInt(cell);
const nd = d + cost;
if (nd < dist[nr][nc]) {
    dist[nr][nc] = nd;
    heap.push([nd, nr, nc]);
}
If;
loop;
ends;
without;
reaching;
target, ;
return -1.;
But;
note: The;
target;
T;
might;
be;
reached;
with (some)
    cost.Since;
we;
early;
exit;
when;
we;
pop;
T, that;
's fine.;
Potential;
issue: The;
start;
cell;
might;
be;
S, but;
what;
if (the)
    grid;
contains;
multiple;
S ? Probably : ;
not.But;
we;
treat;
S;
0.;
Now, we;
need;
to;
ensure;
we;
handle;
large;
H, W.dist;
array;
with (Infinity.
    Now, we)
    need;
to;
output;
the;
result.
    We;
'll write the code as a script.;
We;
need;
to;
include;
's TypeScript, so we should include types. But the problem says "Write a complete TypeScript program for Node.js." So we need to produce TypeScript code that can be compiled with tsc. We';
ll;
include;
types;
for (variables.
    We; 'll also need to consider that Node.js may not have the fs module typed? But we can just import it.; We)
    'll produce:;
But in Node.js, we;
can;
use;
require.But;
TypeScript;
can;
use;
import.We;
'll use import because it';
s;
TS.
    We;
'll set up:;
But;
if (we)
    are;
not;
require();
function main() {
    const data = fs.readFileSync(0, 'utf8').trim();
    const lines = data.split(/\r?\n/);
    const firstLine = lines[0].trim().split(/\s+/).map(Number);
    const H = firstLine[0];
    const W = firstLine[1];
    const grid = [];
    for (let i = 1; i <= H; i++) {
        // In case there are extra empty lines, we can skip? But we assume exactly H lines.
        // However, if there are blank lines, we might need to handle. But typical problems have no blank lines.
        // We'll take lines[i] and trim, but if lines[i] is undefined, we break.
        if (i < lines.length) {
            grid.push(lines[i].trim().split(''));
        }
        else {
            // Maybe there are fewer lines? We'll assume input is correct.
            break;
        }
    }
    // Find start and target
    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const ch = grid[r][c];
            if (ch === 'S') {
                startR = r;
                startC = c;
            }
            if (ch === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }
    // Dijkstra
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const heap = new MinHeap();
    heap.push([0, startR, startC]);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (heap.size() > 0) {
        const [d, r, c] = heap.pop(); // non-null because we checked size
        if (d > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === '#')
                continue;
            const cost = (cell === 'S' || cell === 'T') ? 0 : parseInt(cell);
            const nd = d + cost;
            if (nd < dist[nr][nc]) {
                dist[nr][nc] = nd;
                heap.push([nd, nr, nc]);
            }
        }
    }
    console.log(-1);
}
var a, module, system, we, might, need, to, use, require, But, we, can, still, use, fs, fs, MinHeap;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    a = __addDisposableResource(env_1, void 0, false), module = __addDisposableResource(env_1, void 0, false), system = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), might = __addDisposableResource(env_1, void 0, false), need = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), use = __addDisposableResource(env_1, void 0, false), require = __addDisposableResource(env_1, void 0, false), But = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), can = __addDisposableResource(env_1, void 0, false), still = __addDisposableResource(env_1, void 0, false), use = __addDisposableResource(env_1, void 0, false);
    if (we)
        set;
    target;
    ES2015;
    and;
    's fine.;
    But;
    to;
    be;
    safe, we;
    can;
    use;
    require: const fs = require('fs');
    That;
    works in both;
    JS;
    and;
    TS.
        We;
    'll use require.;
    Now, we;
    need;
    to;
    output;
    the;
    code;
    without;
    explanation;
    and;
    without;
    Markdown;
    fences.So;
    just;
    raw;
    code.
        We;
    'll write:;
    fs = require('fs');
    // ...
    We;
    'll also define the MinHeap class.;
    We;
    'll also define a function solve() and call it.;
    Now, let;
    's test mentally.;
    Example: Input: 5;
    5;
    S123;
    #;
    #;
    1111;
    111;
    #;
    1;
    1111;
    T;
    11111;
    But;
    we;
    need;
    to;
    verify.
    ;
    Better;
    to;
    test;
    with (a)
        simple;
    2;
    2, S1, 2;
    T => start;
    at(0, 0), cost;
    to(0, 1);
    is;
    1, to(1, 0);
    is;
    2, to(1, 1);
    from(0, 1);
    cost;
    0 ? Actually : ;
    T;
    cost;
    0.;
    So;
    path;
    S -  > (0, 1);
    cost;
    1, then;
    to;
    T;
    cost;
    0;
    total;
    1.;
    Or;
    S -  > (1, 0);
    cost;
    2, then;
    to;
    T;
    cost;
    0;
    total;
    2.;
    Minimum;
    1.;
    So;
    output;
    1.;
    Our;
    algorithm;
    should;
    compute;
    that.
        Edge;
    If;
    start;
    and;
    target;
    adjacent;
    with (wall ? Unreachable -  > -1.
        :
    )
        Now, we;
    need;
    to;
    ensure;
    we;
    handle;
    the;
    where;
    H;
    and;
    W;
    are;
    large;
    and;
    we;
    might;
    have;
    many;
    pushes.The;
    heap;
    should;
    be;
    efficient.
        Now, we;
    need;
    to;
    produce;
    final;
    code.
    ;
    But;
    we;
    need;
    to;
    be;
    careful: The;
    input;
    may;
    have;
    spaces ? The : ;
    grid;
    lines;
    are;
    characters;
    without;
    spaces.So;
    we;
    can;
    just;
    take;
    lines[i].trim();
    and;
    then;
    split;
    into;
    characters.
    ;
    But;
    what;
    if (the)
        grid;
    lines;
    contain;
    spaces ? Unlikely.
        We : ;
    'll use: grid.push(lines[i].split(';
    ').filter(ch => ch !== ';
    ')); but better to just take each character, ignoring spaces? The problem says "grid characters" and they are given as strings without spaces. So we can just take lines[i] as is, but ensure it';
    s;
    trimmed.
        We;
    'll do: grid.push(lines[i].trim().split(';
    '));;
    But;
    if (there)
        are;
    trailing;
    spaces, trim;
    removes;
    them.That;
    's fine.;
    Now, we;
    need;
    to;
    parse;
    H;
    and;
    W;
    correctly.The;
    first;
    line;
    may;
    have;
    extra;
    spaces.We;
    'll split by whitespace.;
    Now, we;
    need;
    to;
    consider;
    that;
    the;
    input;
    may;
    have;
    empty;
    lines;
    at;
    the;
    end.We;
    'll trim overall.;
    Now, we;
    'll write the code.;
    But;
    also;
    note: In;
    Dijkstra, we;
    might;
    push;
    many;
    entries.We;
    should;
    avoid;
    pushing;
    if (nd >= dist[nr][nc])
        already.
            Now, we;
    need;
    to;
    output;
    the;
    result;
    number.
        Now, we;
    need;
    to;
    ensure;
    the;
    code;
    is;
    valid;
    TypeScript.We;
    'll add types.;
    Let;
    's write:;
    But;
    if (we)
        use;
    we;
    need;
    to;
    specify;
    type;
    for (fs.In; Node.js, the; fs)
        ;
    available.We;
    'll just use require.;
    To;
    keep;
    it;
    simple, we;
    'll use require.;
    Now, we;
    'll write:;
    fs = require('fs');
    MinHeap = class MinHeap {
        constructor() {
            this.heap = [];
        }
        push(item) {
            this.heap.push(item);
            this.bubbleUp(this.heap.length - 1);
        }
        pop() {
            if (this.heap.length === 0)
                return undefined;
            const top = this.heap[0];
            const last = this.heap.pop();
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.sinkDown(0);
            }
            return top;
        }
        peek() {
            return this.heap[0];
        }
        size() {
            return this.heap.length;
        }
        bubbleUp(idx) {
            const item = this.heap[idx];
            while (idx > 0) {
                const parentIdx = (idx - 1) >> 1;
                if (this.heap[parentIdx][0] <= item[0])
                    break;
                this.heap[idx] = this.heap[parentIdx];
                idx = parentIdx;
            }
            this.heap[idx] = item;
        }
        sinkDown(idx) {
            const half = this.heap.length >> 1;
            const item = this.heap[idx];
            while (idx < half) {
                let childIdx = (idx << 1) + 1;
                const right = childIdx + 1;
                if (right < half && this.heap[right][0] < this.heap[childIdx][0]) {
                    childIdx = right;
                }
                if (this.heap[childIdx][0] >= item[0])
                    break;
                this.heap[idx] = this.heap[childIdx];
                idx = childIdx;
            }
            this.heap[idx] = item;
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
    runs in Node.js;
    with (TypeScript.We)
        'll need to compile. But the problem just asks for the code.;
    We;
    should;
    also;
    consider;
    that;
    the;
    grid;
    might;
    contain;
    digits;
    '0';
    which;
    cost;
    0.;
    That;
    's fine.;
    Potential;
    bug: In;
    sinkDown, we;
    used;
    half = heap.length >> 1.;
    But;
    the;
    condition;
    for (childIdx; ; )
        : we;
    need;
    to;
    check;
    if (childIdx < heap.length, not)
        half ? Actually : ;
    half;
    is;
    floor(length / 2).The;
    children;
    indices;
    are(idx << 1) + 1;
    and(idx << 1) + 2.;
    If;
    idx < half, then;
    left;
    child;
    exists.So;
    half;
    is;
    correct.But;
    we;
    also;
    need;
    to;
    ensure;
    that;
    when;
    we;
    check;
    right;
    child, we;
    compare;
    if (right < heap.length ? Actually : )
        if (idx < half, then)
            left;
    child;
    exists.Right;
    child;
    exists;
    if (idx << 1)
        +2 < heap.length.But;
    we;
    used;
    right < half ? That : ;
    's wrong. Because half is floor(length/2). For idx = 0, half = floor(length/2). For length=2, half=1, idx=0 < 1, so we consider children. left child = 1, right child = 2. right < half? 2 < 1 false, so we don';
    t;
    consider;
    right.But;
    right;
    child;
    exists;
    only;
    if (length > 2.)
        Actually;
    for (length = 2, only; left; child)
        exists.So;
    it;
    's okay. But for length=3, half=1, idx=0, left child=1, right child=2. right < half? 2 < 1 false, so we wouldn';
    t;
    consider;
    right;
    even;
    though;
    it;
    exists.That;
    's a bug. Because half is 1, but right child index 2 is not less than half, but it exists. So we need to compare with heap.length, not half. Actually the condition for existence of right child is (idx<<1)+2 < heap.length. So we should check that. So we need to adjust sinkDown.;
    Better: while (idx < heap.length) {
        let left = 2 * idx + 1;
        let right = 2 * idx + 2;
        let smallest = idx;
        if (left < heap.length && heap[left][0] < heap[smallest][0])
            smallest = left;
        if (right < heap.length && heap[right][0] < heap[smallest][0])
            smallest = right;
        if (smallest === idx)
            break; // swap and continue } That's simpler.
        We;
        'll rewrite sinkDown properly.;
        Let;
        's implement a standard min-heap:;
        sinkDown(idx, number);
        void {
            const: n = this.heap.length,
            const: item = this.heap[idx],
            while() {
                let smallest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;
                if (left < n && this.heap[left][0] < this.heap[smallest][0]) {
                    smallest = left;
                }
                if (right < n && this.heap[right][0] < this.heap[smallest][0]) {
                    smallest = right;
                }
                if (smallest === idx)
                    break;
                // swap
                const temp = this.heap[idx];
                this.heap[idx] = this.heap[smallest];
                this.heap[smallest] = temp;
                idx = smallest;
            }
        };
        But;
        we;
        need;
        to;
        be;
        careful: In;
        bubbleUp;
        we;
        used;
        a;
        different;
        method(percolating, up, by, shifting).That;
        's fine. But sinkDown can be implemented with swaps. However, the bubbleUp we used shifting, which is fine. But sinkDown with swaps is simpler.;
        But;
        we;
        need;
        to;
        ensure;
        consistency: In;
        bubbleUp, we;
        used;
        shifting: we;
        set;
        this.heap[idx] = this.heap[parentIdx];
        and;
        then;
        after;
        loop;
        set;
        this.heap[idx] = item.That;
        's efficient. For sinkDown, we could also use shifting to avoid swaps, but swaps are fine.;
        We;
        'll implement sinkDown with swaps for clarity.;
        But;
        note: In;
        Dijkstra, we;
        push;
        many;
        items, so;
        heap;
        operations;
        are;
        frequent.Swaps;
        are;
        okay.
            Now, we;
        need;
        to;
        ensure;
        that;
        the;
        heap;
        pop;
        returns;
        the;
        top;
        element;
        correctly.
            We;
        'll rewrite MinHeap with simpler methods:;
        class MinHeap {
            constructor() {
                this.heap = [];
            }
            push(item) {
                this.heap.push(item);
                this.bubbleUp(this.heap.length - 1);
            }
            pop() {
                if (this.heap.length === 0)
                    return undefined;
                const top = this.heap[0];
                const last = this.heap.pop();
                if (this.heap.length > 0) {
                    this.heap[0] = last;
                    this.sinkDown(0);
                }
                return top;
            }
            size() {
                return this.heap.length;
            }
            bubbleUp(idx) {
                const item = this.heap[idx];
                while (idx > 0) {
                    const parent = (idx - 1) >> 1;
                    if (this.heap[parent][0] <= item[0])
                        break;
                    this.heap[idx] = this.heap[parent];
                    idx = parent;
                }
                this.heap[idx] = item;
            }
            sinkDown(idx) {
                const n = this.heap.length;
                const item = this.heap[idx];
                while (true) {
                    let smallest = idx;
                    const left = 2 * idx + 1;
                    const right = 2 * idx + 2;
                    if (left < n && this.heap[left][0] < this.heap[smallest][0]) {
                        smallest = left;
                    }
                    if (right < n && this.heap[right][0] < this.heap[smallest][0]) {
                        smallest = right;
                    }
                    if (smallest === idx)
                        break;
                    // swap
                    const temp = this.heap[idx];
                    this.heap[idx] = this.heap[smallest];
                    this.heap[smallest] = temp;
                    idx = smallest;
                }
            }
        }
        That;
        should;
        be;
        correct.
            Now, we;
        need;
        to;
        ensure;
        that;
        we;
        use;
        the;
        correct;
        type;
        for (cost; ; )
            : number.
                Now, we;
        also;
        need;
        to;
        consider;
        that;
        the;
        grid;
        might;
        have;
        characters;
        other;
        than;
        S, T, , digits ? Probably : ;
        not.
            Now, we;
        need;
        to;
        handle;
        the;
        where;
        start;
        or;
        target;
        not;
        found ? The : ;
        problem;
        likely;
        guarantees;
        exactly;
        one;
        S;
        and;
        one;
        T.
            Now, we;
        need;
        to;
        output;
        the;
        result;
        single;
        line.
            Now, we;
        can;
        test;
        with (a)
            small;
        example.
        ;
        But;
        we;
        must;
        also;
        consider;
        that;
        the;
        input;
        may;
        have;
        multiple;
        test;
        cases ? The : ;
        problem;
        statement;
        doesn;
        't mention multiple test cases. It says "First line: H W". So only one case.;
        Now, we;
        need;
        to;
        ensure;
        we;
        use;
        fast;
        I / O ? Not : ;
        necessary.
            Now, we;
        need;
        to;
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
        cost;
        of;
        entering;
        a;
        cell;
        is;
        the;
        digit;
        value.However, the;
        start;
        cell;
        is;
        S, cost;
        0.;
        But;
        what;
        if (the)
            start;
        cell;
        is;
        also;
        a;
        digit ? Not : ;
        possible.
            Now, we;
        need;
        to;
        ensure;
        we;
        treat;
        the;
        start;
        cell;
        correctly: we;
        set;
        dist[startR][startC] = 0;
        and;
        push.That;
        's fine.;
        Now, we;
        also;
        need;
        to;
        consider;
        that;
        the;
        target;
        T;
        might;
        be;
        unreachable, we;
        output - 1.;
        Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        may;
        contain;
        spaces ? Probably : ;
        not.
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
        lines;
        after;
        the;
        grid ? We : ;
        'll ignore.;
        Now, we;
        need;
        to;
        write;
        the;
        code;
        single;
        block.
            We;
        'll also add some comments? Not necessary.;
        Now, we;
        need;
        to;
        ensure;
        that;
        the;
        code;
        compiles;
        with (tsc.We)
            'll add types.;
        Now, we;
        need;
        to;
        ensure;
        that;
        we;
        use;
        const and, let, appropriately, Now, we, need, to, ensure, that, we, handle, the, where, H, or, W, is;
        0 ? Not : ;
        likely.
            Now, we;
        need;
        to;
        ensure;
        that;
        we;
        use;
        the;
        correct;
        type;
        for (dist; ; )
            : number[][], but;
        we;
        can;
        also;
        use;
        a;
        1;
        D;
        array ? Not : ;
        needed.
            Now, we;
        need;
        to;
        ensure;
        that;
        we;
        don;
        't have any runtime errors: e.g., when parsing digits, parseInt of a digit string returns the number. But if the cell is ';
        0;
        ', parseInt(';
        0;
        ') = 0, which is correct. However, we treat S and T as cost 0, but if a digit is ';
        0;
        ', cost 0 as well. That';
        s;
        fine.
            Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        may;
        have;
        characters;
        like;
        '10' ? No : , digits;
        are;
        single;
        characters.
            Now, we;
        need;
        to;
        ensure;
        that;
        we;
        treat;
        walls;
        Now, we;
        need;
        to;
        ensure;
        that;
        we;
        use;
        the;
        correct;
        directions.
            Now, we;
        need;
        to;
        ensure;
        that;
        we;
        don;
        't have any off-by-one.;
        Now, we;
        need;
        to;
        ensure;
        that;
        we;
        handle;
        large;
        inputs: The;
        heap;
        size;
        can;
        be;
        up;
        to;
        H * W.That;
        's fine.;
        Now, we;
        need;
        to;
        ensure;
        that;
        we;
        use;
        the;
        correct;
        type;
        for (the; heap; items)
            : [number, number, number].
                Now, we;
        need;
        to;
        ensure;
        that;
        we;
        use;
        the;
        correct;
        function to() { }
        read;
        stdin: fs.readFileSync(0, 'utf8');
        works;
        on;
        Node.js.
            Now, we;
        need;
        to;
        ensure;
        that;
        we;
        don;
        't use any external libraries.;
        Now, we;
        need;
        to;
        output;
        only;
        the;
        code, no;
        explanation.
            Now, we;
        need;
        to;
        check;
        for (potential; pitfalls; )
            : The;
        start;
        and;
        target;
        might;
        be;
        the;
        same ? If : ;
        S;
        and;
        T;
        are;
        the;
        same;
        cell, then;
        the;
        distance;
        is;
        0.;
        Our;
        code;
        would;
        find;
        startR == targetR;
        and;
        startC == targetC, and in the;
        while (loop, when)
            we;
        pop;
        start, we;
        check;
        if (it)
            's target, and return d=0. That works.;
        But;
        we;
        need;
        to;
        ensure;
        that;
        we;
        push;
        start;
        and;
        then;
        pop;
        it, and;
        then;
        check;
        target.That;
        's fine.;
        Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        might;
        have;
        no;
        digits ? Only : ;
        S;
        and;
        T;
        and;
        walls.Then;
        cost;
        is;
        0.;
        Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        might;
        have;
        S;
        and;
        T;
        adjacent;
        with (a)
            wall;
        between ? Not : ;
        possible.
            Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        might;
        have;
        digits;
        with (cost)
            0 ? That : ;
        's fine.;
        Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        might;
        have;
        digits;
        with (cost > 0.)
            Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        might;
        have;
        multiple;
        S;
        or;
        T ? Not : ;
        likely.
            Now, we;
        need;
        to;
        consider;
        that;
        the;
        input;
        may;
        have;
        H;
        and;
        W;
        with (spaces ? We : )
            parse.
                Now, we;
        need;
        to;
        consider;
        that;
        the;
        lines;
        for (grid; may; contain)
            leading / trailing;
        spaces.We;
        trim;
        each;
        line.
            Now, we;
        need;
        to;
        consider;
        that;
        there;
        might;
        be;
        an;
        empty;
        line;
        after;
        the;
        grid ? We : ;
        ignore.
            Now, we;
        need;
        to;
        consider;
        that;
        the;
        input;
        may;
        have;
        Windows;
        line;
        endings(r, n).We;
        split;
        on;
        r ?  : ;
        n.
            Now, we;
        need;
        to;
        consider;
        that;
        the;
        first;
        line;
        may;
        have;
        extra;
        spaces.We;
        split;
        on;
        whitespace.
            Now, we;
        need;
        to;
        consider;
        that;
        the;
        grid;
        lines;
        may;
        have;
        spaces;
        between;
        characters ? The : ;
        problem;
        says;
        "grid characters", likely;
        no;
        spaces.So;
        we;
        treat;
        each;
        character;
        cell.If;
        there;
        are;
        spaces, they;
        would;
        be;
        considered ? Probably : ;
        not.So;
        we;
        assume;
        no;
        spaces.
            Now, we;
        need;
        to;
        ensure;
        that;
        we;
        don;
        't inadvertently treat spaces as cells. We';
        ll;
        trim;
        each;
        line, but;
        if (there)
            are;
        spaces;
        within;
        the;
        grid;
        line, they;
        would;
        remain.But;
        that;
        would;
        be;
        weird.We;
        'll ignore.;
        Now, we;
        need;
        to;
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
        the;
        code;
        is;
        valid;
        TypeScript.We;
        'll add type annotations for variables.;
        Now, we;
        need;
        to;
        ensure;
        that;
        we;
        use;
        the;
        correct;
        /require. In TypeScript, using require is fine without import if we declare the module? Actually, if we use require, we need to declare that the fs module exists. In Node.js TypeScript, we can use import fs from 'fs'; or require. But require is a runtime function, and TypeScript may complain if we don't declare it. However, in a plain .ts file without module system, using require is okay if we have @types/node;
        installed ? But : ;
        the;
        problem;
        likely;
        expects;
        that;
        the;
        code;
        will;
        be;
        compiled;
        with (tsc)
            and;
        run;
        with (Node.js, and)
        /node is typically available. But to be safe, we can use import.;
        But;
        the;
        instruction: "Write a complete TypeScript program for Node.js.";
        So;
        we;
        can;
        assume;
        the;
        environment;
        has;
        Node.js;
        types.We;
        'll use import.;
        But;
        we;
        need;
        to;
        ensure;
        that;
        the;
        code;
        can;
        be;
        compiled;
        with (tsc)
            and;
        run.Typically, ;
        for (competitive; programming, they; use)
            require.I;
        'll use require to avoid module issues. But in TypeScript, using require without declaring it might cause "Cannot find name ';
        require;
        '" error if strict mode is on? Actually, in Node.js, require is a global function, but TypeScript might not know it if you don';
        t;
        have;
        /node. However, in many online judges, they have Node.js types. But to be safe, we can use const fs = require('fs'); and it will work if @types/node;
        is;
        installed.But;
        if (we)
            are;
        writing;
        code;
        for (a; platform; that)
            doesn;
        't have @types/node, it might still compile because require is defined in the global scope? Actually, in Node.js, require is a global function, but TypeScript';
        s;
        compiler;
        might;
        not;
        recognize;
        it;
        unless;
        you;
        var from = ;
        'module';
        or;
        use;
        require;
        from;
        'fs' ? I : ;
        think in recent;
        TypeScript, when;
        targeting;
        Node.js, it;
        automatically;
        includes;
        Node.js;
        types;
        if (you)
            have;
        /node in your tsconfig? Not automatically. However, many online judges use tsc with --lib es2015,dom? Not sure;
    }
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
