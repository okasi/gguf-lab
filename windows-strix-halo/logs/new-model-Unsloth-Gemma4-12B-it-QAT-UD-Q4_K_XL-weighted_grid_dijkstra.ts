import * as fs from 'fs';

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length < 2) return;

    const H = parseInt(input[0]);
    const W = parseInt(input[1]);
    const grid = [];
    for (let i = 0; i < H; i++) {
        grid.push(input[i + 2]);
    }

    let start = null;
    let target = null;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                start = [r, c];
            } else if (grid[r][c] === 'T') {
                target = [r, c];
            }
        }
    }

    if (!start || !target) {
        console.log(-1);
        return;
    }

    const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    dist[start[0]][start[1]] = 0;

    const pq = new MinHeap((a, b) => a.cost < b.cost);
    pq.push({ r: start[0], c: start[1], cost: 0 });

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (!pq.isEmpty()) {
        const { r, c, cost } = pq.pop();

        if (cost > dist[r][c]) continue;
        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#') continue;

                let moveCost = 0;
                if (char >= '0' && char <= '9') {
                    moveCost = parseInt(char);
                } else {
                    // S or T costs 0
                    moveCost = 0;
                }

                if (dist[r][c] + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + moveCost;
                    pq.push({ r: nr, c: nc, cost: dist[nr][nc] });
                }
            }
        }
    }

    console.log(-1);
}

class MinHeap {
    constructor(compareFn) {
        this.heap = [];
        this.compareFn = compareFn;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    push(val) {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.siftDown(0);
        return top;
    }
    siftUp(idx) {
        while (idx > 0) {
            let parent = Math.floor((idx - 1) / 2);
            if (this.compareFn(this.heap[idx], this.heap[parent])) {
                [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                idx = parent;
            } else break;
        }
    }
    siftDown(idx) {
        while (true) {
            let smallest = idx;
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            if (left < this.heap.length && this.compareFn(this.heap[left], this.heap[smallest])) smallest = left;
            if (right < this.heap.length && this.compareFn(this.heap[right], this.heap[smallest])) smallest = right;
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else break;
        }
    }
}

solve();
