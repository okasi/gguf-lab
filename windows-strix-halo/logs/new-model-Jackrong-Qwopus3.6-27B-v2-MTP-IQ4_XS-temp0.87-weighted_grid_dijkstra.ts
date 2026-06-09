import * as fs from 'fs';

class MinHeap {
    private items: [number, number, number][] = [];

    push(item: [number, number, number]) {
        this.items.push(item);
        this.siftUp(this.items.length - 1);
    }

    pop(): [number, number, number] | undefined {
        if (this.items.length === 0) return undefined;
        const top = this.items[0];
        const last = this.items.pop();
        if (this.items.length > 0) {
            this.items[0] = last!;
            this.siftDown(0);
        }
        return top;
    }

    private siftUp(i: number) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.items[i][0] < this.items[p][0]) {
                this.swap(i, p);
                i = p;
            } else {
                break;
            }
        }
    }

    private siftDown(i: number) {
        const n = this.items.length;
        while (true) {
            let minIdx = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.items[l][0] < this.items[minIdx][0]) minIdx = l;
            if (r < n && this.items[r][0] < this.items[minIdx][0]) minIdx = r;
            if (minIdx !== i) {
                this.swap(i, minIdx);
                i = minIdx;
            } else {
                break;
            }
        }
    }

    private swap(i: number, j: number) {
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split(/\r?\n/);
    const [H, W] = lines[0].split(/\s+/).map(Number);
    const grid: string[] = [];
    for (let i = 1; i < lines.length && grid.length < H; i++) {
        const line = lines[i].trim();
        if (line.length > 0) grid.push(line);
    }

    let startX = -1, startY = -1;
    let targetX = -1, targetY = -1;

    for (let x = 0; x < H; x++) {
        for (let y = 0; y < W; y++) {
            const cell = grid[x][y];
            if (cell === 'S') {
                startX = x;
                startY = y;
            } else if (cell === 'T') {
                targetX = x;
                targetY = y;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new MinHeap();

    dist[startX][startY] = 0;
    pq.push([0, startX, startY]);

    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];

    while (pq.items.length > 0) {
        const [d, x, y] = pq.pop()!;
        if (d > dist[x][y]) continue;
        if (x === targetX && y === targetY) {
            console.log(d);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];

            if (nx < 0 || nx >= H || ny < 0 || ny >= W) continue;
            const cell = grid[nx][ny];
            if (cell === '#') continue;

            let cost = 0;
            if (cell >= '0' && cell <= '9') {
                cost = parseInt(cell, 10);
            }

            const newD = d + cost;
            if (newD < dist[nx][ny]) {
                dist[nx][ny] = newD;
                pq.push([newD, nx, ny]);
            }
        }
    }

    console.log(-1);
}

main();
