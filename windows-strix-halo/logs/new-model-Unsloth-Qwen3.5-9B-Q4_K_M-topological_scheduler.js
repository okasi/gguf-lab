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
    isEmpty() {
        return this.heap.length === 0;
    }
    peek() {
        return this.heap[0];
    }
    pop() {
        if (this.isEmpty()) {
            throw new Error('Heap is empty');
        }
        const result = this.heap[0];
        const last = this.heap[this.heap.length - 1];
        this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return result;
    }
    push(item) {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }
    siftUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parent]) {
                [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
                index = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(index) {
        const length = this.heap.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;
            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest === index) {
                break;
            }
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}
function main() {
    const data = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (data.length < 2) {
        console.log('IMPOSSIBLE');
        return;
    }
    const [N, M] = data[0].split(' ').map(Number);
    const tasks = data[1].split(' ').map((t) => t.trim());
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        if (!adj.has(task)) {
            adj.set(task, new Set());
        }
        if (!inDegree.has(task)) {
            inDegree.set(task, 0);
        }
    }
    for (let i = 2; i < data.length; i++) {
        const line = data[i].trim();
        if (!line)
            continue;
        const [A, B] = line.split(' ').map((t) => t.trim());
        if (!adj.has(A) || !adj.has(B))
            continue;
        adj.get(A).add(B);
        inDegree.set(B, (inDegree.get(B) ?? 0) + 1);
    }
    const heap = new MinHeap();
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const task = heap.pop();
        result.push(task);
        const neighbors = adj.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
                if (newDegree === 0) {
                    heap.push(neighbor);
                    inDegree.set(neighbor, newDegree);
                }
            }
        }
    }
    if (result.length < N) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(result.join(' '));
    }
}
main();
