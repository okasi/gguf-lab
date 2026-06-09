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
class MinHeap {
    constructor() {
        this.data = [];
    }
    size() {
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
        if (this.isEmpty()) {
            return undefined;
        }
        const top = this.data[0];
        const last = this.data.pop();
        if (!this.isEmpty() && last !== undefined) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    peek() {
        return this.isEmpty() ? undefined : this.data[0];
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.compare(this.data[index], this.data[parentIndex]) >= 0) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    sinkDown(index) {
        const length = this.data.length;
        while (true) {
            let leftChild = 2 * index + 1;
            let rightChild = 2 * index + 2;
            let smallest = index;
            if (leftChild < length && this.compare(this.data[leftChild], this.data[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild < length && this.compare(this.data[rightChild], this.data[smallest]) < 0) {
                smallest = rightChild;
            }
            if (smallest === index) {
                break;
            }
            this.swap(index, smallest);
            index = smallest;
        }
    }
    compare(a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    let lineIndex = 0;
    const firstLine = input[lineIndex++].split(/\s+/).map(Number);
    const N = firstLine[0];
    const M = firstLine[1];
    const taskNamesLine = input[lineIndex++].split(/\s+/);
    const taskNames = taskNamesLine;
    // Map task name to index 0..N-1
    const nameToIndex = new Map();
    for (let i = 0; i < N; i++) {
        nameToIndex.set(taskNames[i], i);
    }
    // Adjacency list and in-degree array
    const adj = new Array(N);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
        adj[i] = [];
    }
    for (let i = 0; i < M; i++) {
        const parts = input[lineIndex++].split(/\s+/);
        const aName = parts[0];
        const bName = parts[1];
        const a = nameToIndex.get(aName);
        const b = nameToIndex.get(bName);
        adj[a].push(b);
        inDegree[b]++;
    }
    const pq = new MinHeap();
    // Initialize heap with tasks that have in-degree 0
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(taskNames[i]);
        }
    }
    const result = [];
    while (!pq.isEmpty()) {
        const currentName = pq.pop();
        const currentIndex = nameToIndex.get(currentName);
        result.push(currentName);
        for (const neighbor of adj[currentIndex]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                pq.push(taskNames[neighbor]);
            }
        }
    }
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(" "));
    }
}
solve();
