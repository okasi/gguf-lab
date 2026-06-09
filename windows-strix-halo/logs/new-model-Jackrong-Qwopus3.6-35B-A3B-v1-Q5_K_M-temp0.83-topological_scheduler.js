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
        this.size = 0;
    }
    isEmpty() {
        return this.size === 0;
    }
    push(item) {
        this.data[this.size] = item;
        this.size++;
        this.siftUp(this.size - 1);
    }
    pop() {
        if (this.isEmpty())
            return undefined;
        const top = this.data[0];
        this.data[0] = this.data[this.size - 1];
        this.size--;
        this.siftDown(0);
        return top;
    }
    siftUp(index) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.data[parentIndex] <= this.data[index])
                break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    siftDown(index) {
        while (true) {
            let smallest = index;
            const left = (index << 1) + 1;
            const right = (index << 1) + 2;
            if (left < this.size && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < this.size && this.data[right] < this.data[smallest]) {
                smallest = right;
            }
            if (smallest === index)
                break;
            this.swap(index, smallest);
            index = smallest;
        }
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    let ptr = 0;
    if (ptr >= tokens.length)
        return;
    const N = parseInt(tokens[ptr++], 10);
    const M = parseInt(tokens[ptr++], 10);
    const tasks = [];
    for (let i = 0; i < N; i++) {
        tasks.push(tokens[ptr++]);
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const t of tasks) {
        adj.set(t, new Set());
        inDegree.set(t, 0);
    }
    for (let i = 0; i < M; i++) {
        const u = tokens[ptr++];
        const v = tokens[ptr++];
        adj.get(u).add(v);
        inDegree.set(v, inDegree.get(v) + 1);
    }
    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            heap.push(t);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const u = heap.pop();
        result.push(u);
        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                inDegree.set(v, inDegree.get(v) - 1);
                if (inDegree.get(v) === 0) {
                    heap.push(v);
                }
            }
        }
    }
    if (result.length !== tasks.length) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(" "));
    }
}
main();
