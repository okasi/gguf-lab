"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class MinHeap {
    constructor() { this.arr = []; }
    push(x) {
        this.arr.push(x);
        this.heapifyDown();
    }
    pop() {
        if (this.arr.length === 0)
            return null;
        const root = this.arr.shift();
        const n = this.arr.length;
        let i = 0;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.arr[left] < this.arr[smallest])
                smallest = left;
            if (right < n && this.arr[right] < this.arr[smallest])
                smallest = right;
            if (smallest !== i) {
                [this.arr[i], this.arr[smallest]] = [this.arr[smallest], this.arr[i]];
                i = smallest;
            }
            else
                break;
        }
        return root;
    }
    heapifyDown() {
        let i = this.arr.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.arr[parent] > this.arr[i]) {
                [this.arr[parent], this.arr[i]] = [this.arr[i], this.arr[parent]];
                i = parent;
            }
            else
                break;
        }
    }
    heapifyUp() {
        let i = this.arr.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.arr[parent] > this.arr[i]) {
                [this.arr[parent], this.arr[i]] = [this.arr[i], this.arr[parent]];
                i = parent;
            }
            else
                break;
        }
    }
    size() {
        return this.arr.length;
    }
}
function main() {
    const data = fs_1.default.readFileSync(0, "utf8").trim().split(/\s+/);
    if (data.length === 0)
        return;
    const it = data.begin();
    const N = Number(it++);
    const M = Number(it++);
    const tasks = new Set();
    for (let i = 0; i < N; i++) {
        tasks.add(it++);
    }
    const adjacency = new Map();
    const indegree = new Map();
    for (const key of tasks) {
        indegree.set(key, 0);
        adjacency.set(key, new Set());
    }
    while (it < data.length) {
        const A = it++;
        const B = it++;
        if (!adjacency.has(A))
            adjacency.set(A, new Set());
        if (!adjacency.has(B))
            adjacency.set(B, new Set());
        adjacency.get(A).add(B);
        indegree.set(B, (indegree.get(B) ?? 0) + 1);
    }
    const heap = new MinHeap();
    for (const [task, deg] of indegree.entries()) {
        if (deg === 0)
            heap.push(task);
    }
    const result = [];
    while (heap.size() > 0) {
        const task = heap.pop();
        result.push(task);
        for (const neighbor of adjacency.get(task) ?? []) {
            indegree.set(neighbor, (indegree.get(neighbor) ?? 0) - 1);
            if (indegree.get(neighbor) === 0) {
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
