"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinHeap = void 0;
const minHeap_1 = require("./minHeap");
function solve(input) {
    const lines = input.trim().split("\n");
    const [N, M] = lines[0].split(" ").map(Number);
    const tasks = new Map();
    for (let i = 0; i < N; i++) {
        tasks.set(lines[1 + i], i);
    }
    const inDegree = new Map();
    for (let i = 0; i < M; i++) {
        const [a, b] = lines[2 + i].split(" ").map((val) => val);
        inDegree.set(a, (inDegree.get(a) || 0) + 1);
        inDegree.set(b, (inDegree.get(a) || 0) + 1);
    }
    const queue = (0, minHeap_1.createMinHeap)();
    for (let i = 0; i < N; i++) {
        const task = tasks.get(i);
        if (inDegree.get(task) === 0) {
            queue.insert(task);
        }
    }
    const buildOrder = [];
    const processed = new Set();
    while (queue.size() > 0) {
        const currentTask = queue.extractMin();
        buildOrder.push(currentTask);
        processed.add(currentTask);
        for (const dependency of tasks.get(currentTask) || []) {
            const task = dependency[0];
            inDegree.set(task, inDegree.get(task) || 0) - 1;
            if (inDegree.get(task) === 0) {
                queue.insert(task);
            }
        }
    }
    if (buildOrder.length !== N) {
        process.exit(1);
    }
    console.log(buildOrder.join(" ", "));));
}
// Standard Binary Heap Implementation (Min Heap)
class MinHeap {
    constructor() {
        this.data = [];
    }
    getLeft(i) { return 2 * i + 1; }
    getRight(i) { return 2 * i + 2; }
    swap(i, j) {
        this.data = [...this.data];
        [this.data[i], this.data[j]] = [this.data[i], this.data[j]];
    }
    bubbleUp(i) {
        while (i > 0 && this.data[i] > this.data[this.getParent(i)]) {
            this.swap(i, this.getParent(i));
            i = this.getParent(i);
        }
    }
    bubbleDown(i) {
        let smallest = i;
        let left = this.getLeft(i);
        let right = this.getRight(i);
        if (this.data[left] < this.data[smallest]) {
            smallest = left;
        }
        if (this.data[right] < this.data[smallest]) {
            smallest = right;
        }
        while (smallest !== i && this.data[smallest] < this.data[i]) {
            this.swap(smallest, i);
            smallest = this.getLeft(smallest);
            i = this.getParent(smallest);
        }
    }
    getParent(i) { return Math.floor((i - 1) / 2); }
    get size() { return this.data.length; }
    insert(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    extractMin() {
        const min = this.data[0];
        this.data = this.data.slice(1);
        this.heapifyDown(0);
        return min;
    }
    heapifyDown(i) {
        let smallest = i;
        let left = this.getLeft(i);
        let right = this.getRight(i);
        if (this.data[left] < this.data[smallest]) {
            smallest = left;
        }
        if (this.data[right] < this.data[smallest]) {
            smallest = right;
        }
        while (smallest !== i && this.data[smallest] < this.data[i]) {
            this.swap(smallest, i);
            smallest = this.getLeft(i);
            i = this.getParent(smallest);
        }
    }
}
exports.MinHeap = MinHeap;
// Helper to simulate reading from stdin for environments like online judges
if (typeof process !== 'undefined' && process.stdin) {
    const fs = require("fs");
    try {
        solve(fs.readFileSync(0, "utf8"));
    }
    catch (e) {
        // Ignore errors if stdin is not connected (e.g., testing environment)
    }
}
