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
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    peek() {
        return this.heap[0];
    }
    push(item) {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this.siftDown(0);
        }
        return top;
    }
    siftUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            }
            else {
                break;
            }
        }
    }
    siftDown(idx) {
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    const [N, M] = input[0].trim().split(" ").filter(Boolean).map(Number);
    const tasks = input[1].trim().split(" ").filter(Boolean);
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const parts = input[i + 2].trim().split(" ").filter(Boolean);
        const A = parts[0];
        const B = parts[1];
        adj.get(A).push(B);
        inDegree.set(B, inDegree.get(B) + 1);
    }
    const pq = new MinHeap((a, b) => a.localeCompare(b));
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const result = [];
    while (!pq.isEmpty()) {
        const u = pq.pop();
        result.push(u);
        for (const v of adj.get(u)) {
            inDegree.set(v, inDegree.get(v) - 1);
            if (inDegree.get(v) === 0) {
                pq.push(v);
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
