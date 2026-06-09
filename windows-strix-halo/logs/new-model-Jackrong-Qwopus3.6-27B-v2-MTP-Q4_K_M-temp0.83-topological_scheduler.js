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
    parent(i) {
        return (i - 1) >> 1;
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    siftUp(i) {
        while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }
    siftDown(i) {
        const n = this.heap.length;
        let smallest = i;
        const l = this.left(i);
        const r = this.right(i);
        if (l < n && this.heap[l] < this.heap[smallest]) {
            smallest = l;
        }
        if (r < n && this.heap[r] < this.heap[smallest]) {
            smallest = r;
        }
        if (smallest !== i) {
            this.swap(i, smallest);
            this.siftDown(smallest);
        }
    }
    insert(val) {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }
    extractMin() {
        if (this.heap.length === 0)
            return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return min;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [N, M] = lines[0].split(' ').map(Number);
    const tasks = lines[1].split(' ');
    const adj = new Map();
    const indegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        indegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const [a, b] = lines[2 + i].split(' ');
        adj.get(a).push(b);
        indegree.set(b, indegree.get(b) + 1);
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (indegree.get(task) === 0) {
            heap.insert(task);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const task = heap.extractMin();
        result.push(task);
        for (const neighbor of adj.get(task)) {
            indegree.set(neighbor, indegree.get(neighbor) - 1);
            if (indegree.get(neighbor) === 0) {
                heap.insert(neighbor);
            }
        }
    }
    if (result.length !== N) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(result.join(' '));
    }
}
main();
