import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];
    private size: number = 0;

    private compare(a: string, b: string): number {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        while (index < this.size) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < this.size && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild < this.size && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }

    push(val: string): void {
        this.heap[this.size] = val;
        this.size++;
        this.bubbleUp(this.size - 1);
    }

    pop(): string | undefined {
        if (this.size === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap[this.size - 1];
        this.size--;
        this.heap[this.size] = last;
        this.bubbleDown(0);
        return top;
    }

    isEmpty(): boolean {
        return this.size === 0;
    }
}

const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split('\n');
if (lines.length === 0) {
    console.log("");
    process.exit(0);
}

const firstLine = lines[0].trim().split(/\s+/);
const N = parseInt(firstLine[0], 10);
const M = parseInt(firstLine[1], 10);

const secondLine = lines[1].trim().split(/\s+/);
const tasks = secondLine.slice(0, N);

const adj = new Map<string, Set<string>>();
const inDegree = new Map<string, number>();

for (const task of tasks) {
    adj.set(task, new Set());
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].trim().split(/\s+/);
    const from = parts[0];
    const to = parts[1];
    if (adj.has(from) && adj.has(to)) {
        adj.get(from)!.add(to);
        inDegree.set(to, inDegree.get(to)! + 1);
    }
}

const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task)! === 0) {
        pq.push(task);
    }
}

const result: string[] = [];
while (!pq.isEmpty()) {
    const curr = pq.pop()!;
    result.push(curr);
    for (const next of adj.get(curr)!) {
        inDegree.set(next, inDegree.get(next)! - 1);
        if (inDegree.get(next)! === 0) {
            pq.push(next);
        }
    }
}

if (result.length < N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(result.join(' '));
}
