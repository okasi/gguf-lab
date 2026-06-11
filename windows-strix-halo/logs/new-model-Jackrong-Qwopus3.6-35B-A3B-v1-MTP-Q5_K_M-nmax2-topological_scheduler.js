"use strict";
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split('\n');
// Parse N and M
const [N, M] = lines[0].split(' ').map(Number);
// Parse task names
const tasks = lines[1].split(' ');
// Build adjacency list and in-degree array
const adj = new Map();
const inDegree = new Map();
// Initialize
for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}
// Parse edges
for (let i = 0; i < M; i++) {
    const [A, B] = lines[i + 2].split(' ');
    adj.get(A).push(B);
    inDegree.set(B, inDegree.get(B) + 1);
}
// Binary heap implementation
class MinHeap {
    constructor() {
        this.data = [];
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex] > this.data[index]) {
                this.swap(parentIndex, index);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        const n = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.data[smallest] > this.data[left]) {
                smallest = left;
            }
            if (right < n && this.data[smallest] > this.data[right]) {
                smallest = right;
            }
            if (smallest !== index) {
                this.swap(smallest, index);
                index = smallest;
            }
            else {
                break;
            }
        }
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const min = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    get size() {
        return this.data.length;
    }
    peek() {
        return this.data.length > 0 ? this.data[0] : undefined;
    }
}
// Topological sort with priority queue
const heap = new MinHeap();
// Initialize heap with nodes that have in-degree 0
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        heap.push(task);
    }
}
const result = [];
while (heap.size > 0) {
    const current = heap.pop();
    result.push(current);
    for (const neighbor of adj.get(current)) {
        const deg = inDegree.get(neighbor) - 1;
        inDegree.set(neighbor, deg);
        if (deg === 0) {
            heap.push(neighbor);
        }
    }
}
if (result.length !== N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(result.join(' '));
}
