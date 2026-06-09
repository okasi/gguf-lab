"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compareCells(a, b) {
    return a.cost - b.cost;
}
class PriorityQueue {
    constructor() {
        this.queue = [];
    }
    push(item) {
        this.queue.push(item);
        this.bubbleUp(this.queue.length - 1);
    }
    pop() {
        if (this.queue.length === 0)
            return undefined;
        const min = this.queue[0];
        this.queue[0] = this.queue.pop();
        if (this.queue.length > 0) {
            this.bubbleDown(0);
        }
        return min;
    }
    isEmpty() {
        return this.queue.length === 0;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (compareCells(this.queue[index], this.queue[parent]) < 0) {
                [this.queue[index], this.queue[parent]] = [this.queue[parent], this.queue[index]];
                index = parent;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        const length = this.queue.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;
            if (left < length && compareCells(this.queue[left], this.queue[smallest]) < 0) {
                smallest = left;
            }
            if (right < length && compareCells(this.queue[right], this.queue[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== index) {
                [this.queue[index], this.queue[smallest]] = [this.queue[smallest], this.queue[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const { readFileSync } = require('fs');
    const input = readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length < 1) {
        console.log('-1');
        return;
    }
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid = [];
    for (let i = 0; i < H; i++) {
        grid.push(lines[i + 1]);
    }
    let start = null;
    let target = null;
    for (let i = 0; i < H; i++) {
        const row = grid[i];
        for (let j = 0; j < W; j++) {
            const char = row[j];
            if (char === 'S')
                start = { r: i, c: j };
            else if (char === 'T')
                target = { r: i, c: j };
        }
    }
    if (!start || !target) {
        console.log('-1');
        return;
    }
    const dist = [];
    for (let i = 0; i < H; i++) {
        dist.push(new Array(W).fill(Infinity));
    }
    dist[start.r][start.c] = 0;
    const pq = new PriorityQueue();
    pq.push({ r: start.r, c: start.c, cost: 0 });
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (!pq.isEmpty()) {
        const { r, c, cost } = pq.pop();
        if (cost > dist[r][c])
            ;
    }
}
