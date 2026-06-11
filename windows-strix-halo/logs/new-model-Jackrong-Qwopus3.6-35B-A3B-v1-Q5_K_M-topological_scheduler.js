"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }
    get size() {
        return this.heap.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIndex]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        const length = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
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
function main() {
    const input = (0, fs_1.readFileSync)(0, "utf8").trim().split('\n');
    const firstLine = input[0].split(' ').map(Number);
    const N = firstLine[0];
    const M = firstLine[1];
    const tasks = input[1].split(' ');
    const adjList = new Map();
    const inDegree = new Map();
    // Initialize in-degrees and adjacency lists
    for (const task of tasks) {
        adjList.set(task, new Set());
        inDegree.set(task, 0);
    }
    for (let i = 2; i < 2 + M; i++) {
        const parts = input[i].split(' ');
        const from = parts[0];
        const to = parts[1];
        // Check if tasks exist (though problem statement implies valid names)
        if (!adjList.has(from) || !adjList.has(to)) {
            // Should not happen based on problem description, but safe to ignore or handle
            continue;
        }
        adjList.get(from).add(to);
        inDegree.set(to, (inDegree.get(to) + 1));
    }
    const pq = new MinHeap();
    // Add all tasks with in-degree 0 to the priority queue
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const result = [];
    while (pq.size > 0) {
        const current = pq.pop();
        result.push(current);
        const neighbors = adjList.get(current);
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                pq.push(neighbor);
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
