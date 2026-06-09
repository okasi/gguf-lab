import * as fs from 'fs';

class MinHeap {
    heap: number[];
    names: string[];

    constructor(names: string[]) {
        this.heap = [-1]; // dummy at index 0
        this.names = names;
    }

    push(v: number): void {
        this.heap.push(v);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): number | undefined {
        if (this.heap.length <= 1) return undefined;
        const top = this.heap[1];
        const last = this.heap.pop()!;
        if (this.heap.length > 1) {
            this.heap[1] = last;
            this.bubbleDown(1);
        }
        return top;
    }

    size(): number {
        return this.heap.length - 1;
    }

    private bubbleUp(idx: number): void {
        while (idx > 1) {
            const parent = idx >> 1;
            if (this.names[this.heap[parent]] <= this.names[this.heap[idx]]) break;
            [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
            idx = parent;
        }
    }

    private bubbleDown(idx: number): void {
        const len = this.heap.length;
        while (true) {
            const left = idx << 1;
            const right = left + 1;
            if (left >= len) break;
            let smallest = left;
            if (right < len && this.names[this.heap[right]] < this.names[this.heap[left]]) {
                smallest = right;
            }
            if (this.names[this.heap[smallest]] < this.names[this.heap[idx]]) {
                [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
                idx = smallest;
            } else break;
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim().split(/\s+/);
let ptr = 0;
const N = parseInt(input[ptr++], 10);
const M = parseInt(input[ptr++], 10);

const names: string[] = [];
for (let i = 0; i < N; i++) {
    names.push(input[ptr++]);
}

const nameToIndex = new Map<string, number>();
for (let i = 0; i < N; i++) {
    nameToIndex.set(names[i], i);
}

const adj: number[][] = Array.from({ length: N }, () => []);
const indeg: number[] = Array(N).fill(0);

for (let i = 0; i < M; i++) {
    const a = input[ptr++];
    const b = input[ptr++];
    const ai = nameToIndex.get(a);
    const bi = nameToIndex.get(b);
    if (ai !== undefined && bi !== undefined) {
        adj[ai].push(bi);
        indeg[bi]++;
    }
}

const heap = new MinHeap(names);
for (let i = 0; i < N; i++) {
    if (indeg[i] === 0) heap.push(i);
}

const result: number[] = [];
while (heap.size() > 0) {
    const u = heap.pop()!;
    result.push(u);
    for (const v of adj[u]) {
        indeg[v]--;
        if (indeg[v] === 0) heap.push(v);
    }
}

if (result.length !== N) {
    console.log('IMPOSSIBLE');
} else {
    console.log(result.map(i => names[i]).join(' '));
}
