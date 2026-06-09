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
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) {
            throw new Error("Cannot pop from empty heap");
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== top) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    peek() {
        return this.heap[0];
    }
    get size() {
        return this.heap.length;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parentIdx = Math.floor((i - 1) / 2);
            if (this.heap[i] < this.heap[parentIdx]) {
                [this.heap[i], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[i]];
                i = parentIdx;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(i) {
        const length = this.heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length === 0)
        return;
    const lines = input.split("\n");
    const [N_str, M_str] = lines[0].split(" ");
    const N = parseInt(N_str, 10);
    const M = parseInt(M_str, 10);
    const tasks = N > 0 ? lines[1].split(" ") : [];
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, new Set());
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const edgeLine = lines[1 + i + 1];
        if (!edgeLine)
            continue;
        const [A, B] = edgeLine.split(" ");
        if (!adj.has(A))
            adj.set(A, new Set());
        if (!adj.has(B))
            adj.set(B, new Set());
        if (!adj.get(A).has(B)) {
            adj.get(A).add(B);
            inDegree.set(B, (inDegree.get(B) || 0) + 1);
        }
    }
    const pq = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const result = [];
    while (pq.size > 0) {
        const task = pq.pop();
        result.push(task);
        const neighbors = adj.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const deg = inDegree.get(neighbor);
                if (deg !== undefined) {
                    inDegree.set(neighbor, deg - 1);
                    if (deg - 1 === 0) {
                        pq.push(neighbor);
                    }
                }
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
solve();
