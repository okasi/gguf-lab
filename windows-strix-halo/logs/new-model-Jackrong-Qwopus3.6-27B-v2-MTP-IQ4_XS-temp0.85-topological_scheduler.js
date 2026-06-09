"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class MinHeap {
    constructor() {
        this.data = [];
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    parent(i) { return (i - 1) >> 1; }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }
    push(val) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }
    siftUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p] <= this.data[i])
                break;
            this.swap(i, p);
            i = p;
        }
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return root;
    }
    siftDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest])
                smallest = l;
            if (r < n && this.data[r] < this.data[smallest])
                smallest = r;
            if (smallest === i)
                break;
            this.swap(i, smallest);
            i = smallest;
        }
    }
    isEmpty() { return this.data.length === 0; }
}
const input = (0, fs_1.readFileSync)(0, 'utf8').trim();
const lines = input.split('\n');
const [N, M] = lines[0].split(' ').map(Number);
const tasks = lines.length > 1 ? lines[1].split(' ') : [];
const adj = new Map();
const inDegree = new Map();
for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}
for (let i = 0; i < M; i++) {
    const line = lines[2 + i];
    if (line) {
        const [A, B] = line.split(' ');
        adj.get(A).push(B);
        inDegree.set(B, inDegree.get(B) + 1);
    }
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
    for (const v of adj.get(u)) {
        inDegree.set(v, inDegree.get(v) - 1);
        if (inDegree.get(v) === 0) {
            heap.push(v);
        }
    }
}
if (result.length === N) {
    console.log(result.join(' '));
}
else {
    console.log('IMPOSSIBLE');
}
