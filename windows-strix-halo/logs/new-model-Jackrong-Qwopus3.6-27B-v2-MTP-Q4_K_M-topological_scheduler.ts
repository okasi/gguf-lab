import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    push(val: string) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return root;
    }

    private bubbleUp(i: number) {
        while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
            const p = this.parent(i);
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }

    private bubbleDown(i: number) {
        const size = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);

            if (l < size && this.heap[l] < this.heap[smallest]) smallest = l;
            if (r < size && this.heap[r] < this.heap[smallest]) smallest = r;

            if (smallest === i) break;
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;

    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(/\s+/).map(Number);
    const tasks = lines[1].trim().split(/\s+/);

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < 2 + M; i++) {
        const [u, v] = lines[i].trim().split(/\s+/);
        adj.get(u)!.push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const [task, deg] of inDegree) {
        if (deg === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const u = heap.pop()!;
        result.push(u);

        for (const v of adj.get(u)!) {
            const newDeg = inDegree.get(v)! - 1;
            inDegree.set(v, newDeg);
            if (newDeg === 0) {
                heap.push(v);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

main();
