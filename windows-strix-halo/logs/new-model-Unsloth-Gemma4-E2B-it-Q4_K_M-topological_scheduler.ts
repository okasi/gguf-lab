const fs = require('fs');

/**
 * Custom Min-Heap implementation for strings (lexicographical order).
 * This heap is used to prioritize tasks based on the requirement:
 * When multiple tasks are available, choose the lexicographically smallest task name.
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    // Compares two strings lexicographically
    compare(a, b) {
        return a.localeCompare(b);
    }

    // Helper to maintain the heap property (bubble up)
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    // Helper to maintain the heap property (bubble down)
    bubbleDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            if (leftChild <= lastIndex && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }

    insert(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length < 2) {
        console.log("IMPOSSIBLE");
        return;
    }

    // 1. Parse N and M
    const [N, M] = input[0].split(' ').map(Number);

    if (N === 0) {
        console.log("");
        return;
    }

    // 2. Parse Task Names
    const taskNames = input[1].split(' ');
    
    // Map task name to index (optional, but good practice if names are complex)
    // We will use Map structure for graph representation.

    // Graph initialization
    const adj = new Map(); // Adjacency list: Task -> [Dependent Tasks]
    const inDegree = new Map(); // Task -> Count of prerequisites

    // Initialize graph structures for all N tasks
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    // 3. Parse Dependencies (M lines)
    for (let i = 0; i < M; i++) {
        const line = input[2 + i];
        if (!line) continue;
        
        const [A, B] = line.split(' ');
        
        // A must be completed before B (Edge A -> B)
        if (adj.has(A) && adj.has(B)) {
            adj.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }

    // 4. Initialize Priority Queue (Min-Heap)
    const pq = new MinPriorityQueue();
    
    // Find all tasks with in-degree 0 and add them to the PQ
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }

    const buildOrder = [];

    // 5. Topological Sort
    while (!pq.isEmpty()) {
        const currentTask = pq.extractMin();
        buildOrder.push(currentTask);

        // Process neighbors (tasks dependent on currentTask)
        const dependents = adj.get(currentTask) || [];
        
        for (const dependentTask of dependents) {
            const newDegree = inDegree.get(dependentTask) - 1;
            inDegree.set(dependentTask, newDegree);

            // If dependency count hits zero, the task is ready
            if (newDegree === 0) {
                pq.insert(dependentTask);
            }
        }
    }

    // 6. Cycle Detection
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(' '));
    }
}

solve();
