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
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.data[index] < this.data[parent]) {
                this.swap(index, parent);
                index = parent;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        const size = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < size && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < size && this.data[right] < this.data[smallest]) {
                smallest = right;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            }
            else {
                break;
            }
        }
    }
    push(value) {
        this.data.push(value);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        const min = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    isEmpty() {
        return this.data.length === 0;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
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
        const A = parts[0];
        const B = parts[1];
        adj.get(A).push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            heap.push(t);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const current = heap.pop();
        result.push(current);
        for (const neighbor of adj.get(current)) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }
    if (result.length !== N) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(result.join(' '));
    }
}
main();
