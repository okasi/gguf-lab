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
 * Custom MinHeap implementation for string comparison (lexicographical order).
 * This ensures that when multiple tasks are ready, the lexicographically smallest one is chosen.
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
    insert(value) {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }
    extractMin() {
        if (this.heap.length === 0) {
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
        let current = index;
        while (current > 0) {
            let parent = Math.floor((current - 1) / 2);
            // Lexicographical comparison: If current < parent, swap (MinHeap property)
            if (this.heap[current] < this.heap[parent]) {
                [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
                current = parent;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        let current = index;
        const n = this.heap.length;
        while (true) {
            let leftChild = 2 * current + 1;
            let rightChild = 2 * current + 2;
            let smallest = current;
            // Check left child
            if (leftChild < n && this.heap[leftChild] < this.heap[smallest]) {
                smallest = leftChild;
            }
            // Check right child against the current smallest
            if (rightChild < n && this.heap[rightChild] < this.heap[smallest]) {
                smallest = rightChild;
            }
            if (smallest !== current) {
                [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
                current = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === '') {
        console.log("");
        return;
    }
    // Parse N and M
    const [N, M] = input[0].split(' ').map(Number);
    // Parse task names
    const taskNames = input[1].split(' ');
    // Data Structures Initialization
    const inDegree = new Map();
    const adj = new Map();
    // Initialize all tasks
    for (const task of taskNames) {
        inDegree.set(task, 0);
        adj.set(task, []);
    }
    // Process dependencies
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].split(' ');
        if (line.length < 2)
            continue;
        const prerequisite = line[0]; // A
        const dependent = line[1]; // B (A -> B)
        // Ensure tasks exist (should be guaranteed by input format, but good practice)
        if (inDegree.has(prerequisite) && inDegree.has(dependent)) {
            adj.get(prerequisite).push(dependent);
            inDegree.set(dependent, inDegree.get(dependent) + 1);
        }
    }
    // --- Topological Sort (Kahn's Algorithm) ---
    const pq = new MinHeap();
    // 1. Initialize the Priority Queue with all nodes having an in-degree of 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    const buildOrder = [];
    // 2. Process tasks
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest ready task
        const u = pq.extractMin();
        buildOrder.push(u);
        // For every neighbor v (task that depends on u)
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Reduce the in-degree
            const newDegree = inDegree.get(v) - 1;
            inDegree.set(v, newDegree);
            // If v is now ready, add it to the PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 3. Output result
    if (buildOrder.length === N) {
        console.log(buildOrder.join(' '));
    }
    else {
        console.log("IMPOSSIBLE");
    }
}
solve();
