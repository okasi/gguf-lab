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
    enqueue(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return root;
    }
    bubbleUp(index) {
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            // Comparison: lexicographically smaller
            if (this.heap[currentIndex] < this.heap[parentIndex]) {
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
            let left = this.getLeftChildIndex(currentIndex);
            let right = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;
            // Compare with left child
            if (left <= lastIndex && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            // Compare with right child
            if (right <= lastIndex && this.heap[right] < this.heap[smallest]) {
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
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === "") {
        return;
    }
    // Parse N and M
    const [N, M] = input[0].trim().split(/\s+/).map(Number);
    if (N === 0) {
        console.log("");
        return;
    }
    // Parse task names
    const taskNames = input[1].trim().split(/\s+/);
    const taskMap = new Map();
    for (let i = 0; i < N; i++) {
        taskMap.set(taskNames[i], i);
    }
    // Graph representation: Adjacency list and in-degree array
    const adj = Array(N).fill(0).map(() => []);
    const inDegree = Array(N).fill(0);
    // Parse dependencies
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim();
        if (!line)
            continue;
        const [A_name, B_name] = line.split(/\s+/);
        const u = taskMap.get(A_name);
        const v = taskMap.get(B_name);
        if (u === undefined || v === undefined)
            continue;
        // A -> B (A must be completed before B)
        adj[u].push(v);
        inDegree[v]++;
    }
    // --- Topological Sort using Priority Queue (Kahn's Algorithm variant) ---
    const pq = new PriorityQueue();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.enqueue(taskNames[i]);
        }
    }
    const buildOrder = [];
    while (!pq.isEmpty()) {
        // Get the lexicographically smallest available task
        const uName = pq.dequeue();
        const uIndex = taskMap.get(uName);
        buildOrder.push(uName);
        // Process neighbors
        for (const vIndex of adj[uIndex]) {
            inDegree[vIndex]--;
            if (inDegree[vIndex] === 0) {
                const vName = taskNames[vIndex];
                pq.enqueue(vName);
            }
        }
    }
    // Check for cycle
    if (buildOrder.length === N) {
        console.log(buildOrder.join(" "));
    }
    else {
        console.log("IMPOSSIBLE");
    }
}
solve();
