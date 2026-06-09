import * as fs from 'fs';

class MinHeap<T extends number[]> {
    private data: T[] = [];

    push(val: T): void {
        this.data.push(val);
        this._siftUp(this.data.length - 1);
    }

    pop(): T | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this._siftDown(0);
        }
        return top;
    }

    get length(): number {
        return this.data.length;
    }

    private _siftUp(idx: number): void {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.data[idx][0] < this.data[parentIdx][0]) {
                [this.data[idx], this.data[parentIdx]] = [this.data[parentIdx], this.data[idx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    private _siftDown(idx: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.data[left][0] < this.data[smallest][0]) smallest = left;
            if (right < n && this.data[right][0] < this.data[smallest][0]) smallest = right;
            if (smallest !== idx) {
                [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const H = parseInt(firstLine[0], 10);
const W = parseInt(firstLine[1], 10);
const grid: string[][] = [];
for (let i = 1; i <= H; i++) {
    grid.push(lines[i].split(''));
}

let startR = -1;
let startC = -1;
for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            startR = i;
            startC = j;
        }
    }
}

const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[startR][startC] = 0;
const pq = new MinHeap<[number, number, number]>();
pq.push([0, startR, startC]);

const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

while (pq.length > 0) {
    const [cost, r, c] = pq.pop()!;
    if (cost > dist[r][c]) continue;
    if (grid[r][c] === 'T') {
        console.log(cost);
        process.exit(0);
    }

    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
            let entryCost = 0;
            const cell = grid[nr][nc];
            if (cell >= '0' && cell <= '9') {
                entryCost = parseInt(cell, 10);
            }
            const newCost = cost + entryCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push([newCost, nr, nc]);
            }
        }
    }
}

console.log(-1);
