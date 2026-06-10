import * as fs from 'fs';

class MinHeap<T> {
    private data: T[] = [];
    private cmp: (a: T, b: T) => number;

    constructor(cmp: (a: T, b: T) => number) {
        this.cmp = cmp;
    }

    size(): number {
        return this.data.length;
    }

    push(item: T): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): T | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.cmp(this.data[idx], this.data[parent]) < 0) {
                [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
                idx = parent;
            } else break;
        }
    }

    private bubbleDown(idx: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = idx * 2 + 1;
            const right = left + 1;
            if (left < n && this.cmp(this.data[left], this.data[smallest]) < 0) smallest = left;
            if (right < n && this.cmp(this.data[right], this.data[smallest]) < 0) smallest = right;
            if (smallest !== idx) {
                [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
                idx = smallest;
            } else break;
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
if (input.length === 0) process.exit(0);
const tokens = input.split(/\s+/);
let pos = 0;
const N = parseInt(tokens[pos++], 10);
const M = parseInt(tokens[pos++], 10);

const names: string[] = [];
for (let i = 0; i < N; i++) names.push(tokens[pos++]);

const nameToIndex = new Map<string, number>();
for (let i = 0; i < N; i++) nameToIndex.set(names[i], i);

const adj: number[][] = Array.from({ length: N }, () => []);
const indeg: number[] = Array(N).fill(0);

for (let i = 0; i < M; i++) {
    const a = tokens[pos++];
    const b = tokens[pos++];
    const u = nameToIndex.get(a)!;
    const v = nameToIndex.get(b)!;
    adj[u].push(v);
    indeg[v]++;
}

const heap = new MinHeap<number>((a, b) => {
    const na = names[a];
    const nb = names[b];
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
});

for (let i = 0; i < N; i++) {
    if (indeg[i] === 0) heap.push(i);
}

const result: string[] = [];
while (heap.size() > 0) {
    const u = heap.pop()!;
    result.push(names[u]);
    for (const v of adj[u]) {
        indeg[v]--;
        if (indeg[v] === 0) heap.push(v);
    }
}

if (result.length !== N) {
    console.log('IMPOSSIBLE');
} else {
    console.log(result.join(' '));
}
