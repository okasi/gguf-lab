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
    constructor(names) {
        this.heap = [-1]; // dummy at index 0
        this.names = names;
    }
    push(v) {
        this.heap.push(v);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length <= 1)
            return undefined;
        const top = this.heap[1];
        const last = this.heap.pop();
        if (this.heap.length > 1) {
            this.heap[1] = last;
            this.bubbleDown(1);
        }
        return top;
    }
    size() {
        return this.heap.length - 1;
    }
    bubbleUp(idx) {
        while (idx > 1) {
            const parent = idx >> 1;
            if (this.names[this.heap[parent]] <= this.names[this.heap[idx]])
                break;
            [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
            idx = parent;
        }
    }
    bubbleDown(idx) {
        const len = this.heap.length;
        while (true) {
            const left = idx << 1;
            const right = left + 1;
            if (left >= len)
                break;
            let smallest = left;
            if (right < len && this.names[this.heap[right]] < this.names[this.heap[left]]) {
                smallest = right;
            }
            if (this.names[this.heap[smallest]] < this.names[this.heap[idx]]) {
                [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
                idx = smallest;
            }
            else
                break;
        }
    }
}
const input = fs.readFileSync(0, 'utf8').trim().split(/\s+/);
let ptr = 0;
const N = parseInt(input[ptr++], 10);
const M = parseInt(input[ptr++], 10);
const names = [];
for (let i = 0; i < N; i++) {
    names.push(input[ptr++]);
}
const nameToIndex = new Map();
for (let i = 0; i < N; i++) {
    nameToIndex.set(names[i], i);
}
const adj = Array.from({ length: N }, () => []);
const indeg = Array(N).fill(0);
for (let i = 0; i < M; i++) {
    const a = input[ptr++];
    const b = input[ptr++];
    const ai = nameToIndex.get(a);
    const bi = nameToIndex.get(b);
    if (ai !== undefined && bi !== undefined) {
        adj[ai].push(bi);
        indeg[bi]++;
    }
}
const heap = new MinHeap(names);
for (let i = 0; i < N; i++) {
    if (indeg[i] === 0)
        heap.push(i);
}
const result = [];
while (heap.size() > 0) {
    const u = heap.pop();
    result.push(u);
    for (const v of adj[u]) {
        indeg[v]--;
        if (indeg[v] === 0)
            heap.push(v);
    }
}
if (result.length !== N) {
    console.log('IMPOSSIBLE');
}
else {
    console.log(result.map(i => names[i]).join(' '));
}
