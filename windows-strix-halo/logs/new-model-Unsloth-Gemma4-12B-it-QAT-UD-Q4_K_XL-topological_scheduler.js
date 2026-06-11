"use strict";
const fs = require('fs');
/**
 * Min-Heap implementation to satisfy the lexicographical order requirement
 * and the O((N + M) log N) time complexity.
 */
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.size() === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.size() > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIndex]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        while (true) {
            let smallest = index;
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length < 2)
        return;
    let ptr = 0;
    const N = parseInt(input[ptr++]);
    const M = parseInt(input[ptr++]);
    if (isNaN(N))
        return;
    const tasks = [];
    for (let i = 0; i < N; i++) {
        tasks.push(input[ptr++]);
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const u = input[ptr++];
        const v = input[ptr++];
        adj.get(u).push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (heap.size() > 0) {
        const u = heap.pop();
        result.push(u);
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            inDegree.set(v, inDegree.get(v) - 1);
            if (inDegree.get(v) === 0) {
                heap.push(v);
            }
        }
    }
    if (result.length === N) {
        process.stdout.write(result.join(" ") + "\n");
    }
    else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}
solve();
