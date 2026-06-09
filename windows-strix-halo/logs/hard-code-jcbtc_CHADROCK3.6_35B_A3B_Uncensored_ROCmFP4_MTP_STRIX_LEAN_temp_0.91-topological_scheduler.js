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
// Binary Min-Heap implementation for lexicographical ordering
class MinHeap {
    constructor() {
        this.data = [];
    }
    get size() {
        return this.data.length;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0) {
            return undefined;
        }
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return root;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.data[index] < this.data[parentIndex]) {
                this.swap(index, parentIndex);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < length && this.data[right] < this.data[smallest]) {
                smallest = right;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            }
            else {
                break;
            }
        }
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split("\n");
    if (lines.length < 2) {
        return;
    }
    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);
    const secondLine = lines[1].trim().split(/\s+/);
    const tasks = secondLine;
    // Map task name to index
    const taskToIndex = new Map();
    for (let i = 0; i < N; i++) {
        taskToIndex.set(tasks[i], i);
    }
    // Adjacency list and in-degree array
    const adj = new Array(N).fill(null).map(() => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 2; i < 2 + M; i++) {
        const line = lines[i].trim().split(/\s+/);
        const aName = line[0];
        const bName = line[1];
        const aIdx = taskToIndex.get(aName);
        const bIdx = taskToIndex.get(bName);
        if (aIdx !== undefined && bIdx !== undefined) {
            adj[aIdx].push(bIdx);
            inDegree[bIdx]++;
        }
    }
    const heap = new MinHeap();
    // Initialize heap with tasks having in-degree 0
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const currentTask = heap.pop();
        if (currentTask === undefined) {
            break;
        }
        const currentIndex = taskToIndex.get(currentTask);
        result.push(currentTask);
        // Process neighbors
        const neighbors = adj[currentIndex];
        for (let j = 0; j < neighbors.length; j++) {
            const neighbor = neighbors[j];
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                heap.push(tasks[neighbor]);
            }
        }
    }
    if (result.length !== N) {
        process.stdout.write("IMPOSSIBLE\n");
    }
    else {
        process.stdout.write(result.join(" ") + "\n");
    }
}
solve();
