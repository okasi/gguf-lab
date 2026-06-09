import * as fs from "fs";

class MinHeap {
    private data: string[];
    private size: number;

    constructor() {
        this.data = [];
        this.size = 0;
    }

    isEmpty(): boolean {
        return this.size === 0;
    }

    push(item: string): void {
        this.data[this.size] = item;
        this.size++;
        this.siftUp(this.size - 1);
    }

    pop(): string | undefined {
        if (this.isEmpty()) return undefined;
        const top = this.data[0];
        this.data[0] = this.data[this.size - 1];
        this.size--;
        this.siftDown(0);
        return top;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.data[parentIndex] <= this.data[index]) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private siftDown(index: number): void {
        while (true) {
            let smallest = index;
            const left = (index << 1) + 1;
            const right = (index << 1) + 2;

            if (left < this.size && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < this.size && this.data[right] < this.data[smallest]) {
                smallest = right;
            }

            if (smallest === index) break;
            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    let ptr = 0;

    if (ptr >= tokens.length) return;
    const N = parseInt(tokens[ptr++], 10);
    const M = parseInt(tokens[ptr++], 10);

    const tasks: string[] = [];
    for (let i = 0; i < N; i++) {
        tasks.push(tokens[ptr++]);
    }

    const adj = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    for (const t of tasks) {
        adj.set(t, new Set());
        inDegree.set(t, 0);
    }

    for (let i = 0; i < M; i++) {
        const u = tokens[ptr++];
        const v = tokens[ptr++];
        adj.get(u)!.add(v);
        inDegree.set(v, inDegree.get(v)! + 1);
    }

    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            heap.push(t);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const u = heap.pop()!;
        result.push(u);

        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                inDegree.set(v, inDegree.get(v)! - 1);
                if (inDegree.get(v) === 0) {
                    heap.push(v);
                }
            }
        }
    }

    if (result.length !== tasks.length) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

main();
