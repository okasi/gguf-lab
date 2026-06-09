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
    constructor(names) {
        this.heap = [];
        this.names = names;
    }
    push(id) {
        this.heap.push(id);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    get size() {
        return this.heap.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.compare(parentIndex, index)) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    bubbleDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;
            if (leftIndex <= lastIndex && this.compare(leftIndex, smallest)) {
                smallest = leftIndex;
            }
            if (rightIndex <= lastIndex && this.compare(rightIndex, smallest)) {
                smallest = rightIndex;
            }
            if (smallest === index) {
                break;
            }
            this.swap(index, smallest);
            index = smallest;
        }
    }
    compare(i, j) {
        return this.names[this.heap[i]] < this.names[this.heap[j]];
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}
const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split('\n');
const firstLine = lines[0].trim().split(' ');
const N = parseInt(firstLine[0]);
const M = parseInt(firstLine[1]);
const taskNames = lines[1].trim().split(' ');
const nameToId = new Map();
for (let i = 0; i < N; i++) {
    nameToId.set(taskNames[i], i);
}
const adj = Array.from({ length: N }, () => []);
const inDegree = new Array(N).fill(0);
for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].trim().split(' ');
    const a = nameToId.get(parts[0]);
    const b = nameToId.get(parts[1]);
    adj[a].push(b);
    inDegree[b]++;
}
const heap = new MinHeap(taskNames);
const result = [];
for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
        heap.push(i);
    }
}
while (heap.size > 0) {
    const id = heap.pop();
    result.push(taskNames[id]);
    for (const neighbor of adj[id]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
            heap.push(neighbor);
        }
    }
}
if (result.length === N) {
    console.log(result.join(' '));
}
else {
    console.log('IMPOSSIBLE');
}
