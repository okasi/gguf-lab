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
        this.compare = compare;
        this.heap = [];
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp();
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
        return top;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.compare(this.heap[index], this.heap[parent]) < 0) {
                const tmp = this.heap[index];
                this.heap[index] = this.heap[parent];
                this.heap[parent] = tmp;
                index = parent;
            }
            else
                break;
        }
    }
    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            let smallest = index;
            const left = (index << 1) + 1;
            const right = (index << 1) + 2;
            if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0)
                smallest = left;
            if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0)
                smallest = right;
            if (smallest !== index) {
                const tmp = this.heap[index];
                this.heap[index] = this.heap[smallest];
                this.heap[smallest] = tmp;
                index = smallest;
            }
            else
                break;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.split(/\s+/).filter(s => s !== "");
    if (tokens.length === 0)
        return;
    let idx = 0;
    const n = parseInt(tokens[idx++], 10);
    const m = parseInt(tokens[idx++], 10);
    if (isNaN(n))
        return;
    const tasks = [];
    for (let i = 0; i < n; i++) {
        tasks.push(tokens[idx++]);
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }
    for (let i = 0; i < m; i++) {
        const u = tokens[idx++];
        const v = tokens[idx++];
        if (u !== undefined && v !== undefined) {
            if (adj.has(u)) {
                adj.get(u).push(v);
                inDegree.set(v, (inDegree.get(v) || 0) + 1);
            }
        }
    }
    const pq = new MinHeap((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            pq.push(t);
        }
    }
    const result = [];
    while (pq.size() > 0) {
        const u = pq.pop();
        result.push(u);
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            const currentInDegree = inDegree.get(v) - 1;
            inDegree.set(v, currentInDegree);
            if (currentInDegree === 0) {
                pq.push(v);
            }
        }
    }
    if (result.length === n) {
        process.stdout.write(result.join(" ") + "\n");
    }
    else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}
solve();
