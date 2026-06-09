import * as fs from "fs";

class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    peek(): T | undefined {
        return this.heap[0];
    }

    push(item: T): void {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this.siftDown(0);
        }
        return top;
    }

    private siftUp(idx: number): void {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    private siftDown(idx: number): void {
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;

            if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
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

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    const [N, M] = input[0].trim().split(" ").filter(Boolean).map(Number);
    const tasks = input[1].trim().split(" ").filter(Boolean);

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const parts = input[i + 2].trim().split(" ").filter(Boolean);
        const A = parts[0];
        const B = parts[1];
        adj.get(A)!.push(B);
        inDegree.set(B, inDegree.get(B)! + 1);
    }

    const pq = new MinHeap<string>((a, b) => a.localeCompare(b));

    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (!pq.isEmpty()) {
        const u = pq.pop()!;
        result.push(u);
        for (const v of adj.get(u)!) {
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v) === 0) {
                pq.push(v);
            }
        }
    }

    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

solve();
