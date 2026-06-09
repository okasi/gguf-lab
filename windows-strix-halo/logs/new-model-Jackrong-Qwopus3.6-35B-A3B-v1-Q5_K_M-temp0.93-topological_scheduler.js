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
    push(val) {
        this.data.push(val);
        this.heapifyUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0) {
            return undefined;
        }
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.heapifyDown(0);
        }
        return top;
    }
    get size() {
        return this.data.length;
    }
    heapifyUp(index) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.data[index] < this.data[parentIndex]) {
                this.swap(index, parentIndex);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    heapifyDown(index) {
        const lastIndex = this.data.length - 1;
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            if (leftChild <= lastIndex && this.data[leftChild] < this.data[smallest]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.data[rightChild] < this.data[smallest]) {
                smallest = rightChild;
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
    swap(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0)
        return;
    const [N, M] = input[0].split(' ').map(Number);
    if (N === 0) {
        console.log('');
        return;
    }
    const tasks = input[1].split(' ');
    const graph = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        graph.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim().split(' ');
        const from = line[0];
        const to = line[1];
        if (graph.has(from) && graph.has(to)) {
            graph.get(from).push(to);
            inDegree.set(to, inDegree.get(to) + 1);
        }
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (heap.size > 0) {
        const task = heap.pop();
        result.push(task);
        const dependents = graph.get(task);
        for (const dependent of dependents) {
            const deg = inDegree.get(dependent);
            inDegree.set(dependent, deg - 1);
            if (deg - 1 === 0) {
                heap.push(dependent);
            }
        }
    }
    if (result.length === N) {
        console.log(result.join(' '));
    }
    else {
        console.log("IMPOSSIBLE");
    }
}
main();
