const u = nameToIndex.get(A);
    const v = nameToIndex.get(B);
    // u and v should exist
    adj[u].push(v);
    indeg[v]++;

Now we have graph.

Now implement MinHeap.

We'll define:

class MinHeap {
    private heap: number[];
    private compare: (a: number, b: number) => number;

    constructor(compare: (a: number, b: number) => number) {
        this.heap = [];
        this.compare = compare;
    }

    private parent(i: number): number { return (i - 1) >> 1; }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }

    size(): number { return this.heap.length; }
    isEmpty(): boolean { return this.heap.length === 0; }

    push(item: number): void {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }

    pop(): number {
        if (this.heap.length === 0) throw new Error('pop from empty heap');
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last!;
            this._bubbleDown(0);
        }
        return top;
    }

    peek(): number {
        if (this.heap.length === 0) throw new Error('peek from empty heap');
        return this.heap[0];
    }

    private _bubbleUp(i: number): void {
        while (i > 0) {
            const p = this.parent(i);
            if (this.compare(this.heap[i], this.heap[p]) < 0) {
                [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
                i = p;
            } else {
                break;
            }
        }
    }

    private _bubbleDown(i: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.compare(this.heap[l], this.heap[smallest]) < 0) {
                smallest = l;
            }
            if (r < n && this.compare(this.heap[r], this.heap[smallest]) < 0) {
                smallest = r;
            }
            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            } else {
                break;
            }
        }
    }
}

Now, in main, we need to create a comparator that compares indices based on tasks[i] lexicographically.

const compare = (i: number, j: number) => {
    const a = tasks[i];
    const b = tasks[j];
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

But note: tasks are distinct, so equality never occurs.

Now, instantiate heap: const heap = new MinHeap(compare);

Now, for each i where indeg[i] == 0, heap.push(i).

Then while !heap.isEmpty():
    const u = heap.pop();
    result.push(tasks[u]);
    for (const v of adj[u]) {
        indeg[v]--;
        if (indeg[v] == 0) {
            heap.push(v);
        }
    }

After loop, if result.length == N, console.log(result.join(' ')); else console.log('IMPOSSIBLE');

That's it.

But we must ensure we output exactly as required: "output all task names in order separated by spaces." No extra trailing space.

Now, consider performance: N up to maybe 10^5? M up to 10^6? Our heap operations O(log N) each, so fine.

We must not use any external libraries; we are only using fs.

Now, we need to write the code as a single TypeScript file. We'll include necessary imports and declare variables.

We'll also add a check for valid input: if nameToIndex.get(A) is undefined, maybe throw error, but assume valid.

Now, let's write the final code.

But we need to be careful: The problem says "Implement your own binary heap or another efficient priority queue; do not repeatedly sort the available set." So we must implement our own heap. We have done that.

Now, final code.

We'll also add a main guard: if (require.main === module) { main(); } but not strictly necessary. We can just call main.

We'll use `require('fs')` if we are in Node.js CommonJS; but TypeScript can use `import fs from 'fs';` if we have ES modules. The problem says "Node.js", we can use CommonJS or ES modules. Usually, in such coding problems, they use CommonJS with require. But TypeScript can compile to either. Since the instruction says "Return only TypeScript code", we can write it with ES6 imports? But Node.js may not support ES modules without flag. Safer to use CommonJS: `const fs = require('fs');` but that's not TypeScript-style. However, TypeScript can compile to CommonJS. In a TypeScript file, we can use `import fs from 'fs';` and set module to commonjs in tsconfig. But since we are just providing code, we can use `require` directly, but it's not TypeScript-friendly. Typically, in such problems, they accept either. I'll use `import fs from 'fs';` as it's cleaner and TypeScript. But to be safe, we can use `const fs = require('fs');` because it's more compatible with Node.js without tsconfig. However, the problem says "Write a complete TypeScript program for Node.js." So we can write TypeScript code that uses `import` and relies on appropriate compilation. I'll use `import fs from 'fs';` because it's standard.

But note: In Node.js, if you run with ts-node, it supports ES modules. Usually, coding platforms compile TypeScript with ts-node or tsc. I'll assume it's fine.

Alternatively, we can avoid imports by using global `process.stdin`? But they specifically said "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." So we must use fs.readFileSync. So we need to import fs.

I'll write:

import * as fs from 'fs';

Then use fs.readFileSync.

Now, the code.

We'll also include a `main` function.

Let's draft.

```typescript
import * as fs from 'fs';

class MinHeap {
    private heap: number[];
    private compare: (a: number, b: number) => number;

    constructor(compare: (a: number, b: number) => number) {
        this.heap = [];
        this.compare = compare;
    }

    private parent(i: number): number { return (i - 1) >> 1; }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }

    size(): number { return this.heap.length; }
    isEmpty(): boolean { return this.heap.length === 0; }

    push(item: number): void {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }

    pop(): number {
        if (this.heap.length === 0) {
            throw new Error('pop from empty heap');
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last!;
            this._bubbleDown(0);
        }
        return
