"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const input = fs_1.default.readFileSync(0, 'utf8').toString().split('\n').map(line => line.trim()).filter(Boolean);
const [N, M] = input[0].split(' ').map(Number);
const tasks = input[1].split(' ');
const adj = {};
const indegree = {};
for (const task of tasks) {
    adj[task] = new Set();
    indegree[task] = 0;
}
for (let i = 2; i < 2 + M; i++) {
    const [A, B] = input[i].split(' ');
    adj[A].add(B);
    indegree[B]++;
}
class MinHeap {
    constructor() {
        this.data = [];
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        if (this.data.length === 1)
            return this.data.pop();
        const top = this.data[0];
        this.data[0] = this.data.pop();
        this.bubbleDown(0);
        return top;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = ((idx + 1) >> 1) - 1;
            if (this.data[parentIdx] <= this.data[idx])
                break;
            [this.data[parentIdx], this.data[idx]] = [this.data[idx], this.data[parentIdx]];
            idx = parentIdx;
        }
    }
    bubbleDown(idx) {
        while (true) {
            let min = idx;
            const l = (idx << 1) + 1, r = (idx << 1) + 2;
            if (l < this.data.length && this.data[l] < this.data[min])
                min = l;
            if (r < this.data.length && this.data[r] < this.data[min])
                min = r;
            if (min === idx)
                break;
            [this.data[idx], this.data[min]] = [this.data[min], this.data[idx]];
            idx = min;
        }
    }
}
const heap = new MinHeap();
for (const task of tasks) {
    if (indegree[task] === 0)
        heap.push(task);
}
const result = [];
while (heap.pop()) {
    const cur = heap.pop();
    result.push(cur);
    for (const next of adj[cur]) {
        indegree[next]--;
        if (indegree[next] === 0)
            heap.push(next);
    }
}
if (result.length !== N) {
    console.log('IMPOSSIBLE');
}
else {
    console.log(result.join(' '));
}
