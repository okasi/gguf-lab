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
 * PriorityQueue implementation (Min-Heap) for string comparison (lexicographically).
 * Since we always want the lexicographically smallest task available, we use a Min-Heap.
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
    /**
     * Inserts an element while maintaining the heap property. O(log N).
     */
    push(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    /**
     * Removes and returns the smallest element (root). O(log N).
     */
    pop() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const smallest = this.heap[0];
        // Move the last element to the root
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return smallest;
    }
    /**
     * Moves a newly inserted element up the heap until the heap property is satisfied.
     * Comparison uses localeCompare to ensure lexicographical ordering.
     */
    bubbleUp(index) {
        let current = index;
        let parent = Math.floor((current - 1) / 2);
        // Check if current element is smaller (lexicographically) than its parent
        while (current > 0 && this.heap[current].localeCompare(this.heap[parent]) < 0) {
            [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
            current = parent;
            parent = Math.floor((current - 1) / 2);
        }
    }
    /**
     * Moves an element down the heap until the heap property is satisfied.
     */
    bubbleDown(index) {
        let current = index;
        let smallest = current;
        let left = 2 * current + 1;
        let right = 2 * current + 2;
        // Find the smallest child
        if (left < this.heap.length && this.heap[left].localeCompare(this.heap[smallest]) < 0) {
            smallest = left;
        }
        if (right < this.heap.length && this.heap[right].localeCompare(this.heap[smallest]) < 0) {
            smallest = right;
        }
        // Swap if necessary
        if (smallest !== current) {
            [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
            this.bubbleDown(smallest);
        }
    }
}
function solve() {
    // Read all input from stdin (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // 1. Parse N and M
    const [N_str, M_str] = lines[0].split(' ');
    const N = parseInt(N_str);
    const M = parseInt(M_str);
    // 2. Parse Task Names
    const tasks = lines[1].split(' ');
    const taskNames = new Set(tasks);
    // 3. Initialize Graph Structures
    // Adjacency List: Map<TaskName, TaskName[]>
    const adj = new Map();
    // In-Degrees: Map<TaskName, number>
    const inDegree = new Map();
    // Initialize all tasks in the maps
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    // 4. Build Graph and Calculate In-Degrees
    for (let i = 0; i < M; i++) {
        const line = lines[2 + i];
        if (!line)
            continue;
        const [A, B] = line.split(' '); // A must precede B (A -> B)
        // Add edge A -> B
        adj.get(A).push(B);
        // Increment in-degree of B
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }
    // 5. Initialize Priority Queue (Min-Heap)
    const pq = new PriorityQueue();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    // 6. Perform Topological Sort (Kahn's Algorithm)
    const result = [];
    while (!pq.isEmpty()) {
        // Get the lexicographically smallest ready task
        const u = pq.pop();
        result.push(u);
        // Process neighbors (V)
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Decrement in-degree of V
            let currentDegree = inDegree.get(v);
            currentDegree -= 1;
            inDegree.set(v, currentDegree);
            // If V's in-degree drops to 0, it is now ready
            if (currentDegree === 0) {
                pq.push(v);
            }
        }
    }
    // 7. Output Result
    if (result.length === N) {
        console.log(result.join(' '));
    }
    else {
        // Cycle detected if not all tasks were processed
        console.log('IMPOSSIBLE');
    }
}
solve();
