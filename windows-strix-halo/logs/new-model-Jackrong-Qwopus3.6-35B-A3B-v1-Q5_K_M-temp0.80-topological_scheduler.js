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
    push(val) {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    peek() {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }
    get size() {
        return this.heap.length;
    }
    siftUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.heap[parent] > this.heap[idx]) {
                const temp = this.heap[parent];
                this.heap[parent] = this.heap[idx];
                this.heap[idx] = temp;
                idx = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(idx) {
        const n = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < n && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== idx) {
                const temp = this.heap[idx];
                this.heap[idx] = this.heap[smallest];
                this.heap[smallest] = temp;
                idx = smallest;
            }
            else {
                break;
            }
        }
    }
}
const input = fs.readFileSync(0, "utf8").trim();
if (!input) {
    process.exit(0);
}
const lines = input.split("\n");
const [N, M] = lines[0].trim().split(/\s+/).map(Number);
const tasks = lines[1].trim().split(/\s+/);
const sortedTasks = [...tasks].sort();
const idToTask = new Array(N);
const taskToId = new Map();
for (let i = 0; i < N; i++) {
    idToTask[i] = sortedTasks[i];
    taskToId.set(sortedTasks[i], i);
}
const adj = new Array(N).fill(null).map(() => []);
const inDegree = new Array(N).fill(0);
for (let i = 0; i < M; i++) {
    const parts = lines[i + 2].trim().split(/\s+/);
    const u = taskToId.get(parts[0]);
    const v = taskToId.get(parts[1]);
    if (u !== undefined && v !== undefined) {
        adj[u].push(v);
        inDegree[v]++;
    }
}
const pq = new MinHeap();
for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
        pq.push(i);
    }
}
const result = [];
while (pq.size > 0) {
    const u = pq.pop();
    result.push(u);
    for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
            pq.push(v);
        }
    }
}
if (result.length < N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(result.map(id => idToTask[id]).join(" "));
}
