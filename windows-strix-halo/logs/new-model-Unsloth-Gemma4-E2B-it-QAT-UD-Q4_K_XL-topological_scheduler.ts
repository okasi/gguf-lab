const fs = require('fs');

/**
 * A custom Binary Heap implementation for the priority queue.
 * This heap will store tasks that are ready to be processed,
 * prioritized by the lexicographically smallest name.
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    // Insertion: O(log N)
    enqueue(taskName: string): void {
        this.heap.push(taskName);
        this._bubbleUp(this.heap.length - 1);
    }

    // Extraction: O(log N)
    dequeue(): string | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this._bubbleDown(0);
        return min;
    }

    // Helper methods
    _getParentIndex(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    _getLeftChildIndex(i: number): number {
        return 2 * i + 1;
    }

    _getRightChildIndex(i: number): number {
        return 2 * i + 2;
    }

    _swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    _bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = this._getParentIndex(index);
            // Lexicographical comparison: smaller string is higher priority (smaller value)
            if (this.heap[index] < this.heap[parentIndex]) {
                this._swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    _bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let smallest = index;
            const left = this._getLeftChildIndex(index);
            const right = this._getRightChildIndex(index);

            // Check left child
            if (left <= lastIndex && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }

            // Check right child
            if (right <= lastIndex && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest !== index) {
                this._swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve() {
    // Read all input data from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === "") {
        console.log("");
        return;
    }

    // Line 1: N M
    const [N, M] = input[0].trim().split(/\s+/).map(Number);

    // Line 2: N distinct task names
    const taskNames = input[1].trim().split(/\s+/);
    
    // Adjacency list for dependencies (Graph: A -> B means A must come before B)
    // We use a structure where adj[A] lists all tasks that depend on A.
    // And in-degree tracks how many prerequisites each task has.
    const adj: Map<string, Set<string>> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of taskNames) {
        adj.set(task, new Set());
        inDegree.set(task, 0);
    }

    // Process M dependency lines
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (line === "") continue;
        const [u, v] = line.split(/\s+/); // u must be completed before v (u -> v)
        
        if (taskNames.includes(u) && taskNames.includes(v)) {
            adj.get(u)!.add(v);
            inDegree.set(v, inDegree.get(v)! + 1);
        }
    }

    // 1. Initialization: Add tasks with in-degree 0 to the priority queue
    const pq = new PriorityQueue();
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.enqueue(task);
        }
    }

    const buildOrder: string[] = [];

    // 2. Topological Sort using Kahn's Algorithm with Priority Queue
    while (!pq.isEmpty()) {
        const u = pq.dequeue();
        buildOrder.push(u);

        // Decrement in-degree of all neighbors v
        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                const newDegree = inDegree.get(v)! - 1;
                inDegree.set(v, newDegree);

                // If in-degree becomes 0, the task is ready
                if (newDegree === 0) {
                    pq.enqueue(v);
                }
            }
        }
    }

    // 3. Check for cycles
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(' '));
    }
}

solve();
