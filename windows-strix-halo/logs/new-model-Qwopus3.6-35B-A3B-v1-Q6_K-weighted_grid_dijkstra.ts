import * as fs from 'fs';

class MinHeap {
    private data: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): [number, number, number] {
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    get size(): number {
        return this.data.length;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.data[parent][0] <= this.data[i][0]) break;
            [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
            i = parent;
        }
    }

    private sinkDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.data[left][0] < this.data[smallest][0]) smallest = left;
            if (right < n && this.data[right][0] < this.data[smallest][0]) smallest = right;
            if (smallest === i) break;
            [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
            i = smallest;
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0) return;

    const [H, W] = input[0].split(' ').map(Number);
    const grid = input.slice(1).slice(0, H);

    let sR = -1, sC = -1, tR = -1, tC = -1;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                sR = r; sC = c;
            } else if (grid[r][c] === 'T') {
                tR = r; tC = c;
            }
        }
    }

    if (sR === -1 || tR === -1) {
        console.log(-1);
        return;
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[sR][sC] = 0;

    const pq = new MinHeap();
    pq.push([0, sR, sC]);

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (pq.size > 0) {
        const [d, r, c] = pq.pop();

        if (d > dist[r][c]) continue;
        if (r === tR && c === tC) {
            console.log(d);
            return;
        }

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;

            const cell = grid[nr][nc];
            if (cell === '#') continue;

            const cost = (cell === 'T' || cell === 'S') ? 0 : parseInt(cell, 10);
            const newDist = d + cost;

            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                pq.push([newDist, nr, nc]);
            }
        }
    }

    console.log(-1);
}

solve();
