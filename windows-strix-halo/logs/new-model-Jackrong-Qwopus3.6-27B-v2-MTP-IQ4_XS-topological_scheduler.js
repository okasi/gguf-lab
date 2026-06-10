"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class MinHeap {
    constructor() {
        this.items = [];
    }
    push(item) {
        this.items.push(item);
        this._bubbleUp(this.items.length - 1);
    }
    pop() {
        if (this.items.length === 0) {
            return undefined;
        }
        if (this.items.length === 1) {
            return this.items.pop();
        }
        const root = this.items[0];
        this.items[0] = this.items.pop();
        this._sinkDown(0);
        return root;
    }
    size() {
        return this.items.length;
    }
    _bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.items[index] < this.items[parent]) {
                this._swap(index, parent);
                index = parent;
            }
            else {
                break;
            }
        }
    }
    _sinkDown(index) {
        const length = this.items.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;
            if (left < length && this.items[left] < this.items[smallest]) {
                smallest = left;
            }
            if (right < length && this.items[right] < this.items[smallest]) {
                smallest = right;
            }
            if (smallest !== index) {
                this._swap(index, smallest);
                index = smallest;
            }
            else {
                break;
            }
        }
    }
    _swap(i, j) {
        const temp = this.items[i];
        this.items[i] = this.items[j];
        this.items[j] = temp;
    }
}
function solve(input) {
    const lines = input.trim().split(/\r?\n/);
    if (lines.length < 2) {
        return "IMPOSSIBLE";
    }
    const [nStr, mStr] = lines[0].trim().split(/\s+/).map(Number);
    if (isNaN(nStr) || isNaN(mStr)) {
        return "IMPOSSIBLE";
    }
    const N = nStr;
    const M = mStr;
    const taskNames = lines[1].trim().split(/\s+/);
    if (taskNames.length !== N) {
        return "IMPOSSIBLE";
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }
    for (let i = 0; i < M; i++) {
        if (i + 2 >= lines.length) {
            break;
        }
        const parts = lines[i + 2].trim().split(/\s+/);
        if (parts.length < 2) {
            continue;
        }
        const [A, B] = parts;
        if (!adj.has(A) || !adj.has(B)) {
            return "IMPOSSIBLE";
        }
        adj.get(A).push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const [name, deg] of inDegree) {
        if (deg === 0) {
            heap.push(name);
        }
    }
    const result = [];
    while (heap.size() > 0) {
        const current = heap.pop();
        result.push(current);
        const neighbors = adj.get(current);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newDeg = (inDegree.get(neighbor) || 0) - 1;
                inDegree.set(neighbor, newDeg);
                if (newDeg === 0) {
                    heap.push(neighbor);
                }
            }
        }
    }
    if (result.length !== N) {
        return "IMPOSSIBLE";
    }
    return result.join(" ");
}
const input = (0, fs_1.readFileSync)(0, "utf8");
console.log(solve(input));
