import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');

const [N, M] = lines[0].split(' ').map(Number);
const tasks = lines.length > 1 ? lines[1].split(' ').filter(s => s !== '') : [];

const adj: Map<string, string[]> = new Map();
const inDegree: Map<string, number> = new Map();

for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}

for (let i = 0; i < M; i++) {
    const idx = 2 + i;
    if (idx < lines.length) {
        const parts = lines[idx].split(' ');
        const u = parts[0];
        const v = parts[1];
        if (adj.has(u) && adj.has(v)) {
            adj.get(u)!.push(v);
            inDegree.set(v, inDegree.get(v)! + 1);
        }
    }
}

class MinHeap {
    private data: string[];
    constructor() {
        this.data = [];
    }
    push(val: string): void {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const root = this.data[0];
        const end = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = end;
            this.bubbleDown(0);
        }
        return root;
    }
    isEmpty(): boolean {
        return this.data.length === 0;
    }
    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.data[idx] < this.data[parent]) {
                [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
                idx = parent;
            } else {
                break;
            }
        }
    }
    private bubbleDown(idx: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < n && this.data[right] < this.data[smallest]) {
                smallest = right;
            }
            if (smallest !== idx) {
                [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

const heap = new MinHeap();
for (const t of tasks) {
    if (inDegree.get(t) === 0) {
        heap.push(t);
    }
}

const result: string[] = [];

while (!heap.isEmpty()) {
    const u = heap.pop()!;
    result.push(u);
    const neighbors = adj.get(u)!;
    for (const v of neighbors) {
        const d = inDegree.get(v)! - 1;
        inDegree.set(v, d);
        if (d === 0) {
            heap.push(v);
        }
    }
}

if (result.length < N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(result.join(' '));
}
