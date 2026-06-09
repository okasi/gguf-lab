const fs = require('fs');

/**
 * A custom Priority Queue implementation optimized for this problem.
 * It prioritizes lexicographically smaller task names among those with an in-degree of 0.
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    enqueue(taskName: string): void {
        this.heap.push(taskName);
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue(): string | undefined {
        if (this.size() === 0) {
            return undefined;
        }
        if (this.size() === 1) {
            return this.heap.pop();
        }

        const top = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return top;
    }

    bubbleUp(index: number): void {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIndex]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    bubbleDown(index: number): void {
        const lastIndex = this.size() - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex] < this.heap[smallest]) {
                smallest = leftChildIndex;
            }

            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex] < this.heap[smallest]) {
                smallest = rightChildIndex;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].length === 0) return;

    const [N, M] = input[0].split(' ').map(Number);
    const tasks = input[1].trim().split(/\s+/).filter(t => t.length > 0);
    const N_tasks = tasks.length;

    if (N_tasks === 0) return;

    const adj = Array(N_tasks).fill(0).map(() => []);
    const inDegree = Array(N_tasks).fill(0);

    for (let i = 0; i < M; i++) {
        const line = input[2 + i];
        if (!line) continue;
        const [u, v] = line.trim().split(/\s+/);
        if (u && v) {
            const uIdx = parseInt(u);
            const vIdx = parseInt(v);
            adj[uIdx].push(vIdx);
            inDegree[vIdx]++;
        }
    }

    // 1. Initialize Priority Queue with tasks having in-degree 0
    const pq = new PriorityQueue();
    for (let i = 0; i < N_tasks; i++) {
        if (inDegree[i] === 0) {
            pq.enqueue(tasks[i]);
        }
    }

    const buildOrder: string[] = [];
    let processedCount = 0;

    // 2. Process using Kahn's Algorithm with PQ
    while (pq.size() > 0) {
        const uTask = pq.dequeue()!;
        buildOrder.push(uTask);
        processedCount++;

        // Process neighbors
        for (const vIdx of adj[tasks.indexOf(uTask)]) {
            inDegree[vIdx]--;
            if (inDegree[vIdx] === 0) {
                pq.enqueue(tasks[vIdx]);
            }
        }
    }

    // 3. Check for cycles
    if (processedCount !== N_tasks) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(' '));
    }
}

solve();
