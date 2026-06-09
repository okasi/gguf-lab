import * as fs from 'fs';

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    if (input.length === 0) return;

    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    const H = parseInt(firstLine[0]);
    const W = parseInt(firstLine[1]);

    const grid = [];
    let start = null;
    let target = null;

    for (let i = 0; i < H; i++) {
        const row = input[i + 1].trim();
        if (row === undefined) break;
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') start = [i, j];
            if (row[j] === 'T') target = [i, j];
        }
    }

    const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    
    // Simple Priority Queue Implementation (Min-Heap)
    class MinHeap {
        constructor() {
            this.heap = [];
        }
        push(node) {
            this.heap.push(node);
            this.bubbleUp();
        }
        pop() {
            if (this.size() === 1) return this.heap.pop();
            const min = this.heap[0];
            this.heap[0] = this.heap.pop();
            this.bubbleDown();
            return min;
        }
        size() { return this.heap.length; }
        bubbleUp() {
            let index = this.heap.length - 1;
            while (index > 0) {
                let parentIndex = Math.floor((index - 1) / 2);
                if (this.heap[parentIndex].cost <= this.heap[index].cost) break;
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            }
        }
        bubbleDown() {
            let index = 0;
            while (true) {
                let left = 2 * index + 1;
                let right = 2 * index + 2;
                let smallest = index;
                if (left < this.heap.length && this.heap[left].cost < this.heap[smallest].cost) smallest = left;
                if (right < this.heap.length && this.heap[right].cost < this.heap[smallest].cost) smallest = right;
                if (smallest === index) break;
                [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
                index = smallest;
            }
        }
    }

    const pq = new MinHeap();

    dist[start[0]][start[1]] = 0;
    pq.push({ r: start[0], c: start[1], cost: 0 });

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
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
                const cell = grid[nr][nc];
                if (cell === '#') continue;

                let moveCost = 0;
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
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

solve();
