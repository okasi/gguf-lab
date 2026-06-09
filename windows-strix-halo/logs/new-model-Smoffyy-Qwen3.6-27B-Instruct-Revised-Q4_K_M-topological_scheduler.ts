import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    push(val: string): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.heap[parent] <= this.heap[idx]) break;
            [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
            idx = parent;
        }
    }

    private bubbleDown(idx: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
            if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
            if (smallest === idx) break;
            [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
            idx = smallest;
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;
    const tokens = input.split(/\s+/);
    let ptr = 0;

    const N = parseInt(tokens[ptr++], 10);
    const M = parseInt(tokens[ptr++], 10);

    const tasks: string[] = new Array(N);
    const nameToIdx = new Map<string, number>();

    for (let i = 0; i < N; i++) {
        tasks[i] = tokens[ptr++];
        nameToIdx.set(tasks[i], i);
    }

    const adj: number[][] = new Array(N);
    for (let i = 0; i < N; i++) adj[i] = [];
    const inDegree = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const u = nameToIdx.get(tokens[ptr++])!;
        const v = nameToIdx.get(tokens[ptr++])!;
        adj[u].push(v);
        inDegree[v]++;
    }

    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }

    const result: string[] = [];
    while (heap.size() > 0) {
        const uName = heap.pop()!;
        const u = nameToIdx.get(uName)!;
        result.push(uName);
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                heap.push(tasks[v]);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

main();
