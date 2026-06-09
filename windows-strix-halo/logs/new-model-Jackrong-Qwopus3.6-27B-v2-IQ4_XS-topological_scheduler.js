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
    constructor() {
        this.data = [];
    }
    push(value) {
        this.data.push(value);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const bottom = this.data.pop();
        if (this.data.length > 0 && bottom !== undefined) {
            this.data[0] = bottom;
            this.siftDown(0);
        }
        return top;
    }
    peek() {
        return this.data.length > 0 ? this.data[0] : undefined;
    }
    siftUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[index] < this.data[parentIndex]) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    siftDown(index) {
        const length = this.data.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;
            if (left < length && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < length && this.data[right] < this.data[smallest]) {
                smallest = right;
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
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        return;
    }
    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(/\s+/).map(Number);
    const tasks = N > 0 ? lines[1].trim().split(/\s+/) : [];
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 2; i < 2 + M; i++) {
        if (!lines[i])
            continue;
        const parts = lines[i].trim().split(/\s+/);
        const A = parts[0];
        const B = parts[1];
        if (A && B) {
            adj.get(A).push(B);
            inDegree.set(B, inDegree.get(B) + 1);
        }
    }
    const heap = new BinaryHeap();
    const result = [];
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }
    while (heap.peek() !== undefined) {
        const task = heap.pop();
        result.push(task);
        const neighbors = adj.get(task);
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
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
