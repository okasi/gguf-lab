import * as fs from "fs";

class MinHeap {
    private heap: number[];
    private less: (a: number, b: number) => boolean;

    constructor(less: (a: number, b: number) => boolean) {
        this.heap = [];
        this.less = less;
    }

    push(val: number): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): number | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.less(this.heap[idx], this.heap[parent])) {
                [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                idx = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(idx: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.less(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }
            if (right < n && this.less(this.heap[right], this.heap[smallest])) {
                smallest = right;
            }
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [N, M] = lines[0].split(" ").map(Number);
const tasks = lines[1].split(" ");

const adj: number[][] = [];
const indegree: number[] = [];
for (let i = 0; i < N; i++) {
    adj.push([]);
    indegree.push(0);
}

const nameToIdx = new Map<string, number>();
for (let i = 0; i < N; i++) {
    nameToIdx.set(tasks[i], i);
}

for (let i = 0; i < M; i++) {
    const [a, b] = lines[2 + i].split(" ");
    const u = nameToIdx.get(a)!;
    const v = nameToIdx.get(b)!;
    adj[u].push(v);
    indegree[v]++;
}

const heap = new MinHeap((a: number, b: number) => tasks[a] < tasks[b]);

for (let i = 0; i < N; i++) {
    if (indegree[i] === 0) {
        heap.push(i);
    }
}

const result: string[] = [];
while (!heap.isEmpty()) {
    const u = heap.pop()!;
    result.push(tasks[u]);
    for (const v of adj[u]) {
        indegree[v]--;
        if (indegree[v] === 0) {
            heap.push(v);
        }
    }
}

if (result.length < N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(result.join(" "));
}
