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
    size() {
        return this.data.length;
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.cmp(this.data[idx], this.data[parent]) < 0) {
                [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
                idx = parent;
            }
            else
                break;
        }
    }
    bubbleDown(idx) {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = idx * 2 + 1;
            const right = left + 1;
            if (left < n && this.cmp(this.data[left], this.data[smallest]) < 0)
                smallest = left;
            if (right < n && this.cmp(this.data[right], this.data[smallest]) < 0)
                smallest = right;
            if (smallest !== idx) {
                [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
                idx = smallest;
            }
            else
                break;
        }
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
if (input.length === 0)
    process.exit(0);
const tokens = input.split(/\s+/);
let pos = 0;
const N = parseInt(tokens[pos++], 10);
const M = parseInt(tokens[pos++], 10);
const names = [];
for (let i = 0; i < N; i++)
    names.push(tokens[pos++]);
const nameToIndex = new Map();
for (let i = 0; i < N; i++)
    nameToIndex.set(names[i], i);
const adj = Array.from({ length: N }, () => []);
const indeg = Array(N).fill(0);
for (let i = 0; i < M; i++) {
    const a = tokens[pos++];
    const b = tokens[pos++];
    const u = nameToIndex.get(a);
    const v = nameToIndex.get(b);
    adj[u].push(v);
    indeg[v]++;
}
const heap = new MinHeap((a, b) => {
    const na = names[a];
    const nb = names[b];
    if (na < nb)
        return -1;
    if (na > nb)
        return 1;
    return 0;
});
for (let i = 0; i < N; i++) {
    if (indeg[i] === 0)
        heap.push(i);
}
const result = [];
while (heap.size() > 0) {
    const u = heap.pop();
    result.push(names[u]);
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
    console.log(result.join(' '));
}
