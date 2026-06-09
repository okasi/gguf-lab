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
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split(/\r?\n/).filter(l => l.trim() !== '');
    let lineIdx = 0;
    const [N, M] = lines[lineIdx++].trim().split(/\s+/).map(Number);
    const tasks = lines[lineIdx++].trim().split(/\s+/);
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const parts = lines[lineIdx++].trim().split(/\s+/);
        const A = parts[0];
        const B = parts[1];
        if (adj.has(A) && adj.has(B)) {
            adj.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    class MinHeap {
        constructor() {
            this.heap = [];
        }
        get size() {
            return this.heap.length;
        }
        insert(val) {
            this.heap.push(val);
            this.bubbleUp(this.size - 1);
        }
        extract() {
            if (this.size === 0)
                return undefined;
            if (this.size === 1)
                return this.heap.pop();
            const top = this.heap[0];
            this.heap[0] = this.heap[this.size - 1];
            this.heap.pop();
            this.bubbleDown(0);
            return top;
        }
        bubbleUp(idx) {
            while (idx > 0) {
                const parent = Math.floor((idx - 1) / 2);
                if (this.heap[idx] < this.heap[parent]) {
                    [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                    idx = parent;
                }
                else {
                    break;
                }
            }
        }
        bubbleDown(idx) {
            const size = this.size;
            while (true) {
                let smallest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;
                if (left < size && this.heap[left] < this.heap[smallest]) {
                    smallest = left;
                }
                if (right < size && this.heap[right] < this.heap[smallest]) {
                    smallest = right;
                }
                if (smallest !== idx) {
                    [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                    idx = smallest;
                }
                else {
                    break;
                }
            }
        }
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.insert(task);
        }
    }
    const result = [];
    while (heap.size > 0) {
        const current = heap.extract();
        result.push(current);
        for (const neighbor of adj.get(current)) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.insert(neighbor);
            }
        }
    }
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(" "));
    }
}
main();
