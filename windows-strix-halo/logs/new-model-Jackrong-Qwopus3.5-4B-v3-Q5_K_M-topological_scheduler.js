"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class MinHeap {
    constructor(data) {
        this.data = data ? [...data] : [];
        this.len = 0;
        this.heapify();
    }
    heapify() {
        for (let i = Math.floor(this.len / 2) - 1; i >= 0; i--) {
            this.sink(i);
        }
    }
    sink(i) {
        let target = i;
        while (2 * i + 1 < this.len) {
            let child = 2 * i + 1;
            if (child + 1 < this.len) {
                if (this.compare(this.data[child + 1], this.data[child])) {
                    child++;
                }
            }
            if (this.compare(this.data[target], this.data[child])) {
                break;
            }
            this.swap(target, child);
            target = child;
        }
    }
    heapifyUp(i) {
        while (i > 0 && this.compare(this.data[i], this.data[this.parent(i)])) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    compare(a, b) {
        return a < b;
    }
    swap(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
    push(item) {
        this.data.push(item);
        this.len++;
        this.heapifyUp(this.len - 1);
    }
    pop() {
        if (this.len === 0)
            return undefined;
        const result = this.data[0];
        this.data[0] = this.data[this.len - 1];
        this.len--;
        this.data.pop();
        if (this.len > 0) {
            this.sink(0);
        }
        return result;
    }
    isEmpty() {
        return this.len === 0;
    }
}
function solve() {
    const content = fs_1.default.readFileSync(0, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length < 2)
        return;
    const [nStr] = lines[0].trim().split(/\s+/);
    const n = parseInt(nStr, 10);
    const tasks = lines[1].trim().split(/\s+/).filter(s => s.length > 0);
    const m = parseInt(lines[2].trim(), 10);
    const adj = new Map();
    const indegree = new Map();
    const edgeSet = new Set();
    for (const task of tasks) {
        adj.set(task, new Set());
        indegree.set(task, 0);
    }
    for (let i = 3; i <= lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        if (parts.length < 2)
            continue;
        const from = parts[0];
        const to = parts[1];
        const edgeKey = `${from}|${to}`;
        if (edgeSet.has(edgeKey))
            continue;
        edgeSet.add(edgeKey);
        adj.get(from).add(to);
        indegree.set(to, (indegree.get(to) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const task of tasks) {
        if (indegree.get(task) === 0) {
            heap.push(task);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const task = heap.pop();
        result.push(task);
        const neighbors = adj.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newIndegree = indegree.get(neighbor) - 1;
                indegree.set(neighbor, newIndegree);
                if (newIndegree === 0) {
                    heap.push(neighbor);
                }
            }
        }
    }
    if (result.length !== n) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(result.join(' '));
    }
}
solve();
