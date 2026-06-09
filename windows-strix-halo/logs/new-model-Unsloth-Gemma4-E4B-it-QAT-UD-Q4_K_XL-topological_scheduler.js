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
 * A simple Min-Priority Queue implemented using an array representation of a Binary Heap.
 * Stores strings and prioritizes lexicographically smaller strings.
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
    // Comparison function: lexicographically smaller has higher priority
    compare(a, b) {
        return a < b;
    }
    enqueue(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
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
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            if (this.compare(this.heap[currentIndex], this.heap[parentIndex])) {
                this.swap(currentIndex, parentIndex);
                currentIndex = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        let currentIndex = index;
        const lastIndex = this.heap.length - 1;
        while (true) {
            const left = this.getLeftChildIndex(currentIndex);
            const right = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;
            // Check left child
            if (left <= lastIndex && this.compare(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }
            // Check right child
            if (right <= lastIndex && this.compare(this.heap[right], this.heap[smallest])) {
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
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    if (input.length < 2) {
        return;
    }
    // Parse N and M
    const [n, m] = input[0].trim().split(/\s+/).map(Number);
    // Parse task names
    const taskNames = input[1].trim().split(/\s+/);
    if (taskNames.length !== n) {
        // Handle case where N might be inconsistent with actual input
        // For robustness, we proceed with min(N, taskNames.length) but assume consistency per problem statement
    }
    // 1. Initialize Graph and In-degrees
    const adj = {};
    const inDegree = {};
    for (const task of taskNames) {
        adj[task] = [];
        inDegree[task] = 0;
    }
    // 2. Build Graph and calculate In-degrees
    for (let i = 2; i < 2 + m; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        if (parts.length < 2)
            continue;
        const [u, v] = parts; // u must be completed before v (u -> v)
        if (adj[u] && adj[v]) {
            adj[u].push(v);
            inDegree[v]++;
        }
    }
    // 3. Initialize Priority Queue with tasks having in-degree 0
    const pq = new PriorityQueue();
    for (const task of taskNames) {
        if (inDegree[task] === 0) {
            pq.enqueue(task);
        }
    }
    // 4. Topological Sort using PQ (Kahn's algorithm variant)
    const buildOrder = [];
    while (!pq.isEmpty()) {
        // Dequeue the lexicographically smallest available task
        const currentTask = pq.dequeue();
        buildOrder.push(currentTask);
        // Process neighbors
        for (const neighbor of adj[currentTask]) {
            inDegree[neighbor]--;
            // If in-degree drops to 0, add it to the PQ
            if (inDegree[neighbor] === 0) {
                pq.enqueue(neighbor);
            }
        }
    }
    // 5. Output Result
    if (buildOrder.length === n) {
        console.log(buildOrder.join(" "));
    }
    else {
        console.log("IMPOSSIBLE");
    }
}
solve();
