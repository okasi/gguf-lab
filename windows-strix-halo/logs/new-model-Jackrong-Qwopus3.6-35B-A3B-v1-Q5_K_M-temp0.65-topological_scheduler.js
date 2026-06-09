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
// Custom Min-Heap implementation for lexicographical ordering
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(item) {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.siftDown(0);
        return top;
    }
    get isEmpty() {
        return this.heap.length === 0;
    }
    siftUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[i] < this.heap[parent]) {
                const temp = this.heap[i];
                this.heap[i] = this.heap[parent];
                this.heap[parent] = temp;
                i = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(i) {
        const n = this.heap.length;
        while (2 * i + 1 < n) {
            let j = 2 * i + 1;
            if (j + 1 < n && this.heap[j + 1] < this.heap[j]) {
                j++;
            }
            if (this.heap[i] > this.heap[j]) {
                const temp = this.heap[i];
                this.heap[i] = this.heap[j];
                this.heap[j] = temp;
                i = j;
            }
            else {
                break;
            }
        }
    }
}
function main() {
    const lines = fs.readFileSync(0, "utf8").trim().split("\n").filter(l => l.trim().length > 0);
    const [N, M] = lines[0].trim().split(" ").map(Number);
    const tasks = lines[1].trim().split(" ");
    const nameToIndex = new Map();
    for (let i = 0; i < N; i++) {
        nameToIndex.set(tasks[i], i);
    }
    const adj = new Array(N).fill(null).map(() => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const [a, b] = lines[2 + i].trim().split(" ");
        const u = nameToIndex.get(a);
        const v = nameToIndex.get(b);
        adj[u].push(v);
        inDegree[v]++;
    }
    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }
    const result = [];
    while (!heap.isEmpty) {
        const u = heap.pop();
        result.push(u);
        const uIdx = nameToIndex.get(u);
        for (let j = 0; j < adj[uIdx].length; j++) {
            const v = adj[uIdx][j];
            inDegree[v]--;
            if (inDegree[v] === 0) {
                heap.push(tasks[v]);
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
