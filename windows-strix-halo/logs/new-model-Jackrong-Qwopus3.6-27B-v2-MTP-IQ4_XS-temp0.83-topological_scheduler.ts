import * as fs from 'fs';

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

    push(value: string): void {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const root = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end!;
            this.bubbleDown(0);
        }
        return root;
    }

    get size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.heap[parentIndex] <= this.heap[index]) break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
        const length = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest === index) break;
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const tokens = input.split(/\s+/);
let idx = 0;

const N = parseInt(tokens[idx++], 10);
const M = parseInt(tokens[idx++], 10);

const tasks: string[] = [];
for (let i = 0; i < N; i++) {
    tasks.push(tokens[idx++]);
}

const adj: Map<string, string[]> = new Map();
const inDegree: Map<string, number> = new Map();

for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const A = tokens[idx++];
    const B = tokens[idx++];
    adj.get(A)!.push(B);
    inDegree.set(B, (inDegree.get(B) || 0) + 1);
}

const heap = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        heap.push(task);
    }
}

const result: string[] = [];
while (heap.size > 0) {
    const current = heap.pop()!;
    result.push(current);
    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
            heap.push(neighbor);
        }
    }
}

if (result.length === N) {
    console.log(result.join(' '));
} else {
    console.log('IMPOSSIBLE');
}
