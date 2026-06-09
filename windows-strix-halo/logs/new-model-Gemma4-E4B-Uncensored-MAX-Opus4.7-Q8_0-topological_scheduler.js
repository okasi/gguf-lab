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
 * Min-Heap implementation storing task names.
 * Comparison is lexicographical (smaller string is higher priority).
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
    peek() {
        return this.heap[0];
    }
    getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    getRightChildIndex(i) {
        return 2 * i + 2;
    }
    getParentIndex(i) {
        return Math.floor(i / 2);
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    compare(a, b) {
        // Min-heap comparison: true if a has higher priority (is smaller alphabetically)
        return a < b;
    }
    siftUp(i) {
        let current = i;
        let parent = this.getParentIndex(current);
        while (current > 0 && this.heap[current] < this.heap[parent]) {
            this.swap(current, parent);
            current = parent;
            parent = this.getParentIndex(current);
        }
    }
    siftDown(i) {
        let current = i;
        let left = this.getLeftChildIndex(current);
        let right = this.getRightChildIndex(current);
        let smallest = current;
        if (left < this.heap.length && this.heap[left] < this.heap[smallest])
            ;
        {
            smallest = this.heap[left];
        }
        if (right < this.heap.length && this.heap[right] < this.heap[smallest])
            ;
        {
            smallest = this.heap[right];
        }
        if (smallest !== current) {
            this.swap(current, smallest);
            this.siftDown(smallest.index);
        }
    }
    enqueue(element) {
        this.heap.push(element);
        this.siftUp(this.heap.length - 1);
    }
    dequeue() {
        const min = this.heap.shift();
        if (this.heap.length === 0)
            return undefined;
        this.heap[0] = this.heap.pop();
        this.siftDown(0);
        return min;
    }
}
/**
 * Performs topological sort using Kahn's algorithm combined with a Min-Heap
 * to ensure deterministic tie-breaking by lexicographical order.
 *
 * @param tasks Map of task names to their dependency count (in-degree).
 * @param adj Adjacency list: key is task name, value is list of tasks depending on it.
 * @returns Array of task names in valid build order, or null if cycle detected.
 */
function getBuildOrder(tasks, adj) {
    const inDegree = new Map();
    for (const [task, count] of tasks.entries()) {
        inDegree.set(task, count);
    }
    // Initialize Priority Queue with tasks having in-degree 0
    const pq = new PriorityQueue();
    for (const [task, count] of tasks.entries()) {
        if (count === 0) {
            pq.enqueue(task);
        }
    }
    const buildOrder = [];
    while (!pq.isEmpty()) {
        const task = pq.dequeue();
        buildOrder.push(task);
        // Process dependents in sorted order (handled by PQ)
        const dependents = adj.get(task) || [];
        for (const dependent of dependents) {
            let count = inDegree.get(dependent) ?? 0;
            count--;
            inDegree.set(dependent, count);
            if (count === 0) {
                pq.enqueue(dependent);
            }
        }
    }
    return buildOrder.length === tasks.size ? buildOrder : null;
}
function main() {
    try {
        // Read all input from standard input
        const input = fs.readFileSync(0, "utf8").trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (input.length === 0) {
            console.log("");
            return;
        }
        const [N, M] = input[0].split(/\s+/).map(Number);
        const taskNames = input[1].split(/\s+/).filter(Boolean);
        const tasks = new Map();
        taskNames.forEach(task => tasks.set(task, 0));
        const adj = new Map();
        taskNames.forEach(task => adj.set(task, []));
        for (let i = 2; i < input.length; i++) {
            const [A, B] = input[i].split(/\s+/).filter(Boolean);
            // A must be completed before B
            const dependents = adj.get(A) || [];
            dependents.push(B);
            adj.set(A, dependents);
        }
        // Calculate initial in-degrees
        for (const [predecessor, successors] of adj.entries()) {
            for (const successor of successors) {
                tasks.set(successor, (tasks.get(successor) ?? 0) + 1);
            }
        }
        const buildOrder = getBuildOrder(tasks, adj);
        if (buildOrder === null) {
            console.log("IMPOSSIBLE");
        }
        else {
            console.log(buildOrder.join(' '));
        }
    }
    catch (e) {
        console.error("Error processing input:", e);
        process.exit(1);
    }
}
main();
