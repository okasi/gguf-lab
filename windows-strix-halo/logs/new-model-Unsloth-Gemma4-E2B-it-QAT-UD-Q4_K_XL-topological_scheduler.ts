const fs = require('fs');

/**
 * A custom Binary Heap implementation for the priority queue.
 * This heap will store tasks that are ready to be processed, ordered lexicographically.
 */
class PriorityQueue {
    constructor() {
        // Store tasks as strings. The comparison logic ensures that the lexicographically
        // smallest task name has the highest priority (is at the top).
        this.heap = [];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    insert(task) {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }

    bubbleUp(index) {
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

    bubbleDown(index) {
        let lastIndex = this.heap.length - 1;
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

    if (input.length === 0 || input[0].trim() === '') {
        return;
    }

    let lineIndex = 0;
    
    // Read N and M
    const [N, M] = input[lineIndex++].trim().split(/\s+/).map(Number);

    // Read task names
    const taskNames = input[lineIndex++].trim().split(/\s+/).filter(s => s.length > 0);
    
    // Map task names to indices for easier graph representation if needed, 
    // but since we are using names directly in the PQ, we can work with names.
    const taskSet = new Set(taskNames);

    // Adjacency list to store dependencies (A -> B means A must precede B)
    // Adj[A] = [B, C, ...]
    const adj = new Map();
    for (const task of taskNames) {
        adj.set(task, []);
    }

    // In-degree map: task -> count of prerequisites
    const inDegree = new Map();
    for (const task of taskNames) {
        inDegree.set(task, 0);
    }

    // Read M dependencies
    for (let i = 0; i < M; i++) {
        if (lineIndex >= input.length) break;
        const line = input[lineIndex++].trim();
        if (line.length === 0) continue;
        
        const [u, v] = line.split(/\s+/).filter(s => s.length > 0);
        
        if (taskSet.has(u) && taskSet.has(v)) {
            // Dependency: u must come before v
            adj.get(u).push(v);
            inDegree.set(v, inDegree.get(v) + 1);
        }
    }

    // Initialize Priority Queue with tasks having an in-degree of 0
    const pq = new PriorityQueue();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            pq.insert(task);
        }
    }

    const buildOrder: string[] = [];

    // Kahn's Algorithm modification using the Priority Queue
    while (!pq.isEmpty()) {
        const u = pq.extractMin();
        buildOrder.push(u);

        // Process neighbors of u
        const neighbors = adj.get(u) || [];
        
        // Sort neighbors to ensure consistent processing if the requirement implies 
        // that when multiple tasks are available, the *next* one chosen 
        // among *newly available* tasks should follow the PQ logic.
        // However, the requirement states: "When multiple tasks are available, choose the 
        // lexicographically smallest task name." This applies to the set of tasks *ready* 
        // at any point. The PQ naturally handles this.
        
        for (const v of neighbors) {
            const newInDegree = inDegree.get(v) - 1;
            inDegree.set(v, newInDegree);

            if (newInDegree === 0) {
                pq.insert(v);
            }
        }
    }

    // Check for cycles
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(' '));
    }
}

solve();
