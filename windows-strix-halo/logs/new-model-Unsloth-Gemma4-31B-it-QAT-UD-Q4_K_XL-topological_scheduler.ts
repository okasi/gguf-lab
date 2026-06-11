import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[] = [];

    constructor(private compare: (a: T, b: T) => number) {}

    push(val: T) {
        this.heap.push(val);
        this.bubbleUp();
    }

    pop(): T | undefined {
        if (this.size() === 0) return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.size() > 0 && bottom !== undefined) {
            this.heap[0] = bottom;
            this.bubbleDown();
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    private bubbleDown() {
        let index = 0;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let smallest = index;

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

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    let ptr = 0;

    if (ptr >= input.length) return;
    const N = parseInt(input[ptr++]);
    const M = parseInt(input[ptr++]);

    if (isNaN(N)) return;

    const tasks: string[] = [];
    const inDegree: Map<string, number> = new Map();
    const adj: Map<string, string[]> = new Map();

    for (let i = 0; i < N; i++) {
        const task = input[ptr++];
        tasks.push(task);
        inDegree.set(task, 0);
        adj.set(task, []);
    }

    for (let i = 0; i < M; i++) {
        const u = input[ptr++];
        const v = input[ptr++];
        adj.get(u)?.push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }

    const pq = new MinHeap<string>((a, b) => a.localeCompare(b));
    
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (pq.size() > 0) {
        const curr = pq.pop()!;
        result.push(curr);

        const neighbors = adj.get(curr) || [];
        for (const next of neighbors) {
            inDegree.set(next, inDegree.get(next)! - 1);
            if (inDegree.get(next) === 0) {
                pq.push(next);
            }
        }
    }

    if (result.length === N) {
        process.stdout.write(result.join(" ") + "\n");
    } else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}

solve();
