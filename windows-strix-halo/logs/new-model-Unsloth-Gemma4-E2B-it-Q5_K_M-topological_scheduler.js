"use strict";
const fs = require('fs');
/**
 * MinPriorityQueue implementation tailored for lexicographical ordering of strings.
 * Stores task names (strings).
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
    insert(element) {
        this.heap.push(element);
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
        this.sinkDown(0);
        return min;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIndex]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
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
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0)
        return;
    // Line 1: N M
    const [N, M] = input[0].split(' ').map(Number);
    // Line 2: N distinct task names
    const taskNames = input[1].split(' ');
    // Data Structures Initialization
    // Adjacency List: task -> [dependencies]
    const graph = new Map();
    // In-degree Map: task -> count of prerequisites
    const inDegree = new Map();
    // Initialize maps for all tasks
    for (const task of taskNames) {
        graph.set(task, []);
        inDegree.set(task, 0);
    }
    // Process M dependencies
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const [A, B] = line.split(' ');
        if (graph.has(A) && graph.has(B)) {
            // A must be completed before B (A -> B)
            graph.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    // 1. Initialize Priority Queue
    const pq = new MinPriorityQueue();
    // Find all tasks with in-degree 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    // 2. Topological Sort (Kahn's Algorithm)
    const buildOrder = [];
    while (!pq.isEmpty()) {
        const u = pq.extractMin();
        buildOrder.push(u);
        // Process neighbors (tasks dependent on u)
        const neighbors = graph.get(u) || [];
        for (const v of neighbors) {
            // Decrement in-degree of neighbor v
            const newDegree = inDegree.get(v) - 1;
            inDegree.set(v, newDegree);
            // If degree reaches 0, add to PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 3. Cycle Detection
    if (buildOrder.length === N) {
        console.log(buildOrder.join(' '));
    }
    else {
        // Cycle detected
        console.log("IMPOSSIBLE");
    }
}
solve();
