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
    constructor(cmp) {
        this.data = [];
        this.cmp = cmp;
    }
    push(val) {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    size() {
        return this.data.length;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.cmp(this.data[idx], this.data[parent]) >= 0)
                break;
            [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
            idx = parent;
        }
    }
    bubbleDown(idx) {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.cmp(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this.cmp(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === idx)
                break;
            [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
            idx = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split('\n');
    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);
    const taskNames = lines[1].trim().split(/\s+/);
    const nameToIdx = new Map();
    for (let i = 0; i < N; i++) {
        nameToIdx.set(taskNames[i], i);
    }
    const adj = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const line = lines[2 + i].trim().split(/\s+/);
        const u = nameToIdx.get(line[0]);
        const v = nameToIdx.get(line[1]);
        adj[u].push(v);
        inDegree[v]++;
    }
    const heap = new MinHeap((a, b) => a.localeCompare(b));
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(taskNames[i]);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const task = heap.pop();
        result.push(task);
        const idx = nameToIdx.get(task);
        for (const neighbor of adj[idx]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                heap.push(taskNames[neighbor]);
            }
        }
    }
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(' '));
    }
}
solve();
