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
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    private siftUp(i: number): void {
        while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private siftDown(i: number): void {
        const n = this.heap.length;
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
            this.siftDown(smallest);
        }
    }

    insert(val: string): void {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }

    extractMin(): string | null {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [N, M] = lines[0].split(' ').map(Number);
    const tasks = lines[1].split(' ');

    const adj: Map<string, string[]> = new Map();
    const indegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        indegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const [a, b] = lines[2 + i].split(' ');
        adj.get(a)!.push(b);
        indegree.set(b, indegree.get(b)! + 1);
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (indegree.get(task) === 0) {
            heap.insert(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.extractMin()!;
        result.push(task);
        for (const neighbor of adj.get(task)!) {
            indegree.set(neighbor, indegree.get(neighbor)! - 1);
            if (indegree.get(neighbor) === 0) {
                heap.insert(neighbor);
            }
        }
    }

    if (result.length !== N) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

main();
