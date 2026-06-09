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
    push(val) {
        this.heap.push(val);
        this.bubbleUp();
    }
    pop() {
        if (this.size() === 0)
            return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.size() > 0) {
            this.heap[0] = bottom;
            this.bubbleDown();
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let parentIdx = (idx - 1) >> 1;
            if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            }
            else
                break;
        }
    }
    bubbleDown() {
        let idx = 0;
        const length = this.heap.length;
        while (true) {
            let left = (idx << 1) + 1;
            let right = (idx << 1) + 2;
            let swap = -1;
            if (left < length) {
                if (this.compare(this.heap[left], this.heap[idx]) < 0) {
                    swap = left;
                }
            }
            if (right < length) {
                if ((swap === -1 && this.compare(this.heap[right], this.heap[idx]) < 0) ||
                    (swap !== -1 && this.compare(this.heap[right], this.heap[left]) < 0)) {
                    swap = right;
                }
            }
            if (swap === -1)
                break;
            [this.heap[idx], this.heap[swap]] = [this.heap[swap], this.heap[idx]];
            idx = swap;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.split(/\s+/);
    let cursor = 0;
    if (tokens[cursor] === "")
        cursor++;
    if (cursor >= tokens.length)
        return;
    const N = parseInt(tokens[cursor++]);
    const M = parseInt(tokens[cursor++]);
    if (isNaN(N))
        return;
    const taskNames = [];
    const nameToIndex = new Map();
    for (let i = 0; i < N; i++) {
        const name = tokens[cursor++];
        taskNames.push(name);
        nameToIndex.set(name, i);
    }
    const adj = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const uName = tokens[cursor++];
        const vName = tokens[cursor++];
        const u = nameToIndex.get(uName);
        const v = nameToIndex.get(vName);
        adj[u].push(v);
        inDegree[v]++;
    }
    const pq = new MinHeap((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    // We need to map indices to names for the priority queue to ensure lexicographical order
    // But the problem says "choose the lexicographically smallest task name".
    // So we push the names directly into the MinHeap.
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(taskNames[i]);
        }
    }
    const result = [];
    const nameToIndexRef = new Map();
    // Re-mapping isn't needed if we use names in PQ, but we need to update in-degrees of neighbors
    // To do that efficiently, we need the index. Let's store {name, index} in PQ.
}
// Refined solve to handle object in Heap
function solveCorrect() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.split(/\s+/);
    let cursor = 0;
    while (cursor < tokens.length && tokens[cursor] === "")
        cursor++;
    if (cursor >= tokens.length)
        return;
    const N = parseInt(tokens[cursor++]);
    const M = parseInt(tokens[cursor++]);
    const taskNames = [];
    const nameToIndex = new Map();
    for (let i = 0; i < N; i++) {
        const name = tokens[cursor++];
        taskNames.push(name);
        nameToIndex.set(name, i);
    }
    const adj = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const uName = tokens[cursor++];
        const vName = tokens[cursor++];
        const u = nameToIndex.get(uName);
        const v = nameToIndex.get(vName);
        adj[u].push(v);
        inDegree[v]++;
    }
    const pq = new MinHeap((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push({ name: taskNames[i], index: i });
        }
    }
    const result = [];
    while (pq.size() > 0) {
        const curr = pq.pop();
        result.push(curr.name);
        for (const neighborIdx of adj[curr.index]) {
            inDegree[neighborIdx]--;
            if (inDegree[neighborIdx] === 0) {
                pq.push({ name: taskNames[neighborIdx], index: neighborIdx });
            }
        }
    }
    if (result.length === N) {
        process.stdout.write(result.join(" ") + "\n");
    }
    else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}
solveCorrect();
