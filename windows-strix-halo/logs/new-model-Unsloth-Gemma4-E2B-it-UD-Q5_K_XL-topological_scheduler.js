"use strict";
const fs = require('fs');
/**
 * Implementation of a Min-Priority Queue (Min-Heap) for strings.
 * It ensures that the lexicographically smallest element is always at the root.
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
        this.siftUp(this.heap.length - 1);
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
        this.siftDown(0);
        return min;
    }
    siftUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            // If current element is lexicographically smaller than its parent
            if (this.heap[index] < this.heap[parentIndex]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    siftDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;
            // Check left child
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftChildIndex;
            }
            // Check right child
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = rightChildIndex;
            }
            if (smallestIndex !== index) {
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    // Read all input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0)
        return;
    // 1. Parse N and M
    let lineIndex = 0;
    const [N, M] = input[lineIndex++].trim().split(/\s+/).map(Number);
    if (N === 0) {
        console.log('');
        return;
    }
    // 2. Parse Task Names
    const taskNames = input[lineIndex++].trim().split(/\s+/);
    const allTasks = new Set(taskNames);
    // Initialize graph structures
    const adj = new Map();
    const inDegree = new Map();
    // Initialize all tasks in maps
    for (const task of taskNames) {
        adj.set(task, new Set());
        inDegree.set(task, 0);
    }
    // 3. Parse Dependencies (Edges)
    for (let i = 0; i < M; i++) {
        const line = input[lineIndex++].trim();
        if (!line)
            continue;
        const [A, B] = line.split(/\s+/);
        if (adj.has(A) && adj.has(B)) {
            // A must be completed before B (A -> B)
            adj.get(A).add(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    // 4. Initialize Priority Queue (Kahn's Algorithm setup)
    const pq = new MinPriorityQueue();
    // Add all tasks with in-degree 0 to the PQ
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    // 5. Perform Topological Sort
    const buildOrder = [];
    let processedCount = 0;
    while (!pq.isEmpty()) {
        const currentTask = pq.extractMin();
        buildOrder.push(currentTask);
        processedCount++;
        const neighbors = adj.get(currentTask) || new Set();
        for (const neighbor of neighbors) {
            const newDegree = inDegree.get(neighbor) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                pq.insert(neighbor);
            }
        }
    }
    // 6. Check for Cycle and Output
    if (processedCount !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(buildOrder.join(' '));
    }
}
solve();
