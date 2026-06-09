"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
/**
 * MinPriorityQueue implementation using a binary heap.
 * Stores strings and prioritizes lexicographically smallest.
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }
    get size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    /**
     * Inserts an element and maintains the heap property. O(log N)
     * @param element The string task name to insert.
     */
    insert(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    /**
     * Extracts and returns the minimum element (lexicographically smallest). O(log N)
     * @returns The smallest element, or undefined if empty.
     */
    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0];
        // Move the last element to the root
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return min;
    }
    bubbleUp(index) {
        let currentIndex = index;
        let parentIndex = Math.floor((currentIndex - 1) / 2);
        while (currentIndex > 0 && this.heap[currentIndex] < this.heap[parentIndex]) {
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = Math.floor((currentIndex - 1) / 2);
        }
    }
    sinkDown(index) {
        let currentIndex = index;
        const length = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * currentIndex + 1;
            let rightChildIndex = 2 * currentIndex + 2;
            let smallest = currentIndex;
            // Check left child
            if (leftChildIndex < length && this.heap[leftChildIndex] < this.heap[smallest]) {
                smallest = leftChildIndex;
            }
            // Check right child
            if (rightChildIndex < length && this.heap[rightChildIndex] < this.heap[smallest]) {
                smallest = rightChildIndex;
            }
            if (smallest !== currentIndex) {
                this.swap(currentIndex, smallest);
                currentIndex = smallest;
            }
            else {
                break;
            }
        }
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
}
/**
 * Solves the deterministic build order problem using Topological Sort (Kahn's Algorithm)
 * implemented with a Min-Heap for deterministic selection.
 */
function solve() {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        console.log("");
        return;
    }
    const [N_str, M_str] = input[0].split(' ');
    const N = parseInt(N_str);
    const M = parseInt(M_str);
    if (N === 0) {
        console.log("");
        return;
    }
    // 1. Parse Tasks
    const tasks = input[1].split(' ');
    const taskMap = new Map();
    tasks.forEach((task, index) => taskMap.set(task, index));
    // 2. Initialize Graph Structures
    // Adjacency list: Task -> list of tasks that depend on it
    const adj = new Map();
    // In-degree: Task -> number of incoming dependencies
    const inDegree = new Map();
    tasks.forEach(task => {
        adj.set(task, []);
        inDegree.set(task, 0);
    });
    // 3. Build Graph
    // Dependencies start from the third line (index 2)
    for (let i = 0; i < M; i++) {
        const line = input[i + 2];
        if (!line)
            continue;
        const [A, B] = line.split(' '); // A must be done before B
        // A -> B
        adj.get(A).push(B);
        inDegree.set(B, inDegree.get(B) + 1);
    }
    // 4. Initialize Priority Queue (Ready tasks)
    const pq = new MinPriorityQueue();
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    // 5. Topological Sort
    const result = [];
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest available task
        const u = pq.extractMin();
        result.push(u);
        // Process neighbors (tasks dependent on u)
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Decrement in-degree
            const newDegree = inDegree.get(v) - 1;
            inDegree.set(v, newDegree);
            // If in-degree hits zero, the task is ready and must be added to the PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 6. Output Result
    if (result.length === N) {
        console.log(result.join(' '));
    }
    else {
        // Cycle detected
        console.log('IMPOSSIBLE');
    }
}
solve();
