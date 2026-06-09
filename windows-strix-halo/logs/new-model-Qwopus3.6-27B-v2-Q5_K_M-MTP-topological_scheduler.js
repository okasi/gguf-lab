"use strict";
const fs = require('fs');
class MinHeap {
    constructor() {
        this.heap = [];
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    parent(i) {
        return ((i + 1) >> 1) - 1;
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    push(val) {
        this.heap.push(val);
        let i = this.heap.length - 1;
        while (i > 0) {
            const p = this.parent(i);
            if (this.heap[p] <= this.heap[i])
                break;
            this.swap(p, i);
            i = p;
        }
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let i = 0;
            while (true) {
                let smallest = i;
                const l = this.left(i);
                const r = this.right(i);
                if (l < this.heap.length && this.heap[l] < this.heap[smallest])
                    smallest = l;
                if (r < this.heap.length && this.heap[r] < this.heap[smallest])
                    smallest = r;
                if (smallest === i)
                    break;
                this.swap(i, smallest);
                i = smallest;
            }
        }
        return top;
    }
    get size() {
        return this.heap.length;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) {
        console.log('IMPOSSIBLE');
        return;
    }
    const [N_str, M_str] = lines[0].split(/\s+/);
    const N = parseInt(N_str, 10);
    const M = parseInt(M_str, 10);
    const tasks = lines[1].split(/\s+/);
    const indegree = new Map();
    const adj = new Map();
    for (const task of tasks) {
        indegree.set(task, 0);
        adj.set(task, new Set());
    }
    for (let i = 2; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/);
        if (parts.length < 2)
            continue;
        const A = parts[0];
        const B = parts[1];
        if (!indegree.has(A) || !indegree.has(B))
            continue;
        if (!adj.get(A).has(B)) {
            adj.get(A).add(B);
            indegree.set(B, indegree.get(B) + 1);
        }
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (indegree.get(task) === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (heap.size > 0) {
        const u = heap.pop();
        result.push(u);
        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                const newDeg = indegree.get(v) - 1;
                indegree.set(v, newDeg);
                if (newDeg === 0) {
                    heap.push(v);
                }
            }
        }
    }
    if (result.length === N) {
        console.log(result.join(' '));
    }
    else {
        console.log('IMPOSSIBLE');
    }
}
main();
