import * as fs from "fs";

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    private swap(i: number, j: number) {
        const t = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = t;
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

    private siftUp(i: number) {
        while (i > 0 && this.data[i] < this.data[this.parent(i)]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private siftDown(i: number) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest]) smallest = l;
            if (r < n && this.data[r] < this.data[smallest]) smallest = r;
            if (smallest === i) break;
            this.swap(i, smallest);
            i = smallest;
        }
    }

    push(val: string) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }

    pop(): string {
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [N, M] = lines[0].split(" ").map(Number);
    const tasks = lines[1].split(" ");

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }

    for (let i = 2; i < 2 + M; i++) {
        const parts = lines[i].split(" ");
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
        const u = heap.pop();
        result.push(u);
        for (const v of adj.get(u)!) {
            const nd = inDegree.get(v)! - 1;
            inDegree.set(v, nd);
            if (nd === 0) {
                heap.push(v);
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
