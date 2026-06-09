import * as fs from 'fs';

class MinHeap {
    private data: [number, number, number][] = [];

    private parent(i: number): number { return Math.floor((i - 1) / 2); }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }

    private swap(i: number, j: number): void {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }

    private bubbleUp(i: number): void {
        while (i > 0 && this.data[this.parent(i)][0] > this.data[i][0]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private sinkDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l][0] < this.data[smallest][0]) smallest = l;
            if (r < n && this.data[r][0] < this.data[smallest][0]) smallest = r;
            if (smallest === i) break;
            this.swap(smallest, i);
            i = smallest;
        }
    }

    push(item: [number, number, number]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): [number, number, number] {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last!;
            this.sinkDown(0);
        }
        return top;
    }

    empty(): boolean {
        return this.data.length === 0;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    if (lines.length === 0) return;

    const [H, W] = lines[0].trim().split(' ').map(Number);
    const grid = lines.slice(1).map(l => l.trim());

    let startX = -1, startY = -1;

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (grid[y][x] === 'S') {
                startX = x;
                startY = y;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startY][startX] = 0;

    const pq = new MinHeap();
    pq.push([0, startY, startX]);

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!pq.empty()) {
        const [d, y, x] = pq.pop();

        if (d > dist[y][x]) continue;
        if (grid[y][x] === 'T') {
            console.log(d);
            return;
        }

        for (const [dy, dx] of dirs) {
            const ny = y + dy;
            const nx = x + dx;

            if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue;

            const cell = grid[ny][nx];
            if (cell === '#') continue;

            const cost = cell === 'S' || cell === 'T' ? 0 : parseInt(cell, 10);
            const newD = d + cost;

            if (newD < dist[ny][nx]) {
                dist[ny][nx] = newD;
                pq.push([newD, ny, nx]);
            }
        }
    }

    console.log(-1);
}

solve();
