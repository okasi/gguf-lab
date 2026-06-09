"use strict";
const fs = require('fs');
/**
 * MinPriorityQueue implementation tailored for string comparison (lexicographical order).
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
    _getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    _getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    _getRightChildIndex(i) {
        return 2 * i + 2;
    }
    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    _compare(i, j) {
        // Lexicographical comparison: returns true if heap[i] should come before heap[j]
        return this.heap[i] < this.heap[j];
    }
    insert(element) {
        this.heap.push(element);
        this._bubbleUp(this.heap.length - 1);
    }
    extractMin() {
        if (this.isEmpty())
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown(0);
        return min;
    }
    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = this._getParentIndex(index);
            if (this._compare(index, parentIndex)) {
                this._swap(index, parentIndex);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    _bubbleDown(index) {
        let minIndex = index;
        const left = this._getLeftChildIndex(index);
        const right = this._getRightChildIndex(index);
        const n = this.heap.length;
        if (left < n && this._compare(left, minIndex)) {
            minIndex = left;
        }
        if (right < n && this._compare(right, minIndex)) {
            minIndex = right;
        }
        if (minIndex !== index) {
            this._swap(index, minIndex);
            this._bubbleDown(minIndex);
        }
    }
}
function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        return;
    }
    // Parse N and M
    const [N, M] = input[0].split(' ').map(Number);
    // Parse task names
    const tasks = input[1].trim().split(/\s+/).filter(t => t.length > 0);
    // --- Graph Initialization ---
    const adj = new Map(); // Adjacency list: Task -> [Successors]
    const inDegree = new Map(); // Task -> In-degree count
    // Initialize graph structures for all tasks
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    // Parse dependencies
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const [A, B] = line.split(/\s+/); // A must precede B (A -> B)
        if (adj.has(A) && adj.has(B)) {
            adj.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    // --- Topological Sort (Kahn's Algorithm with Priority Queue) ---
    const pq = new MinPriorityQueue();
    // 1. Initialize PQ with all nodes having in-degree 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    const buildOrder = [];
    // 2. Process nodes
    while (!pq.isEmpty()) {
        const u = pq.extractMin();
        buildOrder.push(u);
        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            let newDegree = inDegree.get(v) - 1;
            inDegree.set(v, newDegree);
            // If in-degree becomes 0, add to PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 3. Check for cycles
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(buildOrder.join(' '));
    }
}
solve();
