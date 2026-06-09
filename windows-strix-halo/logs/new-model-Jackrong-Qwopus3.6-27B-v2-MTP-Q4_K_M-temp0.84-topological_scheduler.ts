import * as fs from "fs";

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }

    private heapifyUp(i: number): void {
        while (i > 0 && this.data[i] < this.data[this.parent(i)]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private heapifyDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest]) {
                smallest = l;
            }
            if (r < n && this.data[r] < this.data[smallest]) {
                smallest = r;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }

    push(val: string): void {
        this.data.push(val);
        this.heapifyUp(this.data.length - 1);
    }

    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        this.data[0] = this.data[this.data.length - 1];
        this.data.pop();
        if (this.data.length > 0) {
            this.heapifyDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const tasks = lines[1].split(/\s+/);

    const nameToIdx = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        nameToIdx.set(tasks[i], i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const indegree: number[] = new Array(N).fill(0);

    for (let i = 2; i < 2 + M; i++) {
        const parts = lines[i].split(/\s+/);
        const a = parts[0];
        const b = parts[1];
        const u = nameToIdx.get(a)!;
        const v = nameToIdx.get(b)!;
        adj[u].push(v);
        indegree[v]++;
    }

    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (indegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.pop()!;
        result.push(task);
        const idx = nameToIdx.get(task)!;
        for (const neighbor of adj[idx]) {
            indegree[neighbor]--;
            if (indegree[neighbor] === 0) {
                heap.push(tasks[neighbor]);
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
