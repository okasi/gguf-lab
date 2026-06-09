import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const firstLine = lines[0].split(/\s+/).map(Number);
const H = firstLine[0];
const W = firstLine[1];

const grid: string[] = [];
for (let i = 1; i <= H; i++) {
    grid.push(lines[i].trim());
}

let startR = -1, startC = -1;
let targetR = -1, targetC = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        const ch = grid[r][c];
        if (ch === 'S') { startR = r; startC = c; }
        if (ch === 'T') { targetR = r; targetC = c; }
    }
}

class PriorityQueue {
    private heap: [number, number, number][] = [];

    push(item: [number, number, number]) {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }

    pop(): [number, number, number] {
        if (this.heap.length === 0) throw new Error('pop from empty');
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private _bubbleUp(index: number) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.heap[parent][0] <= this.heap[index][0]) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }

    private _bubbleDown(index: number) {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
            if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
            if (smallest === index) break;
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[startR][startC] = 0;
const pq = new PriorityQueue();
pq.push([0, startR, startC]);

const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

while (!pq.isEmpty()) {
    const [d, r, c] = pq.pop();
    if (d > dist[r][c]) continue;
    if (r === targetR && c === targetC) {
        console.log(d);
        return;
    }
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
        const ch = grid[nr][nc];
        if (ch === '#') continue;
        const cost = (ch === 'S' || ch === 'T') ? 0 : parseInt(ch, 10);
        const newDist = d + cost;
        if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            pq.push([newDist, nr, nc]);
        }
    }
}

console.log(-1);
