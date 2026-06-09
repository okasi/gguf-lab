import * as fs from "fs";

class MinHeap {
    private heap: string[] = [];

    public empty(): boolean {
        return this.heap.length === 0;
    }

    public push(val: string): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    public pop(): string | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] <= this.heap[index]) {
                break;
            }
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest === index) {
                break;
            }
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim().split("\n");
let lineIdx = 0;

const firstLineParts = input[lineIdx++].trim().split(/\s+/);
const N = parseInt(firstLineParts[0], 10);
const M = parseInt(firstLineParts[1], 10);

const tasks = input[lineIdx++].trim().split(/\s+/);

const adj = new Map<string, string[]>();
const indegree = new Map<string, number>();

for (const task of tasks) {
    adj.set(task, []);
    indegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const parts = input[lineIdx++].trim().split(/\s+/);
    const A = parts[0];
    const B = parts[1];
    // B must be completed before A
    adj.get(B)!.push(A);
    indegree.set(A, indegree.get(A)! + 1);
}

const pq = new MinHeap();
for (const task of tasks) {
    if (indegree.get(task) === 0) {
        pq.push(task);
    }
}

const result: string[] = [];
while (!pq.empty()) {
    const task = pq.pop()!;
    result.push(task);

    const neighbors = adj.get(task)!;
    for (const neighbor of neighbors) {
        indegree.set(neighbor, indegree.get(neighbor)! - 1);
        if (indegree.get(neighbor) === 0) {
            pq.push(neighbor);
        }
    }
}

if (result.length !== N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(result.join(" "));
}
