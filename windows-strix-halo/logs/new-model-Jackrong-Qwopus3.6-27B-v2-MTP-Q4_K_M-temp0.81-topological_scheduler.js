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
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    bubbleUp(i) {
        while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }
    sinkDown(i) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.heap[l] < this.heap[smallest])
                smallest = l;
            if (r < n && this.heap[r] < this.heap[smallest])
                smallest = r;
            if (smallest === i)
                break;
            this.swap(i, smallest);
            i = smallest;
        }
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const [N, M] = lines[0].split(' ').map(Number);
const tasks = lines[1].split(' ');
const adj = new Map();
const inDegree = new Map();
for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}
for (let i = 0; i < M; i++) {
    const [A, B] = lines[2 + i].split(' ');
    adj.get(A).push(B);
    inDegree.set(B, inDegree.get(B) + 1);
}
const heap = new MinHeap();
for (const t of tasks) {
    if (inDegree.get(t) === 0) {
        heap.push(t);
    }
}
const result = [];
while (!heap.isEmpty()) {
    const task = heap.pop();
    result.push(task);
    for (const neighbor of adj.get(task)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
            heap.push(neighbor);
        }
    }
}
if (result.length < N) {
    console.log('IMPOSSIBLE');
}
else {
    console.log(result.join(' '));
}
