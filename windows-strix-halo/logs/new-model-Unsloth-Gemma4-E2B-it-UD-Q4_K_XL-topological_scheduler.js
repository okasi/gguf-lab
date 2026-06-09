"use strict";
const fs = require('fs');
/**
 * MinPriorityQueue implementation tailored for lexicographical sorting of strings.
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
        this.bubbleDown(0);
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
    bubbleDown(index) {
        const n = this.heap.length;
        let smallest = index;
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            if (leftChild < n && this.heap[leftChild] < this.heap[smallest]) {
                smallest = leftChild;
            }
            if (rightChild < n && this.heap[rightChild] < this.heap[smallest]) {
                smallest = rightChild;
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
    const input = fs.readFileSync(0, "utf8").trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (input.length === 0) {
        console.log("");
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
    const taskSet = new Set(taskNames);
    // Data structures initialization
    const adj = new Map();
    const inDegree = new Map();
    // Initialize all tasks in maps
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    // 3. Parse Dependencies (Edges)
    for (let i = 2; i < 2 + M; i++) {
        const parts = input[i].split(' ');
        if (parts.length === 2) {
            const u = parts[0]; // Prerequisite
            const v = parts[1]; // Dependent task
            if (taskSet.has(u) && taskSet.has(v)) {
                adj.get(u).push(v);
                inDegree.set(v, inDegree.get(v) + 1);
            }
        }
    }
    // 4. Initialize Priority Queue
    const pq = new MinPriorityQueue();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            pq.insert(task);
        }
    }
    // 5. Topological Sort (Kahn's Algorithm with Lexicographical Priority)
    const buildOrder = [];
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest available task
        const u = pq.extractMin();
        buildOrder.push(u);
        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            const newDegree = inDegree.get(v) - 1;
            inDegree.set(v, newDegree);
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 6. Check for Cycle
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(buildOrder.join(' '));
    }
}
solve();
