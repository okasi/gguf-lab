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
    push(value) {
        this.data.push(value);
        this._siftUp(this.data.length - 1);
    }
    pop() {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.data[0];
        const last = this.data.pop();
        if (!this.isEmpty() && last !== undefined) {
            this.data[0] = last;
            this._siftDown(0);
        }
        return min;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    _siftUp(index) {
        const value = this.data[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parentValue = this.data[parentIndex];
            if (value < parentValue) {
                this.data[index] = parentValue;
                index = parentIndex;
            }
            else {
                break;
            }
        }
        this.data[index] = value;
    }
    _siftDown(index) {
        const length = this.data.length;
        const value = this.data[index];
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let swapIndex = index;
            if (leftIndex < length && this.data[leftIndex] < value) {
                swapIndex = leftIndex;
            }
            if (rightIndex < length && this.data[rightIndex] < this.data[swapIndex]) {
                swapIndex = rightIndex;
            }
            if (swapIndex !== index) {
                this.data[index] = this.data[swapIndex];
                index = swapIndex;
            }
            else {
                break;
            }
        }
        this.data[index] = value;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split('\n');
    const [N, M] = lines[0].split(/\s+/).map(Number);
    const tasks = lines[1].split(/\s+/);
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const [A, B] = line.split(/\s+/);
        adj.get(A).push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const [task, degree] of inDegree) {
        if (degree === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const task = heap.pop();
        result.push(task);
        for (const neighbor of adj.get(task)) {
            const newDegree = (inDegree.get(neighbor) || 0) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
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
}
main();
