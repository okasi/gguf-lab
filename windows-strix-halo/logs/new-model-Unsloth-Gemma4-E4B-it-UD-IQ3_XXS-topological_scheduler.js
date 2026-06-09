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
 * MinHeap implementation for lexicographically smallest string ordering.
 * Used as the Priority Queue in Kahn's algorithm.
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
    // Inserts a task (string) into the heap
    insert(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    // Retrieves and removes the smallest element (lexicographically)
    extractMin() {
        if (this.isEmpty()) {
            return null;
        }
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    bubbleUp(index) {
        while (index > 0) {
            const currentIndex = index;
            const parentIndex = Math.floor((index - 1) / 2);
            // Comparison is based on lexicographical order (string comparison)
            if (this.heap[currentIndex] < this.heap[parentIndex]) {
                [this.heap[currentIndex], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[currentIndex]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        while (true) {
            let smallestIndex = index;
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            // Check left child
            if (leftChildIndex < this.heap.length && this.heap[leftChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftChildIndex;
            }
            // Check right child
            if (rightChildIndex < this.heap.length && this.heap[rightChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = rightChildIndex;
            }
            if (smallestIndex !== index) {
                // Swap the current element with the smallest child
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
    // Read all input from stdin
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0)
        return;
    // Parse N and M
    const [N, M] = input[0].trim().split(/\s+/).map(Number);
    // Parse task names (N distinct tasks)
    const taskNames = input[1].trim().split(/\s+/);
    // Initialize data structures
    const inDegree = new Map();
    const adj = new Map();
    for (const name of taskNames) {
        inDegree.set(name, 0);
        adj.set(name, []);
    }
    // Process dependencies (M lines starting from input[2])
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (line === '')
            continue;
        const [A, B] = line.split(/\s+/);
        // A -> B (A must come before B)
        // A is the predecessor, B is the successor
        const successors = adj.get(A);
        if (successors) {
            successors.push(B);
            // Increment the in-degree of the successor (B)
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    // --- Topological Sort (Kahn's Algorithm) ---
    const pq = new MinHeap();
    const result = [];
    // 1. Initialize the Priority Queue with all nodes having an in-degree of 0
    for (const name of taskNames) {
        if (inDegree.get(name) === 0) {
            pq.insert(name);
        }
    }
    // 2. Process nodes
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest task
        const u = pq.extractMin();
        result.push(u);
        // Process neighbors (successors) of U
        const successors = adj.get(u);
        for (const v of successors) {
            // Decrement the in-degree of the successor V
            let currentInDegree = inDegree.get(v);
            currentInDegree--;
            // Update the map (since Maps store references, this update is crucial)
            // We must re-read the current value since we are working with a mutable state
            inDegree.set(v, currentInDegree);
            // If the in-degree hits 0, add it to the PQ
            if (currentInDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 3. Check for cycles
    if (result.length === N) {
        console.log(result.join(' '));
    }
    else {
        console.log('IMPOSSIBLE');
    }
}
solve();
