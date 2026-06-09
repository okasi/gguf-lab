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
 * Custom MinHeap implementation using lexicographical comparison for strings.
 * This is required to ensure that when multiple tasks are ready (in-degree 0),
 * the lexicographically smallest one is chosen next.
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
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    bubbleUp(index) {
        let current = index;
        while (current > 0) {
            let parentIndex = this.parent(current);
            // Compare lexicographically
            if (this.heap[current] < this.heap[parentIndex]) {
                this.swap(current, parentIndex);
                current = parentIndex;
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
            let leftChild = this.left(current);
            let rightChild = this.right(current);
            let smallest = current;
            // Find the smallest among parent, left, and right
            if (leftChild <= lastIndex && this.heap[leftChild] < this.heap[smallest]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.heap[rightChild] < this.heap[smallest]) {
                smallest = rightChild;
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
    insert(value) {
        this.heap.push(value);
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
        // Move last element to the root
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
}
/**
 * Main function to solve the topological sorting problem.
 */
function solve() {
    // Read input from standard input (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].length === 0) {
        console.log("");
        return;
    }
    // 1. Parse N and M
    const [N, M] = input[0].split(' ').map(Number);
    // Handle case where N=0
    if (N === 0) {
        console.log("");
        return;
    }
    // 2. Parse Task Names
    const tasks = input[1].split(' ');
    const taskToId = new Map();
    tasks.forEach((task, index) => taskToId.set(task, index));
    // Data Structures Initialization
    // adj: Adjacency List (Task Name -> List of Tasks it points to)
    const adj = new Map();
    // inDegree: Stores the number of prerequisites for each task
    const inDegree = new Map();
    tasks.forEach(task => {
        adj.set(task, []);
        inDegree.set(task, 0);
    });
    // 3. Build Graph (Edges)
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].split(' ');
        if (line.length !== 2)
            continue;
        const preReq = line[0];
        const dependent = line[1];
        // Add edge: preReq -> dependent
        adj.get(preReq).push(dependent);
        inDegree.set(dependent, inDegree.get(dependent) + 1);
    }
    // 4. Initialize Priority Queue (Min-Heap)
    const pq = new MinHeap();
    // Add all tasks with zero in-degree to the PQ
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }
    // 5. Topological Sort
    const buildOrder = [];
    while (!pq.isEmpty()) {
        // Always extract the lexicographically smallest task
        const u = pq.extractMin();
        buildOrder.push(u);
        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Reduce in-degree of neighbors
            const currentDegree = inDegree.get(v);
            const newDegree = currentDegree - 1;
            inDegree.set(v, newDegree);
            // If a neighbor becomes ready, add it to the PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }
    // 6. Check for Cycles and Output
    if (buildOrder.length === N) {
        console.log(buildOrder.join(' '));
    }
    else {
        console.log("IMPOSSIBLE");
    }
}
solve();
