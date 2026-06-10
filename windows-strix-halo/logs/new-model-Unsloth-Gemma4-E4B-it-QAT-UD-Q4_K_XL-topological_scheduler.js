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
class PriorityQueue {
    constructor(comparator) {
        this.heap = [];
        this.comparator = comparator;
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    enqueue(value, priority) {
        const item = { value, priority };
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop().value;
        }
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min.value;
    }
    bubbleUp(index) {
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (this.comparator(this.heap[currentIndex].value, this.heap[parentIndex].value) < 0) {
                [this.heap[currentIndex], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[currentIndex]];
                currentIndex = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        let currentIndex = index;
        const n = this.heap.length;
        while (true) {
            let smallest = currentIndex;
            const leftChild = 2 * currentIndex + 1;
            const rightChild = 2 * currentIndex + 2;
            if (leftChild < n && this.comparator(this.heap[leftChild].value, this.heap[smallest].value) < 0) {
                smallest = leftChild;
            }
            if (rightChild < n && this.comparator(this.heap[rightChild].value, this.heap[smallest].value) < 0) {
                smallest = rightChild;
            }
            if (smallest !== currentIndex) {
                [this.heap[currentIndex], this.heap[smallest]] = [this.heap[smallest], this.heap[currentIndex]];
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
    if (input.length === 0 || input[0] === '') {
        console.log("IMPOSSIBLE");
        return;
    }
    const [N, M] = input[0].trim().split(/\s+/).map(Number);
    if (isNaN(N) || isNaN(M)) {
        console.log("IMPOSSIBLE");
        return;
    }
    const taskNames = input[1].trim().split(/\s+/);
    if (taskNames.length !== N) {
        console.log("IMPOSSIBLE");
        return;
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        if (parts.length < 2)
            continue;
        const u = parts[0];
        const v = parts[1];
        if (adj.has(u) && adj.has(v)) {
            adj.get(u).push(v);
            inDegree.set(v, inDegree.get(v) + 1);
        }
    }
    // Min-Heap based on lexicographical order (smaller string = higher priority)
    // Comparator returns < 0 if a should come before b (i.e., a has higher priority)
    const pq = new PriorityQueue((a, b) => a.localeCompare(b));
    // Initialize queue with all nodes having in-degree 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.enqueue(task, task); // Priority is the task name itself for lexicographical ordering
        }
    }
    const buildOrder = [];
    let count = 0;
    while (!pq.isEmpty()) {
        const currentTask = pq.dequeue();
        buildOrder.push(currentTask);
        count++;
        const neighbors = adj.get(currentTask) || [];
        // Sort neighbors lexicographically before processing to ensure deterministic iteration
        // Although the queue handles selection, processing neighbors deterministically is good practice.
        // More importantly, we must process neighbors in the order they are given IF the requirement implied
        // that if two tasks become available, the one listed first in the input adjacency list among those
        // becoming available should be preferred. Since the requirement is "lexicographically smallest task name"
        // among *all* available tasks, the PQ handles the selection correctly.
        // However, processing neighbors in lexicographical order helps maintain determinism in traversal logic if multiple
        // neighbors become ready simultaneously, although the PQ is the primary driver.
        neighbors.sort((a, b) => a.localeCompare(b));
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                pq.enqueue(neighbor, neighbor);
            }
        }
    }
    if (count === N) {
        console.log(buildOrder.join(' '));
    }
    else {
        // Cycle detected if we couldn't process all tasks
        console.log("IMPOSSIBLE");
    }
}
solve();
