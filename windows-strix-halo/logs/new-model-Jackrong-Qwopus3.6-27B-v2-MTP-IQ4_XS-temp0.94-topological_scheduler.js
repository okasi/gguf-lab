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
        this.elements = [];
    }
    push(value) {
        this.elements.push(value);
        this._siftUp(this.elements.length - 1);
    }
    pop() {
        if (this.isEmpty()) {
            return undefined;
        }
        const top = this.elements[0];
        const last = this.elements.pop();
        if (!this.isEmpty() && last !== undefined) {
            this.elements[0] = last;
            this._siftDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.elements.length === 0;
    }
    _siftUp(index) {
        const value = this.elements[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parentValue = this.elements[parentIndex];
            if (value < parentValue) {
                this.elements[index] = parentValue;
                index = parentIndex;
            }
            else {
                break;
            }
        }
        this.elements[index] = value;
    }
    _siftDown(index) {
        const length = this.elements.length;
        const value = this.elements[index];
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let swapIndex = index;
            if (leftChildIndex < length && this.elements[leftChildIndex] < value) {
                swapIndex = leftChildIndex;
            }
            if (rightChildIndex < length && this.elements[rightChildIndex] < this.elements[swapIndex]) {
                swapIndex = rightChildIndex;
            }
            if (swapIndex !== index) {
                this.elements[index] = this.elements[swapIndex];
                index = swapIndex;
            }
            else {
                break;
            }
        }
        this.elements[index] = value;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(/\s+/).map(Number);
    const tasks = lines[1].trim().split(/\s+/);
    const adjacencyList = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adjacencyList.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '')
            continue;
        const parts = line.split(/\s+/).filter(s => s !== '');
        if (parts.length < 2)
            continue;
        const [A, B] = parts;
        adjacencyList.get(A).push(B);
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
        for (const neighbor of adjacencyList.get(task)) {
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
