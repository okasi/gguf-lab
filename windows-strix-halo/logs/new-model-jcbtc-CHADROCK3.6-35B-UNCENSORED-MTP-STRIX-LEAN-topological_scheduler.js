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
class MinBinaryHeap {
    constructor() {
        this.data = [];
    }
    getLeftIndex(i) {
        return 2 * i + 1;
    }
    getRightIndex(i) {
        return 2 * i + 2;
    }
    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    siftUp() {
        let currentIndex = 0;
        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            if (this.data[parentIndex] <= this.data[currentIndex]) {
                break;
            }
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
        }
    }
    siftDown() {
        let currentIndex = 0;
        const length = this.data.length;
        while (this.getLeftIndex(currentIndex) < length) {
            let leftIndex = this.getLeftIndex(currentIndex);
            let rightIndex = this.getRightIndex(currentIndex);
            let smallerIndex = leftIndex;
            if (rightIndex < length && this.data[rightIndex] < this.data[leftIndex]) {
                smallerIndex = rightIndex;
            }
            if (this.data[currentIndex] <= this.data[smallerIndex]) {
                break;
            }
            this.swap(currentIndex, smallerIndex);
            currentIndex = smallerIndex;
        }
    }
    push(item) {
        this.data.push(item);
        this.siftUp();
    }
    pop() {
        if (this.data.length === 0) {
            return undefined;
        }
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown();
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    size() {
        return this.data.length;
    }
}
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    let lineIndex = 0;
    const firstLine = lines[lineIndex++].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);
    const taskNames = lines[lineIndex++].trim().split(/\s+/);
    // Map task name to index
    const nameToIndex = new Map();
    for (let i = 0; i < N; i++) {
        nameToIndex.set(taskNames[i], i);
    }
    // Adjacency list and in-degree array
    const adj = new Array(N).fill(null).map(() => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const edge = lines[lineIndex++].trim().split(/\s+/);
        const fromName = edge[0];
        const toName = edge[1];
        const fromIdx = nameToIndex.get(fromName);
        const toIdx = nameToIndex.get(toName);
        adj[fromIdx].push(toIdx);
        inDegree[toIdx]++;
    }
    const pq = new MinBinaryHeap();
    // Initialize heap with tasks that have no dependencies
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(taskNames[i]);
        }
    }
    const buildOrder = [];
    while (!pq.isEmpty()) {
        const currentName = pq.pop();
        const currentIdx = nameToIndex.get(currentName);
        buildOrder.push(currentName);
        for (const neighborIdx of adj[currentIdx]) {
            inDegree[neighborIdx]--;
            if (inDegree[neighborIdx] === 0) {
                pq.push(taskNames[neighborIdx]);
            }
        }
    }
    if (buildOrder.length !== N) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(buildOrder.join(' '));
    }
}
solve();
