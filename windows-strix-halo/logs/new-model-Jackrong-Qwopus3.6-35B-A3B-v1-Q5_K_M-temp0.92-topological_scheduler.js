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
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    leftChild(i) {
        return 2 * i + 1;
    }
    rightChild(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    push(task) {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return null;
        if (this.heap.length === 1)
            return this.heap.pop() ?? null;
        const min = this.heap[0];
        this.heap[0] = this.heap.pop() ?? null;
        this.bubbleDown(0);
        return min;
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.heap[i] < this.heap[p]) {
                this.swap(i, p);
                i = p;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(i) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.leftChild(i);
            const r = this.rightChild(i);
            if (l < n && this.heap[l] < this.heap[smallest]) {
                smallest = l;
            }
            if (r < n && this.heap[r] < this.heap[smallest]) {
                smallest = r;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            }
            else {
                break;
            }
        }
    }
}
const input = fs.readFileSync(0, "utf8").trim();
if (!input)
    process.exit(0);
const tokens = input.split(/\s+/);
let idx = 0;
const N = parseInt(tokens[idx++], 10);
const M = parseInt(tokens[idx++], 10);
const tasks = new Array(N);
for (let i = 0; i < N; i++) {
    tasks[i] = tokens[idx++];
}
const adj = new Map();
const inDegree = new Map();
for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}
for (let i = 0; i < M; i++) {
    const A = tokens[idx++];
    const B = tokens[idx++];
    adj.get(A).push(B);
    inDegree.set(B, (inDegree.get(B) ?? 0) + 1);
}
const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}
const result = [];
while (!pq.isEmpty()) {
    const task = pq.pop();
    result.push(task);
    for (const dependent of adj.get(task)) {
        const deg = inDegree.get(dependent) - 1;
        inDegree.set(dependent, deg);
        if (deg === 0) {
            pq.push(dependent);
        }
    }
}
if (result.length < N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(result.join(" "));
}
