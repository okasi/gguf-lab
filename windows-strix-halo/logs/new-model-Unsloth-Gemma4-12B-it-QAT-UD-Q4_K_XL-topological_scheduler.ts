import * as fs from 'fs';

/**
 * Min-Heap implementation to satisfy the lexicographical smallest 
 * requirement in O(log N) time for insertions and extractions.
 */
class MinHeap {
    private heap: string[] = [];

    push(val: string) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.size() === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.size() > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number) {
        while (index > 0) {
            let parent = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parent]) {
                [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
                index = parent;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number) {
        while (true) {
            let smallest = index;
            let left = 2 * index + 1;
            let right = 2 * index + 2;

            if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length === 0 || input[0] === "") return;

    let ptr = 0;
    const N = parseInt(input[ptr++]);
    const M = parseInt(input[ptr++]);

    if (isNaN(N)) return;

    const tasks = new Set<string>();
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (let i = 0; i < N; i++) {
        const name = input[ptr++];
        tasks.add(name);
        adj.set(name, []);
        inDegree.set(name, 0);
    }

    for (let i = 0; i < M; i++) {
        const u = input[ptr++];
        const v = input[ptr++];
        adj.get(u)!.push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }

    const pq = new MinHeap();
    for (const task of tasks) {
        if ((inDegree.get(task) || 0) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (pq.size() > 0) {
        const u = pq.pop()!;
        result.push(u);

        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v) === 0) {
                pq.push(v);
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
