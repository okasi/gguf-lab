"use strict";
const fs = require('fs');
/**
 * MinPriorityQueue implementation for strings (lexicographical ordering).
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
        if (this.isEmpty())
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
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
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftChildIndex;
            }
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
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        return;
    }
    // --- 1. Parse Input ---
    const [N_str, M_str] = input[0].trim().split(/\s+/);
    const N = parseInt(N_str);
    const M = parseInt(M_str);
    if (N === 0) {
        console.log("");
        return;
    }
    const taskNames = input[1].trim().split(/\s+/).filter(name => name.length > 0);
    // Initialize data structures
    const adj = new Map(); // Adjacency list: Task -> [Dependents]
    const inDegree = new Map(); // Task -> In-degree count
    // Initialize maps for all tasks
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    // --- 2. Build Graph ---
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim();
        if (line === '')
            continue;
        const [A, B] = line.split(/\s+/).filter(name => name.length > 0);
        if (adj.has(A) && adj.has(B)) {
            // A must be completed before B (A -> B)
            adj.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    // --- 3. Initialize Priority Queue ---
    const pq = new MinPriorityQueue();
    // Find all tasks with in-degree 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    // --- 4. Topological Sort (Kahn's Algorithm with PQ) ---
    const buildOrder = [];
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest available task
        const u = pq.extractMin();
        buildOrder.push(u);
        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            const currentDegree = inDegree.get(v);
            const newDegree = currentDegree - 1;
            inDegree.set(v, newDegree);
            // If in-degree becomes 0, add to PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // --- 5. Cycle Detection and Output ---
    if (buildOrder.length === N) {
        console.log(buildOrder.join(' '));
    }
    else {
        // Cycle detected
        console.log("IMPOSSIBLE");
    }
}
solve();
