import * as fs from "fs";

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    private swap(i: number, j: number): void {
        const tmp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = tmp;
    }

    private parent(i: number): number {
        return (i - 1) >> 1;
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    private heapifyUp(i: number): void {
        while (i > 0 && this.data[this.parent(i)] > this.data[i]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private heapifyDown(i: number): void {
        const n = this.data.length;
        let min = i;
        const l = this.left(i);
        const r = this.right(i);

        if (l < n && this.data[l] < this.data[min]) min = l;
        if (r < n && this.data[r] < this.data[min]) min = r;

        if (min !== i) {
            this.swap(i, min);
            this.heapifyDown(min);
        }
    }

    push(val: string): void {
        this.data.push(val);
        this.heapifyUp(this.data.length - 1);
    }

    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        if (this.data.length === 1) return this.data.pop()!;
        const top = this.data[0];
        this.data[0] = this.data.pop()!;
        this.heapifyDown(0);
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [N, M] = lines[0].split(" ").map(Number);
const tasks = lines[1].split(" ");

const adj: Map<string, string[]> = new Map();
const inDegree: Map<string, number> = new Map();

for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}

for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].split(" ");
    const a = parts[0];
    const b = parts[1];
    adj.get(a)!.push(b);
    inDegree.set(b, inDegree.get(b)! + 1);
}

const heap = new MinHeap();
for (const t of tasks) {
    if (inDegree.get(t)! === 0) {
        heap.push(t);
    }
}

const result: string[] = [];
while (!heap.isEmpty()) {
    const t = heap.pop()!;
    result.push(t);
    for (const neighbor of adj.get(t)!) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor)! === 0) {
            heap.push(neighbor);
        }
    }
}

if (result.length < N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(result.join(" "));
}
