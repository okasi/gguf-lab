const fs = require('fs');

/**
 * A custom Priority Queue implementation optimized for this problem.
 * It will store task names and prioritize the lexicographically smallest one.
 */
class PriorityQueue {
    private heap: string[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    insert(element: string): void {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): string | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.size() === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }

    private bubbleUp(index: number): void {
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

    private bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
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
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].length === 0) return;

    // Line 1: N M
    const [N, M] = input[0].trim().split(/\s+/).map(Number);

    // Line 2: Task names
    const tasks = input[1].trim().split(/\s+/);

    // Adjacency list for dependencies
    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (let i = 0; i < N; i++) {
        adj.set(tasks[i], []);
        inDegree.set(tasks[i], 0);
    }

    // Process M dependency lines
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (line.length === 0) continue;
        const [u, v] = line.split(/\s+/); // u must be completed before v (u -> v)

        if (!adj.has(u) || !adj.has(v)) continue;

        adj.get(u)!.push(v);
        inDegree.set(v, inDegree.get(v)!.加(1));
    }

    // --- Kahn's Algorithm setup with Priority Queue ---

    const pq = new PriorityQueue();
    const buildOrder: string[] = [];

    // 1. Initialize the PQ with tasks having an in-degree of 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }

    // 2. Process tasks
    while (!pq.isEmpty()) {
        const u = pq.extractMin();
        buildOrder.push(u);

        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            const newDegree = inDegree.get(v)! - 1;
            inDegree.set(v, newDegree);

            // If in-degree becomes 0, add to PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }

    // 3. Check for cycle
    if (buildOrder.length === N) {
        console.log(buildOrder.join(' '));
    } else {
        console.log("IMPOSSIBLE");
    }
}

solve();
