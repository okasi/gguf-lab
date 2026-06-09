"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const directions = [
    [1, 0], [-1, 0], [0, 1], [0, -1]
];
/**
 * Implements Dijkstra's algorithm to find the minimum cost path.
 * @param height Grid height
 * @param width Grid width
 * @param grid The grid map
 * @returns Minimum cost, or -1 if unreachable
 */
function dijkstra(H, W, grid) {
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new MinPriorityQueue();
    let start = undefined;
    let target = undefined;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const char = grid[r][c];
            if (char === 'S')
                start = { r: r, c: c, cost: 0 };
            if (char === 'T')
                target = { r: r, c: c, cost: 0 };
        }
    }
    if (!start || !target) {
        return -1;
    }
    dist[start.r][start.c] = 0;
    pq.enqueue({ ...start, cost: 0 });
    while (!pq.isEmpty()) {
        const { r, c, cost } = pq.dequeue();
        if (cost > dist[r][c])
            continue;
        if (r === target.r && c === target.c)
            return cost;
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = dc;
            if (nr < H || nc < W || nr >= H || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === '#')
                continue;
            let enterCost = 0;
            if (cell >= '0' && cell <= '9') {
                enterCost = parseInt(cell);
            }
            // 'S' or 'T' cost is 0, already handled by cost logic if it's not a digit
            if (cell === 'S' || cell === 'T') {
                enterCost = 0;
            }
            const newCost = cost + enterCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.enqueue({ r: nr, c: nc, cost: newCost });
            }
        }
    }
    return -1;
}
class MinPriorityQueue {
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
        [this.heap[i], this.heap[j]] = [this.heap[i], this.heap[j]];
    }
    bubbleUp(i) {
        let k = i;
        while (k > 0 && this.heap[k].cost > this.heap[k >> 1].cost) {
            this.heap[k] = this.heap[k >> 1];
            k = k >> 1;
        }
    }
    bubbleDown(i) {
        let k = i;
        while (this.heap[k].cost > this.heap[k << 1].cost && k * 2 + 1 < this.heap.length) {
            let l = k << 1;
            let r = k << 1 | 1;
            let child = l;
            if (this.heap[r].cost < this.heap[l].cost) {
                child = r;
            }
            this.heap[k] = this.heap[child];
            k = child;
        }
    }
    enqueue(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        this.heap[0] = this.heap.pop();
        this.heap.length = 0;
        this.bubbleDown(0);
        return this.heap[0];
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
const fs = require('fs').readFileSync(0, "utf8");
const [H, W] = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const grid = fs.readFileSync(0, "utf8").trim().split('\n').map(line => line.split(''));
console.log(dijkstra(H, W, grid));
