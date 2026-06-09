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
        this.items = [];
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.items[parentIndex] <= this.items[index])
                break;
            [this.items[parentIndex], this.items[index]] = [this.items[index], this.items[parentIndex]];
            index = parentIndex;
        }
    }
    bubbleDown(index) {
        const length = this.items.length;
        while (true) {
            let smallest = index;
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            if (leftIndex < length && this.items[leftIndex] < this.items[smallest]) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this.items[rightIndex] < this.items[smallest]) {
                smallest = rightIndex;
            }
            if (smallest === index)
                break;
            [this.items[smallest], this.items[index]] = [this.items[index], this.items[smallest]];
            index = smallest;
        }
    }
    insert(val) {
        this.items.push(val);
        this.bubbleUp(this.items.length - 1);
    }
    extractMin() {
        if (this.items.length === 0)
            return null;
        const minVal = this.items[0];
        const lastVal = this.items.pop();
        if (this.items.length > 0) {
            this.items[0] = lastVal;
            this.bubbleDown(0);
        }
        return minVal;
    }
    isEmpty() {
        return this.items.length === 0;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const [N, M] = lines[0].split(' ').map(Number);
    const tasks = lines[1].split(' ');
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, new Set());
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const [A, B] = lines[2 + i].split(' ');
        if (adj.has(A) && adj.has(B)) {
            adj.get(A).add(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.insert(task);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const task = heap.extractMin();
        result.push(task);
        for (const neighbor of adj.get(task)) {
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
        console.log(result.join(' '));
    }
}
main();
