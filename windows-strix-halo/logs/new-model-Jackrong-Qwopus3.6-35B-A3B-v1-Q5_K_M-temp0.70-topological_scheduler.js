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
    empty() {
        return this.heap.length === 0;
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) {
            return undefined;
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] <= this.heap[index]) {
                break;
            }
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }
    bubbleDown(index) {
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;
            if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest === index) {
                break;
            }
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}
const input = fs.readFileSync(0, "utf8").trim().split("\n");
let lineIdx = 0;
const firstLineParts = input[lineIdx++].trim().split(/\s+/);
const N = parseInt(firstLineParts[0], 10);
const M = parseInt(firstLineParts[1], 10);
const tasks = input[lineIdx++].trim().split(/\s+/);
const adj = new Map();
const indegree = new Map();
for (const task of tasks) {
    adj.set(task, []);
    indegree.set(task, 0);
}
for (let i = 0; i < M; i++) {
    const parts = input[lineIdx++].trim().split(/\s+/);
    const A = parts[0];
    const B = parts[1];
    // B must be completed before A
    adj.get(B).push(A);
    indegree.set(A, indegree.get(A) + 1);
}
const pq = new MinHeap();
for (const task of tasks) {
    if (indegree.get(task) === 0) {
        pq.push(task);
    }
}
const result = [];
while (!pq.empty()) {
    const task = pq.pop();
    result.push(task);
    const neighbors = adj.get(task);
    for (const neighbor of neighbors) {
        indegree.set(neighbor, indegree.get(neighbor) - 1);
        if (indegree.get(neighbor) === 0) {
            pq.push(neighbor);
        }
    }
}
if (result.length !== N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(result.join(" "));
}
