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
// Binary Min-Heap for strings
class MinHeap {
    constructor() {
        this.data = [];
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
    peek() {
        return this.data[0];
    }
    get size() {
        return this.data.length;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    bubbleUp(idx) {
        const arr = this.data;
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1;
            if (arr[parentIdx] <= arr[idx])
                break;
            [arr[parentIdx], arr[idx]] = [arr[idx], arr[parentIdx]];
            idx = parentIdx;
        }
    }
    bubbleDown(idx) {
        const arr = this.data;
        const n = arr.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && arr[left] < arr[smallest])
                smallest = left;
            if (right < n && arr[right] < arr[smallest])
                smallest = right;
            if (smallest === idx)
                break;
            [arr[smallest], arr[idx]] = [arr[idx], arr[smallest]];
            idx = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split(/\n/);
    const [nStr, mStr] = lines[0].split(/\s+/);
    const N = parseInt(nStr);
    const M = parseInt(mStr);
    const tasks = lines[1].split(/\s+/);
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const parts = lines[2 + i].split(/\s+/);
        const u = parts[0];
        const v = parts[1];
        if (!adj.has(u))
            adj.set(u, []);
        if (!adj.has(v))
            adj.set(v, []);
        adj.get(u).push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }
    const pq = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const result = [];
    while (!pq.isEmpty()) {
        const u = pq.pop();
        result.push(u);
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            const deg = inDegree.get(v);
            if (deg === 1) {
                inDegree.set(v, 0);
                pq.push(v);
            }
            else {
                inDegree.set(v, deg - 1);
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
