"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class MinHeap {
    constructor() {
        this.items = [];
    }
    get size() {
        return this.items.length;
    }
    push(item) {
        this.items.push(item);
        this._bubbleUp(this.items.length - 1);
    }
    pop() {
        if (this.items.length === 0)
            return undefined;
        const top = this.items[0];
        const last = this.items.pop();
        if (this.items.length > 0) {
            this.items[0] = last;
            this._sinkDown(0);
        }
        return top;
    }
    peek() {
        return this.items[0];
    }
    _bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1;
            if (this.items[idx] < this.items[parentIdx]) {
                this._swap(idx, parentIdx);
                idx = parentIdx;
            }
            else {
                break;
            }
        }
    }
    _sinkDown(idx) {
        const n = this.items.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.items[left] < this.items[smallest]) {
                smallest = left;
            }
            if (right < n && this.items[right] < this.items[smallest]) {
                smallest = right;
            }
            if (smallest !== idx) {
                this._swap(idx, smallest);
                idx = smallest;
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
function solve() {
    const input = fs_1.default.readFileSync(0, "utf8").trim();
    const lines = input.split(/\r?\n/);
    let idx = 0;
    const firstLineParts = lines[idx++].trim().split(/\s+/);
    const N = parseInt(firstLineParts[0], 10);
    const M = parseInt(firstLineParts[1], 10);
    const taskNames = lines[idx++].trim().split(/\s+/);
    const adj = new Map();
    const inDegree = new Map();
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 0; i < M; i++) {
        const parts = lines[idx++].trim().split(/\s+/);
        const from = parts[0];
        const to = parts[1];
        adj.get(from).push(to);
        inDegree.set(to, inDegree.get(to) + 1);
    }
    const pq = new MinHeap();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const result = [];
    while (pq.size > 0) {
        const task = pq.pop();
        result.push(task);
        const neighbors = adj.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newInDegree = inDegree.get(neighbor) - 1;
                inDegree.set(neighbor, newInDegree);
                if (newInDegree === 0) {
                    pq.push(neighbor);
                }
            }
        }
    }
    if (result.length < N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(" "));
    }
}
solve();
