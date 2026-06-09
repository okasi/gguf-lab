import * as fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    private swap(i: number, j: number): void {
        const t = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = t;
    }

    push(val: string): void {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }

    pop(): string | null {
        if (this.data.length === 0) return null;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    peek(): string | null {
        return this.data.length === 0 ? null : this.data[0];
    }

    size(): number {
        return this.data.length;
    }

    private siftUp(i: number): void {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p] > this.data[i]) {
                this.swap(i, p);
                i = p;
            } else break;
        }
    }

    private siftDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.data[l] < this.data[smallest]) smallest = l;
            if (r < n && this.data[r] < this.data[smallest]) smallest = r;
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else break;
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [N, M] = lines[0].split(/\s+/).map(Number);
    const tasks = lines[1].split(/\s+/).map(s => s.trim());

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }

    for (let i = 0; i < M; i++) {
        const [A, B] = lines[2 + i].split(/\s+/);
        adj.get(A)!.push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            heap.push(t);
        }
    }

    const result: string[] = [];
    while (true) {
        const task = heap.pop();
        if (task === null) break;
        result.push(task);
        for (const neighbor of adj.get(task)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length < N) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

main();
