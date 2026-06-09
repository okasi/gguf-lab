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
 * MinPriorityQueue implementation specialized for string comparisons (lexicographical order).
 * This ensures that when multiple tasks are available, the lexicographically smallest is always chosen.
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
    peek() {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }
    // Standard heap operations
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    bubbleUp(index) {
        let current = index;
        while (current > 0) {
            let parent = Math.floor((current - 1) / 2);
            // Lexicographical comparison: if current task is smaller (comes before) parent task
            if (this.heap[current] < this.heap[parent]) {
                this.swap(current, parent);
                current = parent;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        let current = index;
        const lastIndex = this.heap.length - 1;
        while (true) {
            let left = 2 * current + 1;
            let right = 2 * current + 2;
            let smallest = current;
            // Check left child
            if (left <= lastIndex && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            // Check right child
            if (right <= lastIndex && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== current) {
                this.swap(current, smallest);
                current = smallest;
            }
            else {
                break;
            }
        }
    }
    insert(task) {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }
    extractMin() {
        if (this.isEmpty())
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const min = this.heap[0];
        // Move the last element to the root and shrink the heap
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
}
/**
 * Solves the dependency ordering problem using Kahn's Algorithm with a Min-Heap
 * to ensure lexicographical determinism.
 */
function solve() {
    // Read all input from standard input file descriptor 0
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === "") {
        console.log("");
        return;
    }
    // Parse N and M
    const [N, M] = input[0].split(' ').map(Number);
    // Parse task names
    const taskNames = input[1].split(' ');
    // Data structures initialization
    const adj = new Map(); // Adjacency list: Task -> [Dependents]
    const inDegree = new Map(); // Task -> Count of prerequisites
    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }
    // Process M dependencies
    for (let i = 0; i < M; i++) {
        const line = input[2 + i];
        if (!line.trim())
            continue;
        const [A, B] = line.split(' '); // A must precede B
        // Build graph
        adj.get(A).push(B);
        inDegree.set(B, inDegree.get(B) + 1);
    }
    // 1. Initialize Priority Queue (Min-Heap)
    const pq = new MinPriorityQueue();
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    // 2. Perform Topological Sort
    const buildOrder = [];
    let tasksProcessed = 0;
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest available task
        const currentTask = pq.extractMin();
        buildOrder.push(currentTask);
        tasksProcessed++;
        // Process neighbors
        const dependents = adj.get(currentTask) || [];
        for (const neighbor of dependents) {
            // Decrement in-degree
            let newDegree = inDegree.get(neighbor) - 1;
            inDegree.set(neighbor, newDegree);
            // If all prerequisites are met, add to the PQ
            if (newDegree === 0) {
                pq.insert(neighbor);
            }
        }
    }
    // 3. Output Result
    if (tasksProcessed === N) {
        console.log(buildOrder.join(' '));
    }
    else {
        // Cycle detected if we couldn't process all tasks
        console.log("IMPOSSIBLE");
    }
}
solve();
