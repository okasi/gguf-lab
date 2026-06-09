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
        this.data = [];
    }
    parent(i) { return (i - 1) >> 1; }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }
    swap(i, j) {
        const tmp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = tmp;
    }
    push(val) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return null;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    get size() { return this.data.length; }
    get isEmpty() { return this.data.length === 0; }
    siftUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p] > this.data[i]) {
                this.swap(i, p);
                i = p;
            }
            else
                break;
        }
    }
    siftDown(i) {
        const n = this.data.length;
        while (true) {
            const l = this.left(i);
            const r = this.right(i);
            let smallest = i;
            if (l < n && this.data[l] < this.data[smallest])
                smallest = l;
            if (r < n && this.data[r] < this.data[smallest])
                smallest = r;
            if (smallest === i)
                break;
            this.swap(i, smallest);
            i = smallest;
        }
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const firstLine = lines[0].split(/\s+/);
const N = parseInt(firstLine[0], 10);
const M = parseInt(firstLine[1], 10);
const tasks = lines[1].split(/\s+/);
const adj = new Map();
const inDegree = new Map();
for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}
for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].split(/\s+/);
    const a = parts[0];
    const b = parts[1];
    adj.get(a).push(b);
    inDegree.set(b, inDegree.get(b) + 1);
}
const heap = new MinHeap();
for (const t of tasks) {
    if (inDegree.get(t) === 0) {
        heap.push(t);
    }
}
const result = [];
while (!heap.isEmpty) {
    const task = heap.pop();
    result.push(task);
    for (const nb of adj.get(task)) {
        inDegree.set(nb, inDegree.get(nb) - 1);
        if (inDegree.get(nb) === 0) {
            heap.push(nb);
        }
    }
}
if (result.length < N) {
    console.log('IMPOSSIBLE');
}
else {
    console.log(result.join(' '));
}
