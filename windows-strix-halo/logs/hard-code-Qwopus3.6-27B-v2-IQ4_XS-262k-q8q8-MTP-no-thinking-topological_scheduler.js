"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class MinHeap {
    constructor() {
        this.heap = [];
    }
    size() {
        return this.heap.length;
    }
    push(val) {
        this.heap.push(val);
        this._siftUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._siftDown(0);
        return top;
    }
    _siftUp(idx) {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.heap[idx] < this.heap[parent]) {
                [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                idx = parent;
            }
            else {
                break;
            }
        }
    }
    _siftDown(idx) {
        const n = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < n && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            }
            else {
                break;
            }
        }
    }
}
function main() {
    const input = (0, fs_1.readFileSync)(0, "utf8").trim();
    const lines = input.split("\n");
    let idx = 0;
    const [N, M] = lines[idx++].split(" ").map(Number);
    const tasks = lines[idx++].split(" ");
    const graph = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        graph.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const [A, B] = lines[idx++].split(" ");
        if (!graph.has(A)) {
            graph.set(A, []);
            inDegree.set(A, 0);
        }
        if (!graph.has(B)) {
            graph.set(B, []);
            inDegree.set(B, 0);
        }
        graph.get(A).push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const [task, deg] of inDegree.entries()) {
        if (deg === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (heap.size() > 0) {
        const u = heap.pop();
        result.push(u);
        for (const v of graph.get(u) || []) {
            const newDeg = inDegree.get(v) - 1;
            inDegree.set(v, newDeg);
            if (newDeg === 0) {
                heap.push(v);
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
