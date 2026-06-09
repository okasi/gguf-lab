"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const input = (0, fs_1.readFileSync)(0, 'utf8');
const lines = input.trim().split('\n');
const [H, W] = lines[0].split(' ').map(Number);
const grid = [];
for (let i = 0; i < H; i++) {
    grid.push(lines[i + 1].split(''));
}
let startX = -1;
let startY = -1;
let targetX = -1;
let targetY = -1;
for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            startX = i;
            startY = j;
        }
        else if (grid[i][j] === 'T') {
            targetX = i;
            targetY = j;
        }
    }
}
const dist = new Array(H);
for (let i = 0; i < H; i++) {
    dist[i] = new Array(W).fill(Infinity);
}
dist[startX][startY] = 0;
// Priority queue using binary heap
class MinHeap {
    constructor() {
        this.heap = [];
    }
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    leftChild(i) {
        return 2 * i + 1;
    }
    rightChild(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    heapifyUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.heap[i][0] < this.heap[p][0]) {
                this.swap(i, p);
                i = p;
            }
            else {
                break;
            }
        }
    }
    heapifyDown(i) {
        let min = i;
        const left = this.leftChild(i);
        const right = this.rightChild(i);
        if (left < this.heap.length && this.heap[left][0] < this.heap[min][0]) {
            min = left;
        }
        if (right < this.heap.length && this.heap[right][0] < this.heap[min][0]) {
            min = right;
        }
        if (min !== i) {
            this.swap(i, min);
            this.heapifyDown(min);
        }
    }
    push(cost, x, y) {
        this.heap.push([cost, x, y]);
        this.heapifyUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) {
            return undefined;
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
const pq = new MinHeap();
pq.push(0, startX, startY);
const dx = [1, -1, 0, 0];
const dy = [0, 0, 1, -1];
while (!pq.isEmpty()) {
    const [cost, x, y] = pq.pop();
    if (cost > dist[x][y]) {
        continue;
    }
    if (x === targetX && y === targetY) {
        console.log(cost);
        process.exit(0);
    }
    for (let d = 0; d < 4; d++) {
        const nx = x + dx[d];
        const ny = y + dy[d];
        if (nx < 0 || nx >= H || ny < 0 || ny >= W) {
            continue;
        }
        const cell = grid[nx][ny];
        if (cell === '#') {
            continue;
        }
        let newCost = cost;
        if (cell === 'S' || cell === 'T') {
            // Cost 0 to enter S or T
        }
        else {
            // Digit cell, cost is the digit value
            newCost += parseInt(cell, 10);
        }
        if (newCost < dist[nx][ny]) {
            dist[nx][ny] = newCost;
            pq.push(newCost, nx, ny);
        }
    }
}
console.log(-1);
