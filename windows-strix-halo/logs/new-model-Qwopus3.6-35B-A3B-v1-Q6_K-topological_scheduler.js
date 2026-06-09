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
// MinHeap implementation for lexicographical ordering
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) {
            return undefined;
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    get size() {
        return this.heap.length;
    }
    compare(a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left <= lastIndex && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right <= lastIndex && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        return;
    }
    const firstLine = lines[0].trim().split(/\s+/);
    const n = parseInt(firstLine[0], 10);
    const m = parseInt(firstLine[1], 10);
    const tasks = lines[1].trim().split(/\s+/);
    if (tasks.length !== n) {
        return;
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 2; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length < 2) {
            continue;
        }
        const from = parts[0];
        const to = parts[1];
        if (adj.has(from) && adj.has(to)) {
            adj.get(from).push(to);
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if ((inDegree.get(task) || 0) === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (heap.size > 0) {
        const current = heap.pop();
        if (current === undefined) {
            break;
        }
        result.push(current);
        const neighbors = adj.get(current) || [];
        for (const neighbor of neighbors) {
            const degree = inDegree.get(neighbor) || 0;
            inDegree.set(neighbor, degree - 1);
            if (degree - 1 === 0) {
                heap.push(neighbor);
            }
        }
    }
    if (result.length !== n) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(result.join(' '));
    }
}
main();
