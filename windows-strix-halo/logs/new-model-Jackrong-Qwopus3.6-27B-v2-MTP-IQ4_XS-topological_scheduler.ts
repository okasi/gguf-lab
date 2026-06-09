import * as fs from 'fs';

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

    private parent(i: number): number {
        return (i - 1) >> 1;
    }

    private left(i: number): number {
        return (i << 1) + 1;
    }

    private right(i: number): number {
        return (i << 1) + 2;
    }

    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    push(value: string) {
        this.heap.push(value);
        let i = this.heap.length - 1;
        while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const root = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last!;
            this.bubbleDown(0);
        }
        return root;
    }

    private bubbleDown(i: number) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);

            if (l < n && this.heap[l] < this.heap[smallest]) {
                smallest = l;
            }
            if (r < n && this.heap[r] < this.heap[smallest]) {
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

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const [N, M] = lines[0].split(/\s+/).map(Number);
    const tasks = lines[1].split(/\s+/);

    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    for (const task of tasks) {
        adj[task] = [];
        inDegree[task] = 0;
    }

    for (let i = 2; i < 2 + M; i++) {
        const [A, B] = lines[i].split(/\s+/);
        adj[A].push(B);
        inDegree[B] = (inDegree[B] || 0) + 1;
    }

    const pq = new MinHeap();
    for (const task of tasks) {
        if (inDegree[task] === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (!pq.isEmpty()) {
        const u = pq.pop()!;
        result.push(u);
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                pq.push(v);
            }
        }
    }

    if (result.length === N) {
        console.log(result.join(' '));
    } else {
        console.log('IMPOSSIBLE');
    }
}

main();
