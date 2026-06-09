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
    push(item) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return root;
    }
    get size() {
        return this.data.length;
    }
    get isEmpty() {
        return this.data.length === 0;
    }
    siftUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex] <= this.data[index])
                break;
            [this.data[parentIndex], this.data[index]] = [this.data[index], this.data[parentIndex]];
            index = parentIndex;
        }
    }
    siftDown(index) {
        const length = this.data.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;
            if (leftIndex < length && this.data[leftIndex] < this.data[smallest]) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this.data[rightIndex] < this.data[smallest]) {
                smallest = rightIndex;
            }
            if (smallest === index)
                break;
            [this.data[smallest], this.data[index]] = [this.data[index], this.data[smallest]];
            index = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input)
        return;
    const tokens = input.split(/\s+/);
    let cursor = 0;
    const N = parseInt(tokens[cursor++], 10);
    const M = parseInt(tokens[cursor++], 10);
    const tasks = [];
    for (let i = 0; i < N; i++) {
        tasks.push(tokens[cursor++]);
    }
    const adj = {};
    const inDegree = {};
    for (const task of tasks) {
        adj[task] = [];
        inDegree[task] = 0;
    }
    for (let i = 0; i < M; i++) {
        const from = tokens[cursor++];
        const to = tokens[cursor++];
        adj[from].push(to);
        inDegree[to]++;
    }
    const pq = new MinHeap();
    for (const task of tasks) {
        if (inDegree[task] === 0) {
            pq.push(task);
        }
    }
    const order = [];
    while (!pq.isEmpty) {
        const current = pq.pop();
        order.push(current);
        for (const neighbor of adj[current]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                pq.push(neighbor);
            }
        }
    }
    if (order.length !== N) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(order.join(' '));
    }
}
solve();
