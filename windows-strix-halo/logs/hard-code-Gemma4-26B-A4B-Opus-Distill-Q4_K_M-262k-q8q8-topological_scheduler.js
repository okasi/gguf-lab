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
/**
 * Min-Heap implementation for Priority Queue to achieve O(log N) insertion/extraction.
 * This ensures we always pick the lexicographically smallest task next.
 */
class MinHeap {
    constructor(compare) {
        this.heap = [];
        this.compare = compare;
    }
    push(val) {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0 && bottom !== undefined) {
            this.heap[0] = bottom;
            this.siftDown(0);
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
    siftUp(index) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.compare(this.heap[index], this.heap[parent]) < 0) {
                this.swap(index, parent);
                index = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(index) {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            }
            else {
                break;
            }
        }
    }
    swap(i, j) {
        const tmp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = tmp;
    }
}
function solve() {
    const input = fs.readFileSync(0, 'utf8');
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
    const tasks = [];
    const inDegree = new Map();
    const adj = new Map();
    for (let i = 0; i < N; i++) {
        const name = tokens[cursor++];
        tasks.push(name);
        inDegree.set(name, 0);
        adj.set(name, []);
    }
    for (let i = 0; i < M; i++) {
        const u = tokens[cursor++];
        const v = tokens[cursor++];
        // u must be completed before v (u -> v)
        const neighbors = adj.get(u);
        if (neighbors) {
            neighbors.push(v);
            inDegree.set(v, (inDegree.get(v) || 0) + 1);
        }
    }
    // Priority Queue stores tasks with in-degree 0, sorted lexicographically
    const pq = new MinHeap((a, b) => a < b ? -1 : (a > b ? 1 : 0));
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const result = [];
    while (pq.size() > 0) {
        const u = pq.pop();
        result.push(u);
        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                const newDegree = (inDegree.get(v) || 0) - 1;
                inDegree.set(v, newDegree);
                if (newDegree === 0) {
                    pq.push(v);
                }
            }
        }
    }
    if (result.length === N) {
        process.stdout.write(result.join(' ') + '\n');
    }
    else {
        process.stdout.write('IMPOSSIBLE\n');
    }
}
solve();
