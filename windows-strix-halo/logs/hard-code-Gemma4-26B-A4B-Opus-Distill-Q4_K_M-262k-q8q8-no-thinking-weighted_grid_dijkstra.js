"use strict";
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp();
    }
    pop() {
        if (this.size() === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.size() > 0) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return top;
    }
    size() { return this.heap.length; }
    bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let parent = (idx - 1) >> 1;
            if (this.heap[idx].priority() >= this.heap[parent].priority())
                break;
            [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
            idx = parent;
        }
    }
    bubbleDown() {
        let idx = 0;
        while (true) {
            let left = idx * 2 + 1, right = idx * 2 + 2, smallest = idx;
            if (left < this.heap.length && this.heap[left].priority() < this.heap[smallest].priority())
                smallest = left;
            if (right < this.heap.length && this.heap[right].priority() < this.heap[smallest].priority())
                smallest = right;
            if (smallest === idx)
                break;
            [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
            idx = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length < 2)
        return;
    const H = parseInt(input[0]);
    const W = parseInt(input[1]);
    const grid = input.slice(2, 2 + H);
    let startR = -1, startC = -1;
    const dist = new Int32Array(H * W).fill(2147483647);
    const pq = new MinHeap();
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
                dist[r * W + c] = 0;
                pq.push({ r, c, dist: 0, priority: () => 0 });
            }
        }
    }
    const dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
    while (pq.size() > 0) {
        const curr = pq.pop();
        if (curr.dist > dist[curr.r * W + curr.c])
            continue;
        if (grid[curr.r][curr.c] === 'T') {
            console.log(curr.dist);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = curr.r + dr[i], nc = curr.c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#')
                    continue;
                const weight = char === 'T' || char === 'S' ? 0 : char.charCodeAt(0) - 48;
                const newDist = curr.dist + weight;
                if (newDist < dist[nr * W + nc]) {
                    dist[nr * W + nc] = newDist;
                    pq.push({ r: nr, c: nc, dist: newDist, priority: () => newDist });
                }
            }
        }
    }
    console.log("-1");
}
solve();
