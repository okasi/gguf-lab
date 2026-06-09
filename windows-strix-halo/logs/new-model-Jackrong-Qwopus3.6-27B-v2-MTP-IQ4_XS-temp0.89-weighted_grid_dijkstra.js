"use strict";
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
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0 && bottom !== undefined) {
            this.heap[0] = bottom;
            this.bubbleDown(0);
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp(idx) {
        const val = this.heap[idx];
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parentVal = this.heap[parentIdx];
            if (val[0] >= parentVal[0])
                break;
            this.heap[idx] = parentVal;
            this.heap[parentIdx] = val;
            idx = parentIdx;
        }
    }
    bubbleDown(idx) {
        const l = this.heap.length;
        const val = this.heap[idx];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let swapIdx = idx;
            if (leftChildIdx < l && this.heap[leftChildIdx][0] < val[0]) {
                swapIdx = leftChildIdx;
            }
            if (rightChildIdx < l && this.heap[rightChildIdx][0] < this.heap[swapIdx][0]) {
                swapIdx = rightChildIdx;
            }
            if (swapIdx === idx)
                break;
            this.heap[idx] = this.heap[swapIdx];
            this.heap[swapIdx] = val;
            idx = swapIdx;
        }
    }
}
function main() {
    const input = require('fs').readFileSync(0, 'utf8').trim().replace(/\r/g, '').split('\n');
    if (input.length < 1)
        return;
    const [H, W] = input[0].split(' ').map(Number);
    const grid = input.slice(1);
    let startX = -1, startY = -1;
    let targetX = -1, targetY = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const c = grid[i][j];
            if (c === 'S') {
                startX = i;
                startY = j;
            }
            if (c === 'T') {
                targetX = i;
                targetY = j;
            }
        }
    }
    if (startX === -1 || targetX === -1) {
        console.log(-1);
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new MinHeap();
    dist[startX][startY] = 0;
    pq.push([0, startX, startY]);
    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];
    while (pq.size() > 0) {
        const [d, x, y] = pq.pop();
        if (d > dist[x][y])
            continue;
        if (x === targetX && y === targetY) {
            console.log(d);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];
            if (nx >= 0 && nx < H && ny >= 0 && ny < W) {
                const c = grid[nx][ny];
                if (c === '#')
                    continue;
                let cost = 0;
                if (c === 'S' || c === 'T') {
                    cost = 0;
                }
                else {
                    cost = parseInt(c, 10);
                }
                const newDist = d + cost;
                if (newDist < dist[nx][ny]) {
                    dist[nx][ny] = newDist;
                    pq.push([newDist, nx, ny]);
                }
            }
        }
    }
    console.log(-1);
}
main();
