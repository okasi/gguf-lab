import * as fs from 'fs';

class MinHeap {
    private data: [number, number, number][];
    constructor() { this.data = []; }
    push(item: [number, number, number]) {
        this.data.push(item);
        this._bubbleUp(this.data.length - 1);
    }
    pop(): [number, number, number] | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this._bubbleDown(0);
        }
        return top;
    }
    size(): number { return this.data.length; }
    private _bubbleUp(index: number) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.data[index][0] < this.data[parentIndex][0]) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            } else break;
        }
    }
    private _bubbleDown(index: number) {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.data[left][0] < this.data[smallest][0]) smallest = left;
            if (right < length && this.data[right][0] < this.data[smallest][0]) smallest = right;
            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            } else break;
        }
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length < 2) {
        console.log(-1);
        return;
    }
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/);
    const H = parseInt(parts[0], 10);
    const W = parseInt(parts[1], 10);
    const grid: string[] = new Array(H);
    for (let i = 0; i < H; i++) {
        grid[i] = lines[i + 1].trim();
    }
    let sx = -1, sy = -1, tx = -1, ty = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const ch = grid[i][j];
            if (ch === 'S') {
                sx = i; sy = j;
            } else if (ch === 'T') {
                tx = i; ty = j;
            }
        }
    }
    if (sx === -1 || sy === -1 || tx === -1 || ty === -1) {
        console.log(-1);
        return;
    }
    const dist = new Array(H * W).fill(Infinity);
    dist[sx * W + sy] = 0;
    const pq = new MinHeap();
    pq.push([0, sx, sy]);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (pq.size() > 0) {
        const [d, x, y] = pq.pop()!;
        if (d > dist[x * W + y]) continue;
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= H || ny < 0 || ny >= W) continue;
            const ch = grid[nx][ny];
            if (ch === '#') continue;
            const cost = (ch === 'S' || ch === 'T') ? 0 : parseInt(ch, 10);
            const newDist = d + cost;
            if (newDist < dist[nx * W + ny]) {
                dist[nx * W + ny] = newDist;
                pq.push([newDist, nx, ny]);
            }
        }
    }
    const result = dist[tx * W + ty];
    console.log(result === Infinity ? -1 : result);
}

main();
