import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private parent(i: number): number { return (i - 1) >> 1; }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }

    private siftUp(i: number) {
        while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private siftDown(i: number) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
            if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
            if (smallest === i) break;
            this.swap(i, smallest);
            i = smallest;
        }
    }

    push(val: string) {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }

    pop(): string {
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split(/\r?\n/);

    const [N, M] = lines[0].split(/\s+/).map(Number);
    const tasks = lines[1].split(/\s+/);

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }

    for (let i = 0; i < M; i++) {
        const [a, b] = lines[2 + i].split(/\s+/);
        adj.get(a)!.push(b);
        inDegree.set(b, (inDegree.get(b) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            heap.push(t);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const current = heap.pop();
        result.push(current);
        const neighbors = adj.get(current) || [];
        for (const nb of neighbors) {
            inDegree.set(nb, inDegree.get(nb)! - 1);
            if (inDegree.get(nb) === 0) {
                heap.push(nb);
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
