"use strict";
const fs = require('fs');
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const [N, M] = lines[0].split(' ').map(Number);
const tasks = lines[1].split(' ');
const adjacency = new Map();
const inDegree = new Map();
for (const task of tasks) {
    adjacency.set(task, []);
    inDegree.set(task, 0);
}
for (let i = 0; i < M; i++) {
    const [A, B] = lines[2 + i].split(' ');
    adjacency.get(A).push(B);
    inDegree.set(B, inDegree.get(B) + 1);
}
// Min-heap implementation for priority queue
class MinHeap {
    constructor() {
        this.heap = [];
    }
    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    getRightChildIndex(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = this.getParentIndex(index);
            if (this.heap[parentIndex] <= this.heap[index]) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    bubbleDown(index) {
        const length = this.heap.length;
        while (true) {
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);
            let smallestIndex = index;
            if (leftChildIndex < length && this.heap[leftChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex < length && this.heap[rightChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = rightChildIndex;
            }
            if (smallestIndex === index) {
                break;
            }
            this.swap(index, smallestIndex);
            index = smallestIndex;
        }
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    peek() {
        return this.heap[0];
    }
}
const pq = new MinHeap();
const result = [];
// Initialize the heap with tasks that have no dependencies
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}
while (!pq.isEmpty()) {
    const current = pq.pop();
    result.push(current);
    for (const neighbor of adjacency.get(current)) {
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
