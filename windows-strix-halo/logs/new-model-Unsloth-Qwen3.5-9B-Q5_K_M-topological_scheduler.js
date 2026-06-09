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
        this.heap = [];
    }
    insert(value) {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }
    extract() {
        if (this.heap.length === 0)
            return undefined;
        const result = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return result;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] > this.heap[index]) {
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        const length = this.heap.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;
            if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest]) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest]) {
                smallest = rightIndex;
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
}
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [N, M] = input[0].split(' ').map(Number);
const taskNames = input[1].split(' ');
const taskToIndex = new Map();
taskNames.forEach((name, i) => taskToIndex.set(name, i));
const graph = new Array(N);
const inDegree = new Array(N);
for (let i = 0; i < N; i++) {
    graph[i] = new Set();
    inDegree[i] = 0;
}
for (let i = 2; i < input.length; i++) {
    const [A, B] = input[i].split(' ').map(Number);
    graph[A].add(B);
    inDegree[B]++;
}
const heap = new MinHeap();
for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
        heap.insert(i);
    }
}
const result = [];
let processedCount = 0;
while (!heap.isEmpty()) {
    const taskIndex = heap.extract();
    result.push(taskNames[taskIndex]);
    processedCount++;
    for (const neighbor of graph[taskIndex]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
            heap.insert(neighbor);
        }
    }
}
if (processedCount < N) {
    process.stdout.write('IMPOSSIBLE\n');
}
else {
    process.stdout.write(result.join(' ') + '\n');
}
