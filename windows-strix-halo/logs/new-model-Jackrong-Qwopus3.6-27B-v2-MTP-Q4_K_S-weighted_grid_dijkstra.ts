import * as fs from 'fs';

class MinHeap {
    private heap: { r: number; c: number; dist: number }[];

    constructor() {
        this.heap = [];
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    private parent(i: number): number {
        return (i - 1) >> 1;
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    push(item: { r: number; c: number; dist: number }): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): { r: number; c: number; dist: number } | null {
        if (this.heap.length === 0) return null;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const pIdx = this.parent(idx);
            if (this.heap[pIdx].dist <= this.heap[idx].dist) break;
            this.swap(pIdx, idx);
            idx = pIdx;
        }
    }

    private sinkDown(idx: number): void {
        const length = this.heap.length;
        while (true) {
            let smallest = idx;
            const l = this.left(idx);
            const r = this.right(idx);
            if (l < length && this.heap[l].dist < this.heap[smallest].dist) smallest = l;
            if (r < length && this.heap[r].dist < this.heap[smallest].dist) smallest = r;
            if (smallest === idx) break;
            this.swap(idx, smallest);
            idx = smallest;
        }
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);

    const grid: number[][] = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;

    for (let i = 0; i < H; i++) {
        const rowStr = lines[i + 1].trim();
        const row: number[] = [];
        for (let j = 0; j < W; j++) {
            const ch = rowStr[j];
            if (ch === '#') {
                row.push(-1);
            } else if (ch === 'S') {
                row.push(0);
                startR = i;
                startC = j;
            } else if (ch === 'T') {
                row.push(0);
                targetR = i;
                targetC = j;
            } else {
                row.push(parseInt(ch, 10));
            }
        }
        grid.push(row);
    }

    const dist: number[][] = [];
    for (let i = 0; i < H; i++) {
        dist.push(new Array(W).fill(Infinity));
    }
    dist[startR][startC] = 0;

    const heap = new MinHeap();
    heap.push({ r: startR, c: startC, dist: 0 });

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (!heap.isEmpty()) {
        const cur = heap.pop();
        if (cur === null) break;
        const { r, c, d } = cur;
        if (d > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== -1) {
                const newDist = d + grid[nr][nc];
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    heap.push({ r: nr, c: nc, dist: newDist });
                }
            }
        }
    }

    if (dist[targetR][targetC] === Infinity) {
        console.log(-1);
    } else {
        console.log(dist[targetR][targetC]);
    }
}

main();
