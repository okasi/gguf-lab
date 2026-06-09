import * as fs from "fs";

class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(item: T): void {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    peek(): T | undefined {
        return this.heap[0];
    }

    get size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private leftChild(i: number): number {
        return 2 * i + 1;
    }

    private rightChild(i: number): number {
        return 2 * i + 2;
    }

    private siftUp(i: number): void {
        while (i > 0) {
            const p = this.parent(i);
            if (this.compare(this.heap[p], this.heap[i]) <= 0) break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }

    private siftDown(i: number): void {
        while (this.leftChild(i) < this.heap.length) {
            let smallest = i;
            const l = this.leftChild(i);
            const r = this.rightChild(i);
            if (this.compare(this.heap[l], this.heap[smallest]) < 0) smallest = l;
            if (r < this.heap.length && this.compare(this.heap[r], this.heap[smallest]) < 0) smallest = r;
            if (smallest === i) break;
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
if (!input) {
    console.log("IMPOSSIBLE");
} else {
    const lines = input.split("\n");
    const [N, M] = lines[0].split(" ").map(Number);
    const names = lines[1].split(" ");

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const name of names) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [a, b] = line.split(" ");
        if (!a || !b) continue;
        if (!adj.has(a)) adj.set(a, []);
        if (!adj.has(b)) adj.set(b, []);
        adj.get(a)!.push(b);
        inDegree.set(b, (inDegree.get(b) || 0) + 1);
    }

    const pq = new MinHeap<string>((a, b) => a.localeCompare(b));
    for (const name of names) {
        if (inDegree.get(name)! === 0) {
            pq.push(name);
        }
    }

    const order: string[] = [];
    while (!pq.isEmpty()) {
        const u = pq.pop()!;
        order.push(u);
        const neighbors = adj.get(u)!;
        for (const v of neighbors) {
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v)! === 0) {
                pq.push(v);
            }
        }
    }

    if (order.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(order.join(" "));
    }
}
