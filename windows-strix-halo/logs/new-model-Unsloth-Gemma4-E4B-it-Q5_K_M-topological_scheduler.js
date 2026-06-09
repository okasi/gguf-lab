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
 * Implements a Min-Heap specifically for string comparison (lexicographical order).
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
    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    getLeftChildIndex(i) { return 2 * i + 1; }
    getRightChildIndex(i) { return 2 * i + 2; }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    /**
     * Inserts an element while maintaining the heap property. O(log N)
     */
    insert(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    bubbleUp(index) {
        let currentIndex = index;
        let parentIndex = this.getParentIndex(currentIndex);
        while (currentIndex > 0 && this.heap[currentIndex] < this.heap[parentIndex]) {
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = this.getParentIndex(currentIndex);
        }
    }
    /**
     * Extracts the minimum element (lexicographically smallest). O(log N)
     */
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
    bubbleDown(index) {
        let currentIndex = index;
        const size = this.heap.length;
        while (true) {
            const left = this.getLeftChildIndex(currentIndex);
            const right = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;
            // Compare with left child
            if (left < size && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            // Compare with right child
            if (right < size && this.heap[right] < this.heap[smallest]) {
                smallest = right;
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
}
function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        console.log("");
        return;
    }
    let lineIndex = 0;
    const [N_str, M_str] = input[lineIndex++].trim().split(' ');
    const N = parseInt(N_str);
    const M = parseInt(M_str);
    if (N === 0) {
        console.log("");
        return;
    }
    // Read task names
    const tasks = input[lineIndex++].trim().split(/\s+/);
    // Data structures for topological sort (Kahn's algorithm with Min-Heap)
    const inDegree = new Map();
    const adj = new Map();
    // Initialize structures for all tasks
    for (const task of tasks) {
        inDegree.set(task, 0);
        adj.set(task, []);
    }
    // Read dependencies
    for (let i = 0; i < M; i++) {
        const line = input[lineIndex++].trim();
        if (line === '')
            continue;
        const [A, B] = line.split(/\s+/); // A -> B (A must come before B)
        // Build graph
        if (adj.has(A) && inDegree.has(B)) {
            adj.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    // 1. Initialize Min-Heap with tasks having in-degree 0
    const pq = new PriorityQueue();
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    // 2. Perform topological sort
    const result = [];
    while (!pq.isEmpty()) {
        // Get the lexicographically smallest ready task
        const u = pq.extractMin();
        result.push(u);
        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Decrement in-degree
            const newDegree = (inDegree.get(v) - 1);
            inDegree.set(v, newDegree);
            // If ready, add to priority queue
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 3. Check for cycle
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(' '));
    }
}
solve();
