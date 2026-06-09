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
 * MinHeap implementation tailored for lexicographical string comparison.
 * Stores task names (strings).
 */
class MinHeap {
    constructor() {
        this.heap = [];
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    getRightChildIndex(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    /**
     * Inserts a task name into the heap. O(log N)
     * @param task The task name (string).
     */
    insert(task) {
        this.heap.push(task);
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
     * Extracts and returns the lexicographically smallest task. O(log N)
     * @returns The smallest task name, or null if empty.
     */
    extractMin() {
        if (this.isEmpty()) {
            return null;
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
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftIndex = this.getLeftChildIndex(currentIndex);
            let rightIndex = this.getRightChildIndex(currentIndex);
            let smallestIndex = currentIndex;
            // Compare with left child
            if (leftIndex <= lastIndex && this.heap[leftIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftIndex;
            }
            // Compare with right child
            if (rightIndex <= lastIndex && this.heap[rightIndex] < this.heap[smallestIndex]) {
                smallestIndex = rightIndex;
            }
            if (smallestIndex !== currentIndex) {
                this.swap(currentIndex, smallestIndex);
                currentIndex = smallestIndex;
            }
            else {
                break;
            }
        }
    }
}
/**
 * Main function to solve the Topological Sort problem.
 */
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0] === '') {
        console.log("IMPOSSIBLE");
        return;
    }
    // Parse N and M
    const [NStr, MStr] = input[0].trim().split(/\s+/);
    const N = parseInt(NStr);
    const M = parseInt(MStr);
    if (N === 0) {
        console.log("");
        return;
    }
    // Parse task names
    const taskNames = input[1].trim().split(/\s+/);
    // Graph structures
    const adj = new Map();
    const inDegree = new Map();
    // Initialize all tasks in structures
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    // Process dependencies
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim();
        if (line === '')
            continue;
        const [A, B] = line.split(/\s+/);
        // A must be completed before B (A -> B)
        // Ensure both tasks exist before adding edge (robustness check)
        if (adj.has(A) && adj.has(B)) {
            adj.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    // Step 1: Initialize Priority Queue (MinHeap)
    const pq = new MinHeap();
    for (const [taskName, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(taskName);
        }
    }
    // Step 2: Perform Kahn's Algorithm using PQ
    const buildOrder = [];
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest ready task
        const u = pq.extractMin();
        buildOrder.push(u);
        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Decrement in-degree
            let newDegree = (inDegree.get(v) || 0) - 1;
            inDegree.set(v, newDegree);
            // If in-degree becomes 0, add to PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // Step 3: Check for Cycles
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(buildOrder.join(' '));
    }
}
solve();
