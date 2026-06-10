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
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.data[index], this.data[parentIndex]) < 0) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        const length = this.data.length;
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallest = index;
            if (leftChildIndex < length && this.compare(this.data[leftChildIndex], this.data[smallest]) < 0) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < length && this.compare(this.data[rightChildIndex], this.data[smallest]) < 0) {
                smallest = rightChildIndex;
            }
            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');
    if (lines.length === 0)
        return;
    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);
    const secondLine = lines[1].trim().split(/\s+/);
    const tasks = secondLine;
    const taskIndexMap = new Map();
    for (let i = 0; i < N; i++) {
        taskIndexMap.set(tasks[i], i);
    }
    const adjacencyList = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const line = lines[2 + i].trim().split(/\s+/);
        const A = line[0];
        const B = line[1];
        const aIdx = taskIndexMap.get(A);
        const bIdx = taskIndexMap.get(B);
        if (aIdx === undefined || bIdx === undefined)
            continue;
        adjacencyList[aIdx].push(bIdx);
        inDegree[bIdx]++;
    }
    const pq = new MinHeap((a, b) => tasks[a].localeCompare(tasks[b]));
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(i);
        }
    }
    const result = [];
    let processedCount = 0;
    while (!pq.isEmpty()) {
        const current = pq.pop();
        result.push(tasks[current]);
        processedCount++;
        for (const neighbor of adjacencyList[current]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                pq.push(neighbor);
            }
        }
    }
    if (processedCount !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(" "));
    }
}
solve();
