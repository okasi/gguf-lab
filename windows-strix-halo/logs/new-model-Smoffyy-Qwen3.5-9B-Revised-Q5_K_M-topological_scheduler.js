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
class BinaryHeap {
    constructor(comparator) {
        this.heap = [];
        this.comparator = comparator;
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return null;
        const result = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return result;
    }
    bubbleUp(index) {
        const parent = Math.floor((index - 1) / 2);
        if (index > 0 && this.comparator(this.heap[index], this.heap[parent]) < 0) {
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            this.bubbleUp(parent);
        }
    }
    bubbleDown(index) {
        const length = this.heap.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;
            if (left < length && this.comparator(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < length && this.comparator(this.heap[right], this.heap[smallest]) < 0) {
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
// Main execution
const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split(/\r?\n/).filter(line => line.trim() !== '');
if (lines.length === 0) {
    console.log('');
    return;
}
const [N, M] = lines[0].split(/\s+/).map(Number);
const taskNames = lines[1].split(/\s+/);
// Validate N
if (taskNames.length !== N) {
    // Handle mismatch if input is weird, but assume valid per spec
    // Actually spec says "N distinct task names".
}
const nameToId = new Map();
for (let i = 0; i < N; i++) {
    nameToId.set(taskNames[i], i);
}
const adj = Array.from({ length: N }, () => []);
const inDegree = new Array(N).fill(0);
for (let i = 2; i < lines.length; i++) {
    const [A, B] = lines[i].split(/\s+/);
    const idA = nameToId.get(A);
    const idB = nameToId.get(B);
    if (idA !== undefined && idB !== undefined) {
        adj[idA].push(idB);
        inDegree[idB]++;
    }
}
const heap = new BinaryHeap((a, b) => {
    const nameA = taskNames[a];
    const nameB = taskNames[b];
    return nameA.localeCompare(nameB);
});
for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
        heap.push(i);
    }
}
const result = [];
while (heap.length > 0) {
    const u = heap.pop();
    if (u === null)
        break;
    result.push(u);
    for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
            heap.push(v);
        }
    }
}
if (result.length === N) {
    console.log(result.map(id => taskNames[id]).join(' '));
}
else {
    console.log('IMPOSSIBLE');
}
