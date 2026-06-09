import * as fs from 'fs';

class MinHeap {
    private heap: number[];
    private names: string[];

    constructor(names: string[]) {
        this.heap = [];
        this.names = names;
    }

    push(id: number): void {
        this.heap.push(id);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): number {
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    get size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.compare(parentIndex, index)) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;

            if (leftIndex <= lastIndex && this.compare(leftIndex, smallest)) {
                smallest = leftIndex;
            }
            if (rightIndex <= lastIndex && this.compare(rightIndex, smallest)) {
                smallest = rightIndex;
            }

            if (smallest === index) {
                break;
            }
            this.swap(index, smallest);
            index = smallest;
        }
    }

    private compare(i: number, j: number): boolean {
        return this.names[this.heap[i]] < this.names[this.heap[j]];
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}

const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split('\n');
const firstLine = lines[0].trim().split(' ');
const N = parseInt(firstLine[0]);
const M = parseInt(firstLine[1]);

const taskNames = lines[1].trim().split(' ');
const nameToId = new Map<string, number>();
for (let i = 0; i < N; i++) {
    nameToId.set(taskNames[i], i);
}

const adj: number[][] = Array.from({ length: N }, () => []);
const inDegree: number[] = new Array(N).fill(0);

for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].trim().split(' ');
    const a = nameToId.get(parts[0]);
    const b = nameToId.get(parts[1]);
    adj[a].push(b);
    inDegree[b]++;
}

const heap = new MinHeap(taskNames);
const result: string[] = [];

for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
        heap.push(i);
    }
}

while (heap.size > 0) {
    const id = heap.pop();
    result.push(taskNames[id]);

    for (const neighbor of adj[id]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
            heap.push(neighbor);
        }
    }
}

if (result.length === N) {
    console.log(result.join(' '));
} else {
    console.log('IMPOSSIBLE');
}
