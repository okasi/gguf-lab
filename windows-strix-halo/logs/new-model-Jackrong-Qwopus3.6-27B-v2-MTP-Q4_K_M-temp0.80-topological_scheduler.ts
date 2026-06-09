import * as fs from 'fs';

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
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

    push(val: string): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    private bubbleUp(i: number): void {
        while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const min = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }

    private sinkDown(i: number): void {
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

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const N = Number(firstLine[0]);
const M = Number(firstLine[1]);

const tasks = lines[1].split(' ');
const adj = new Map<string, string[]>();
const inDegree = new Map<string, number>();

for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}

for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].split(' ');
    const A = parts[0];
    const B = parts[1];
    adj.get(A)!.push(B);
    inDegree.set(B, inDegree.get(B)! + 1);
}

const heap = new MinHeap();
for (const t of tasks) {
    if (inDegree.get(t)! === 0) {
        heap.push(t);
    }
}

const result: string[] = [];
while (!heap.isEmpty()) {
    const task = heap.pop()!;
    result.push(task);
    for (const neighbor of adj.get(task)!) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor)! === 0) {
            heap.push(neighbor);
        }
    }
}

if (result.length < N) {
    console.log('IMPOSSIBLE');
} else {
    console.log(result.join(' '));
}
