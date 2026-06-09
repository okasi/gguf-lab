import * as fs from "fs";

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

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

    get size(): number {
        return this.heap.length;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
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
            [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
            idx = smallest;
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [N, M] = lines[0].split(" ").map(Number);
const tasks = lines[1].split(" ");

const adj: Map<string, string[]> = new Map();
const inDegree: Map<string, number> = new Map();

for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const [a, b] = lines[2 + i].split(" ");
    adj.get(a)!.push(b);
    inDegree.set(b, (inDegree.get(b) || 0) + 1);
}

const heap = new MinHeap();
for (const [task, deg] of inDegree.entries()) {
    if (deg === 0) heap.push(task);
}

const result: string[] = [];
while (heap.size > 0) {
    const task = heap.pop()!;
    result.push(task);
    for (const neighbor of adj.get(task)!) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor)! === 0) {
            heap.push(neighbor);
        }
    }
}

if (result.length === N) {
    console.log(result.join(" "));
} else {
    console.log("IMPOSSIBLE");
}
