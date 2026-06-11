import * as fs from 'fs';

class MinHeap<T> {
    private data: T[] = [];
    private cmp: (a: T, b: T) => number;

    constructor(cmp: (a: T, b: T) => number) {
        this.cmp = cmp;
    }

    push(val: T): void {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): T | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    size(): number {
        return this.data.length;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.cmp(this.data[idx], this.data[parent]) >= 0) break;
            [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
            idx = parent;
        }
    }

    private bubbleDown(idx: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;

            if (left < n && this.cmp(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this.cmp(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === idx) break;
            [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
            idx = smallest;
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split('\n');
    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const taskNames = lines[1].trim().split(/\s+/);
    const nameToIdx = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        nameToIdx.set(taskNames[i], i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const line = lines[2 + i].trim().split(/\s+/);
        const u = nameToIdx.get(line[0])!;
        const v = nameToIdx.get(line[1])!;
        adj[u].push(v);
        inDegree[v]++;
    }

    const heap = new MinHeap<string>((a, b) => a.localeCompare(b));

    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(taskNames[i]);
        }
    }

    const result: string[] = [];

    while (!heap.isEmpty()) {
        const task = heap.pop()!;
        result.push(task);
        const idx = nameToIdx.get(task)!;
        for (const neighbor of adj[idx]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                heap.push(taskNames[neighbor]);
            }
        }
    }

    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

solve();
