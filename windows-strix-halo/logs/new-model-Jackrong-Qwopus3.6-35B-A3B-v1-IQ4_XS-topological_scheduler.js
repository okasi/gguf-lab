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
        this.size = 0;
    }
    compare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        while (index < this.size) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;
            if (leftChild < this.size && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild < this.size && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
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
    push(val) {
        this.heap[this.size] = val;
        this.size++;
        this.bubbleUp(this.size - 1);
    }
    pop() {
        if (this.size === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap[this.size - 1];
        this.size--;
        this.heap[this.size] = last;
        this.bubbleDown(0);
        return top;
    }
    isEmpty() {
        return this.size === 0;
    }
}
const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split('\n');
if (lines.length === 0) {
    console.log("");
    process.exit(0);
}
const firstLine = lines[0].trim().split(/\s+/);
const N = parseInt(firstLine[0], 10);
const M = parseInt(firstLine[1], 10);
const secondLine = lines[1].trim().split(/\s+/);
const tasks = secondLine.slice(0, N);
const adj = new Map();
const inDegree = new Map();
for (const task of tasks) {
    adj.set(task, new Set());
    inDegree.set(task, 0);
}
for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].trim().split(/\s+/);
    const from = parts[0];
    const to = parts[1];
    if (adj.has(from) && adj.has(to)) {
        adj.get(from).add(to);
        inDegree.set(to, inDegree.get(to) + 1);
    }
}
const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}
const result = [];
while (!pq.isEmpty()) {
    const curr = pq.pop();
    result.push(curr);
    for (const next of adj.get(curr)) {
        inDegree.set(next, inDegree.get(next) - 1);
        if (inDegree.get(next) === 0) {
            pq.push(next);
        }
    }
}
if (result.length < N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(result.join(' '));
}
