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
    constructor(tasks) {
        this.data = [];
        this.tasks = tasks;
    }
    compare(a, b) {
        return this.tasks[a] < this.tasks[b];
    }
    size() {
        return this.data.length;
    }
    push(item) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            throw new Error("Heap is empty");
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return root;
    }
    siftUp(index) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.compare(this.data[index], this.data[parent])) {
                [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
                index = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(index) {
        const n = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.compare(this.data[left], this.data[smallest])) {
                smallest = left;
            }
            if (right < n && this.compare(this.data[right], this.data[smallest])) {
                smallest = right;
            }
            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(/\s+/).map(Number);
    const tasks = lines[1].trim().split(/\s+/);
    const taskToIndex = new Map();
    for (let i = 0; i < N; i++) {
        taskToIndex.set(tasks[i], i);
    }
    const adj = new Array(N);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
        adj[i] = [];
    }
    for (let i = 2; i < 2 + M; i++) {
        const [u, v] = lines[i].trim().split(/\s+/);
        const uIdx = taskToIndex.get(u);
        const vIdx = taskToIndex.get(v);
        adj[uIdx].push(vIdx);
        inDegree[vIdx]++;
    }
    const heap = new MinHeap(tasks);
    const result = [];
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(i);
        }
    }
    while (heap.size() > 0) {
        const idx = heap.pop();
        result.push(tasks[idx]);
        for (const next of adj[idx]) {
            inDegree[next]--;
            if (inDegree[next] === 0) {
                heap.push(next);
            }
        }
    }
    if (result.length < N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(' '));
    }
}
main();
