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
    constructor(compare) {
        this.heap = [];
        this.compare = compare;
    }
    get size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return top;
    }
    peek() {
        return this.heap[0];
    }
    bubbleUp(index) {
        const item = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (this.compare(item, parent) >= 0) {
                break;
            }
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = item;
    }
    sinkDown(index) {
        const length = this.heap.length;
        const item = this.heap[index];
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let swapIndex = null;
            if (leftIndex < length) {
                const left = this.heap[leftIndex];
                if (this.compare(item, left) > 0) {
                    swapIndex = leftIndex;
                }
            }
            if (rightIndex < length) {
                const right = this.heap[rightIndex];
                if (swapIndex === null || this.compare(right, this.heap[swapIndex]) < 0) {
                    swapIndex = rightIndex;
                }
            }
            if (swapIndex === null) {
                break;
            }
            this.heap[index] = this.heap[swapIndex];
            index = swapIndex;
        }
        this.heap[index] = item;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    let lineIndex = 0;
    const [N_str, M_str] = lines[lineIndex++].split(' ');
    const N = parseInt(N_str, 10);
    const M = parseInt(M_str, 10);
    const tasks = lines[lineIndex++].split(' ');
    const inDegree = new Map();
    const adjList = new Map();
    for (const task of tasks) {
        inDegree.set(task, 0);
        adjList.set(task, []);
    }
    for (let i = 0; i < M; i++) {
        const parts = lines[lineIndex++].split(' ');
        const from = parts[0];
        const to = parts[1];
        adjList.get(from).push(to);
        inDegree.set(to, inDegree.get(to) + 1);
    }
    const pq = new MinHeap((a, b) => a.localeCompare(b));
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const order = [];
    let processedCount = 0;
    while (!pq.isEmpty()) {
        const current = pq.pop();
        order.push(current);
        processedCount++;
        const neighbors = adjList.get(current);
        for (const neighbor of neighbors) {
            const deg = inDegree.get(neighbor) - 1;
            inDegree.set(neighbor, deg);
            if (deg === 0) {
                pq.push(neighbor);
            }
        }
    }
    if (processedCount !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(order.join(' '));
    }
}
solve();
