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
    constructor(cmp) {
        this.data = [];
        this.cmp = cmp;
    }
    size() {
        return this.data.length;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const end = this.data.pop();
        if (this.data.length > 0 && end !== undefined) {
            this.data[0] = end;
            this.bubbleDown(0);
        }
        return top;
    }
    bubbleUp(idx) {
        const item = this.data[idx];
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.data[parentIdx];
            if (this.cmp(item, parent)) {
                this.data[idx] = parent;
                idx = parentIdx;
            }
            else {
                break;
            }
        }
        this.data[idx] = item;
    }
    bubbleDown(idx) {
        const length = this.data.length;
        const item = this.data[idx];
        while (true) {
            let leftIdx = 2 * idx + 1;
            let rightIdx = 2 * idx + 2;
            let smallestIdx = idx;
            if (leftIdx < length && this.cmp(this.data[leftIdx], this.data[smallestIdx])) {
                smallestIdx = leftIdx;
            }
            if (rightIdx < length && this.cmp(this.data[rightIdx], this.data[smallestIdx])) {
                smallestIdx = rightIdx;
            }
            if (smallestIdx === idx)
                break;
            this.data[idx] = this.data[smallestIdx];
            idx = smallestIdx;
        }
        this.data[idx] = item;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    const [N, M] = input[0].trim().split(/\s+/).map(Number);
    const tasks = input[1].trim().split(/\s+/);
    const adj = new Map();
    const indegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        indegree.set(task, 0);
    }
    for (let i = 2; i < 2 + M; i++) {
        const [A, B] = input[i].trim().split(/\s+/);
        adj.get(A).push(B);
        indegree.set(B, indegree.get(B) + 1);
    }
    const heap = new MinHeap((a, b) => a < b);
    for (const [task, deg] of indegree.entries()) {
        if (deg === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const current = heap.pop();
        result.push(current);
        for (const neighbor of adj.get(current)) {
            indegree.set(neighbor, indegree.get(neighbor) - 1);
            if (indegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }
    if (result.length !== tasks.length) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(result.join(' '));
    }
}
main();
