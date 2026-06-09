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
    constructor(less) {
        this.heap = [];
        this.less = less;
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.less(this.heap[idx], this.heap[parent])) {
                [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                idx = parent;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(idx) {
        const n = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.less(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }
            if (right < n && this.less(this.heap[right], this.heap[smallest])) {
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
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [N, M] = lines[0].split(" ").map(Number);
const tasks = lines[1].split(" ");
const adj = [];
const indegree = [];
for (let i = 0; i < N; i++) {
    adj.push([]);
    indegree.push(0);
}
const nameToIdx = new Map();
for (let i = 0; i < N; i++) {
    nameToIdx.set(tasks[i], i);
}
for (let i = 0; i < M; i++) {
    const [a, b] = lines[2 + i].split(" ");
    const u = nameToIdx.get(a);
    const v = nameToIdx.get(b);
    adj[u].push(v);
    indegree[v]++;
}
const heap = new MinHeap((a, b) => tasks[a] < tasks[b]);
for (let i = 0; i < N; i++) {
    if (indegree[i] === 0) {
        heap.push(i);
    }
}
const result = [];
while (!heap.isEmpty()) {
    const u = heap.pop();
    result.push(tasks[u]);
    for (const v of adj[u]) {
        indegree[v]--;
        if (indegree[v] === 0) {
            heap.push(v);
        }
    }
}
if (result.length < N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(result.join(" "));
}
