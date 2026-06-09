import * as fs from "fs";

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const tokens = input.split(/\s+/);
    const it = tokens[Symbol.iterator]();
    const N = parseInt(next(it), 10);
    const M = parseInt(next(it), 10);
    const tasks: string[] = [];
    for (let i = 0; i < N; i++) {
        tasks.push(next(it));
    }
    const adj = new Map<string, string[]>();
    const inDeg = new Map<string, number>();
    for (const t of tasks) {
        inDeg.set(t, 0);
        adj.set(t, []);
    }
    for (let i = 0; i < M; i++) {
        const A = next(it);
        const B = next(it);
        adj.get(A)!.push(B);
        inDeg.set(B, inDeg.get(B)! + 1);
    }
    const heap = new MinHeap<string>((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const t of tasks) {
        if (inDeg.get(t)! === 0) {
            heap.push(t);
        }
    }
    const result: string[] = [];
    while (!heap.isEmpty()) {
        const cur = heap.pop();
        result.push(cur);
        const neighbors = adj.get(cur) || [];
        for (const nb of neighbors) {
            const newDeg = inDeg.get(nb)! - 1;
            inDeg.set(nb, newDeg);
            if (newDeg === 0) {
                heap.push(nb);
            }
        }
    }
    if (result.length === N) {
        console.log(result.join(" "));
    } else {
        console.log("IMPOSSIBLE");
    }
}

function next(it: Iterator<string>): string {
    const value = it.next();
    if (value.done) throw new Error("Unexpected end of input");
    return value.value;
}

class MinHeap<T> {
    private data: T[];
    private compare: (a: T, b: T) => number;
    constructor(compare: (a: T, b: T) => number) {
        this.data = [];
        this.compare = compare;
    }
    push(item: T) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop(): T {
        if (this.data.length === 0) throw new Error("Heap empty");
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    peek(): T {
        if (this.data.length === 0) throw new Error("Heap empty");
        return this.data[0];
    }
    isEmpty(): boolean {
        return this.data.length === 0;
    }
    private siftUp(idx: number) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.compare(this.data[idx], this.data[parent]) < 0) {
                [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
                idx = parent;
            } else {
                break;
            }
        }
    }
    private siftDown(idx: number) {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this.compare(this.data[right], this.data[smallest]) < 0) {
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

main();
