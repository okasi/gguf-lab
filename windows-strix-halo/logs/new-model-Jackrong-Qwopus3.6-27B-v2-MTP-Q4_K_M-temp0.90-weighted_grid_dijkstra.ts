import * as fs from 'fs';

class MinHeap {
    private data: {cost: number, r: number, c: number}[];
    constructor() { this.data = []; }
    push(item: {cost: number, r: number, c: number}) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    peek() { return this.data[0]; }
    size() { return this.data.length; }
    isEmpty() { return this.data.length === 0; }
    private bubbleUp(idx: number) {
        const item = this.data[idx];
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.data[parent].cost <= item.cost) break;
            this.data[idx] = this.data[parent];
            idx = parent;
        }
        this.data[idx] = item;
    }
    private bubbleDown(idx: number) {
        const item = this.data[idx];
        const len = this.data.length;
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let smallest = idx;
            if (left < len && this.data[left].cost < item.cost) smallest = left;
            if (right < len && this.data[right].cost < this.data[smallest].cost) smallest = right;
            if (smallest === idx) break;
            this.data[idx] = this.data[smallest];
            idx = smallest;
        }
        this.data[idx] = item;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split(/\r?\n/);
    const [H, W] = input[0].split(/\s+/).map(Number);
    const grid: string[] = [];
    let sr = -1, sc = -1, tr = -1, tc = -1;
    for (let i = 1; i <= H; i++) {
        const row = input[i];
        grid.push(row);
        for (let j = 0; j < row.length; j++) {
            const ch = row[j];
            if (ch === 'S') { sr = i - 1; sc = j; }
            else if (ch === 'T') { tr = i - 1; tc = j; }
        }
    }

    if (sr === -1 || sc === -1 || tr === -1 || tc === -1) {
        console.log(-1);
        return;
    }

    const dist: number[][] = Array.from({length: H}, () => new Array(W).fill(Infinity));
    dist[sr][sc] = 0;

    const heap = new MinHeap();
    heap.push({cost: 0, r: sr, c: sc});

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (!heap.isEmpty()) {
        const current = heap.pop();
        if (!current) break;
        const {cost, r, c} = current;
        if (cost > dist[r][c]) continue;
        if (r === tr && c === tc) {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
            const cell = grid[nr][nc];
            if (cell === '#') continue;
            let addCost = 0;
            if (cell === 'S' || cell === 'T') {
                addCost = 0;
            } else {
                addCost = parseInt(cell, 10);
            }
            const newCost = cost + addCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                heap.push({cost: newCost, r: nr, c: nc});
            }
        }
    }

    console.log(-1);
}

main();
