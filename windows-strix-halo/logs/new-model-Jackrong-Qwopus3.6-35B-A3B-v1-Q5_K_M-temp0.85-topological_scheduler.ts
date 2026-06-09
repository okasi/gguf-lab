import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.heap = [];
        this.compare = compare;
    }

    public size(): number {
        return this.heap.length;
    }

    public push(val: T): void {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }

    public pop(): T {
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last!;
            this.siftDown(0);
        }
        return min;
    }

    private siftUp(i: number): void {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.compare(this.heap[i], this.heap[parent]) < 0) {
                [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
                i = parent;
            } else {
                break;
            }
        }
    }

    private siftDown(i: number): void {
        while (i < this.heap.length) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;

            if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }

            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            } else {
                break;
            }
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        return;
    }

    const tokens = input.split(/\s+/);
    let idx = 0;
    const N = parseInt(tokens[idx++], 10);
    const M = parseInt(tokens[idx++], 10);

    const taskNames: string[] = [];
    const nameToId = new Map<string, number>();

    for (let i = 0; i < N; i++) {
        const name = tokens[idx++];
        taskNames.push(name);
        nameToId.set(name, i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const a = tokens[idx++];
        const b = tokens[idx++];
        const u = nameToId.get(a);
        const v = nameToId.get(b);
        if (u !== undefined && v !== undefined) {
            adj[u].push(v);
            inDegree[v]++;
        }
    }

    const pq = new MinHeap<string>((a, b) => a.localeCompare(b));
    const result: string[] = [];

    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(taskNames[i]);
        }
    }

    while (pq.size() > 0) {
        const u = pq.pop();
        result.push(u);
        const uId = nameToId.get(u)!;
        for (const vId of adj[uId]) {
            inDegree[vId]--;
            if (inDegree[vId] === 0) {
                pq.push(taskNames[vId]);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

main();
