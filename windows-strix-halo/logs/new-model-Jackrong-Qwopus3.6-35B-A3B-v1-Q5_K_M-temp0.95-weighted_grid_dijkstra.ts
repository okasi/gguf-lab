import * as fs from "fs";

class MinHeap {
    private data: [number, number, number][];
    constructor() { this.data = []; }
    push(val: [number, number, number]) {
        this.data.push(val);
        this._up(this.data.length - 1);
    }
    pop(): [number, number, number] {
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this._down(0);
        }
        return top;
    }
    get size(): number { return this.data.length; }
    private _up(i: number) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p][0] <= this.data[i][0]) break;
            [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
            i = p;
        }
    }
    private _down(i: number) {
        const n = this.data.length;
        while (true) {
            let s = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.data[l][0] < this.data[s][0]) s = l;
            if (r < n && this.data[r][0] < this.data[s][0]) s = r;
            if (s === i) break;
            [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
            i = s;
        }
    }
}

function main() {
    const raw = fs.readFileSync(0, "utf8").trim();
    const lines = raw.split("\n");
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);

    const grid: string[] = [];
    let sy = -1, sx = -1, ty = -1, tx = -1;

    for (let y = 0; y < H; y++) {
        const line = lines[y + 1].trim();
        grid.push(line);
        for (let x = 0; x < W; x++) {
            const c = line[x];
            if (c === "S") { sy = y; sx = x; }
            else if (c === "T") { ty = y; tx = x; }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new MinHeap();

    dist[sy][sx] = 0;
    pq.push([0, sy, sx]);

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (pq.size > 0) {
        const [cost, y, x] = pq.pop();

        if (cost > dist[y][x]) continue;
        if (y === ty && x === tx) {
            console.log(cost);
            return;
        }

        for (const [dy, dx] of dirs) {
            const ny = y + dy;
            const nx = x + dx;

            if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue;
            const cell = grid[ny][nx];
            if (cell === "#") continue;

            const cellCost = cell === "S" || cell === "T" ? 0 : parseInt(cell);
            const newCost = cost + cellCost;

            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                pq.push([newCost, ny, nx]);
            }
        }
    }

    console.log(-1);
}

main();
