import * as fs from "fs";

class MinHeap {
    private data: string[] = [];

    private parent(i: number): number {
        return (i - 1) >> 1;
    }
    private left(i: number): number {
        return 2 * i + 1;
    }
    private right(i: number): number {
        return 2 * i + 2;
    }
    private swap(i: number, j: number): void {
        const tmp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = tmp;
    }
    private bubbleUp(i: number): void {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p] <= this.data[i]) break;
            this.swap(p, i);
            i = p;
        }
    }
    private sinkDown(i: number): void {
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

    push(val: string): void {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.length - 1;
        this.data[0] = this.data[last];
        this.data.pop();
        if (this.data.length > 0) {
            this.sinkDown(0);
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
    const [N, M] = lines[0].split(" ").map(Number);
    const tasks = lines[1].split(" ");

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }

    const seen = new Set<string>();
    for (let i = 0; i < M; i++) {
        const [A, B] = lines[2 + i].split(" ");
        const key = A + "->" + B;
        if (!seen.has(key)) {
            seen.add(key);
            adj.get(A)!.push(B);
            inDegree.set(B, (inDegree.get(B) ?? 0) + 1);
        }
    }

    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            heap.push(t);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const cur = heap.pop()!;
        result.push(cur);
        for (const nb of adj.get(cur)!) {
            inDegree.set(nb, inDegree.get(nb)! - 1);
            if (inDegree.get(nb) === 0) {
                heap.push(nb);
            }
        }
    }

    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

main();
