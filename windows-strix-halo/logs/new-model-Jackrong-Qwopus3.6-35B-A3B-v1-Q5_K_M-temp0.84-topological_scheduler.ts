import * as fs from "fs";

class MinHeap {
    private heap: string[] = [];

    private compare(a: string, b: string): number {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    push(item: string): void {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }

    pop(): string {
        const root = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return root;
    }

    peek(): string {
        return this.heap[0];
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[parent], this.heap[index]) <= 0) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }

    private siftDown(index: number): void {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === index) break;
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split('\n');
    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0]);
    const M = parseInt(firstLine[1]);

    const taskNames = lines[1].trim().split(/\s+/);
    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const edge = lines[i + 2].trim().split(/\s+/);
        const a = edge[0];
        const b = edge[1];
        if (adj.has(b)) {
            adj.get(b)!.push(a);
            inDegree.set(b, inDegree.get(b)! + 1);
        }
    }

    const pq = new MinHeap();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (!pq.isEmpty()) {
        const u = pq.pop();
        result.push(u);
        for (const v of adj.get(u)!) {
            const deg = inDegree.get(v)!;
            inDegree.set(v, deg - 1);
            if (deg - 1 === 0) {
                pq.push(v);
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
