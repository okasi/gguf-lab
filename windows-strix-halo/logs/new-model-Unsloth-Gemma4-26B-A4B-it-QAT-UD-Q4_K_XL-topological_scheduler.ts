import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[] = [];
    constructor(private comparator: (a: T, b: T) => number) {}

    push(val: T): void {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.size() === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.size() > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.comparator(this.heap[index], this.heap[parent]) < 0) {
                [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
                index = parent;
            } else break;
        }
    }

    private siftDown(index: number): void {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < this.heap.length && this.comparator(this.heap[left], this.heap[smallest]) < 0) smallest = left;
            if (right < this.heap.length && this.comparator(this.heap[right], this.heap[smallest]) < 0) smallest = right;
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else break;
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    let currentLine = 0;

    const firstLine = lines[currentLine++].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    const N = parseInt(firstLine[0]);
    const M = parseInt(firstLine[1]);

    const tasksLine = lines[currentLine++].trim().split(/\s+/);
    const taskNames = tasksLine.slice(0, N);

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const edge = lines[currentLine++].trim().split(/\s+/);
        if (edge.length < 2) continue;
        const u = edge[0];
        const v = edge[1];
        adj.get(u)!.push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }

    const pq = new MinHeap<string>((a, b) => a < b ? -1 : (a > b ? 1 : 0));
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (pq.size() > 0) {
        const u = pq.pop()!;
        result.push(u);

        for (const v of adj.get(u)!) {
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v) === 0) {
                pq.push(v);
            }
        }
    }

    if (result.length === N) {
        console.log(result.join(' '));
    } else {
        console.log("IMPOSSIBLE");
    }
}

solve();
