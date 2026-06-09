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
    push(task) {
        this.items.push(task);
        this.bubbleUp(this.items.length - 1);
    }
    pop() {
        if (this.items.length === 0)
            return undefined;
        if (this.items.length === 1)
            return this.items.pop();
        const top = this.items[0];
        this.items[0] = this.items.pop();
        this.bubbleDown(0);
        return top;
    }
    size() {
        return this.items.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.items[parentIndex] <= this.items[index])
                break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    bubbleDown(index) {
        const length = this.items.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.items[smallest] > this.items[left]) {
                smallest = left;
            }
            if (right < length && this.items[smallest] > this.items[right]) {
                smallest = right;
            }
            if (smallest === index)
                break;
            this.swap(index, smallest);
            index = smallest;
        }
    }
    swap(i, j) {
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const tokens = input.split(/\s+/);
    let ptr = 0;
    const N = parseInt(tokens[ptr++]);
    const M = parseInt(tokens[ptr++]);
    const tasks = [];
    for (let i = 0; i < N; i++) {
        tasks.push(tokens[ptr++]);
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const a = tokens[ptr++];
        const b = tokens[ptr++];
        adj.get(a).push(b);
        inDegree.set(b, inDegree.get(b) + 1);
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (heap.size() > 0) {
        const task = heap.pop();
        result.push(task);
        for (const neighbor of adj.get(task)) {
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
        console.log(result.join(" "));
    }
}
main();
