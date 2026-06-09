import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    push(item: string): void {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.isEmpty()) return undefined;
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

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.heap[parentIndex] <= this.heap[index]) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private siftDown(index: number): void {
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
            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);
if (input.length === 0) {
    console.log("");
    process.exit(0);
}

let idx = 0;
const N = parseInt(input[idx++]);
const M = parseInt(input[idx++]);

const tasks: string[] = [];
for (let i = 0; i < N; i++) {
    tasks.push(input[idx++]);
}

const adj: Map<string, string[]> = new Map();
const inDegree: Map<string, number> = new Map();

for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const A = input[idx++];
    const B = input[idx++];
    if (!adj.has(A)) adj.set(A, []);
    if (!adj.has(B)) adj.set(B, []);
    adj.get(A)!.push(B);
    inDegree.set(B, inDegree.get(B)! + 1);
}

const heap = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        heap.push(task);
    }
}

const result: string[] = [];
while (!heap.isEmpty()) {
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
    console.log(result.join(" "));
} else {
    console.log("IMPOSSIBLE");
}
