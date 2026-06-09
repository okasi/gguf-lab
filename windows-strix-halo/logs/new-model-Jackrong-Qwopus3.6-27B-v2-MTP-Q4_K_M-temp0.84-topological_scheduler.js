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
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
    heapifyUp(i) {
        while (i > 0 && this.data[i] < this.data[this.parent(i)]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }
    heapifyDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest]) {
                smallest = l;
            }
            if (r < n && this.data[r] < this.data[smallest]) {
                smallest = r;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            }
            else {
                break;
            }
        }
    }
    push(val) {
        this.data.push(val);
        this.heapifyUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        this.data[0] = this.data[this.data.length - 1];
        this.data.pop();
        if (this.data.length > 0) {
            this.heapifyDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);
    const tasks = lines[1].split(/\s+/);
    const nameToIdx = new Map();
    for (let i = 0; i < N; i++) {
        nameToIdx.set(tasks[i], i);
    }
    const adj = Array.from({ length: N }, () => []);
    const indegree = new Array(N).fill(0);
    for (let i = 2; i < 2 + M; i++) {
        const parts = lines[i].split(/\s+/);
        const a = parts[0];
        const b = parts[1];
        const u = nameToIdx.get(a);
        const v = nameToIdx.get(b);
        adj[u].push(v);
        indegree[v]++;
    }
    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (indegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const task = heap.pop();
        result.push(task);
        const idx = nameToIdx.get(task);
        for (const neighbor of adj[idx]) {
            indegree[neighbor]--;
            if (indegree[neighbor] === 0) {
                heap.push(tasks[neighbor]);
            }
        }
    }
    if (result.length < N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(" "));
    }
}
main();
