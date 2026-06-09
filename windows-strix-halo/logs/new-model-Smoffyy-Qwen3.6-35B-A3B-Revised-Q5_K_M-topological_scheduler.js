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
        this.tasks = tasks;
        this.data = [];
    }
    push(val) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            throw new Error("Heap empty");
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    siftUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.compare(i, parent) >= 0)
                break;
            [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
            i = parent;
        }
    }
    siftDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.compare(left, smallest) < 0)
                smallest = left;
            if (right < n && this.compare(right, smallest) < 0)
                smallest = right;
            if (smallest === i)
                break;
            [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
            i = smallest;
        }
    }
    compare(i, j) {
        const a = this.tasks[this.data[i]];
        const b = this.tasks[this.data[j]];
        return a < b ? -1 : a > b ? 1 : 0;
    }
}
const input = fs.readFileSync(0, "utf8").trim();
if (!input)
    process.exit(0);
const tokens = input.split(/\s+/);
let ptr = 0;
const N = Number(tokens[ptr++]);
const M = Number(tokens[ptr++]);
const tasks = [];
const taskToIdx = new Map();
for (let i = 0; i < N; i++) {
    tasks.push(tokens[ptr++]);
    taskToIdx.set(tasks[i], i);
}
const adj = Array.from({ length: N }, () => []);
const inDegree = new Array(N).fill(0);
for (let i = 0; i < M; i++) {
    const u = taskToIdx.get(tokens[ptr++]);
    const v = taskToIdx.get(tokens[ptr++]);
    adj[u].push(v);
    inDegree[v]++;
}
const heap = new MinHeap(tasks);
for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0)
        heap.push(i);
}
const result = [];
while (!heap.isEmpty()) {
    const u = heap.pop();
    result.push(tasks[u]);
    for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
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
