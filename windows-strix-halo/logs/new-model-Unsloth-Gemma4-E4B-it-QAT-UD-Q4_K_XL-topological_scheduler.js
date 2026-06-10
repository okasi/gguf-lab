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
        this.comparator = (a, b) => {
            // For lexicographically smallest task name, the priority should be the task name itself,
            // and the comparison should prioritize smaller strings.
            // Here, we treat the task name as the priority.
            return a.toString().localeCompare(b.toString());
        };
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    peek() {
        return this.heap.length > 0 ? this.heap[0].value : undefined;
    }
    enqueue(value, priority) {
        const element = { value, priority };
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        if (this.isEmpty())
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop().value;
        const min = this.heap[0].value;
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return min;
    }
    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;
            if (leftChildIndex <= lastIndex && this.compare(this.heap[leftChildIndex], this.heap[smallest]) < 0) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.compare(this.heap[rightChildIndex], this.heap[smallest]) < 0) {
                smallest = rightChildIndex;
            }
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
    // Custom comparison logic based on task name lexicographical order
    compare(a, b) {
        return a.value.localeCompare(b.value);
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === "") {
        return;
    }
    const [N, M] = input[0].trim().split(/\s+/).map(Number);
    const taskNames = input[1].trim().split(/\s+/);
    const adj = new Map();
    const inDegree = new Map();
    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const [A, B] = line.split(/\s+/);
        if (adj.has(A) && adj.has(B)) {
            adj.get(A).push(B);
            inDegree.set(B, (inDegree.get(B) || 0) + 1);
        }
    }
    // Use PriorityQueue to ensure lexicographically smallest task is chosen when multiple are ready
    // The PriorityQueue implementation above is adapted to handle string comparison for ordering.
    const pq = new PriorityQueue(null); // The comparator inside PQ handles the logic
    for (const name of taskNames) {
        if (inDegree.get(name) === 0) {
            // Priority is irrelevant for the internal heap structure since we override comparison, 
            // but we pass a dummy value.
            pq.enqueue({ value: name, priority: name.charCodeAt(0) }, 0);
        }
    }
    const buildOrder = [];
    while (!pq.isEmpty()) {
        const currentTask = pq.dequeue();
        const taskName = currentTask.value;
        buildOrder.push(taskName);
        const neighbors = adj.get(taskName) || [];
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                pq.enqueue({ value: neighbor, priority: neighbor.charCodeAt(0) }, 0);
            }
        }
    }
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(buildOrder.join(" "));
    }
}
solve();
