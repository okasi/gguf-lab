import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length < 1) return;
    const firstLine = lines[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);
    const grid: string[] = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;

    for (let i = 1; i <= H; i++) {
        if (i < lines.length) {
            const row = lines[i].trim();
            grid.push(row.substring(0, W));
        } else {
            break;
        }
        for (let j = 0; j < W; j++) {
            const ch = grid[i - 1][j];
            if (ch === 'S') {
                startR = i - 1;
                startC = j;
            } else if (ch === 'T') {
                targetR = i - 1;
                targetC = j;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    class HeapNode {
        constructor(cost: number, r: number, c: number) {
            this.cost = cost;
            this.r = r;
            this.c = c;
        }
    }

    class MinHeap {
        private data: HeapNode[];
        constructor() {
            this.data = [];
        }
        push(node: HeapNode) {
            this.data.push(node);
            this.bubbleUp(this.data.length - 1);
        }
        pop(): HeapNode | undefined {
            if (this.data.length === 0) return undefined;
            const top = this.data[0];
            const last = this.data.pop()!;
            if (this.data.length > 0) {
                this.data[0] = last;
                this.bubbleDown(0);
            }
            return top;
        }
        get size() { return this.data.length; }
        private bubbleUp(idx: number) {
            while (idx > 0) {
                const parent = Math.floor((idx - 1) / 2);
                if (this.data[parent].cost <= this.data[idx].cost) break;
                [this.data[parent], this.data[idx]] = [this.data[idx], this.data[parent]];
                idx = parent;
            }
        }
        private bubbleDown(idx: number) {
            const n = this.data.length;
            while (true) {
                let smallest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;
                if (left < n && this.data[left].cost < this.data[smallest].cost) smallest = left;
                if (right < n && this.data[right].cost < this.data[smallest].cost) smallest = right;
                if (smallest === idx) break;
                [this.data[smallest], this.data[idx]] = [this.data[idx], this.data[smallest]];
                idx = smallest;
            }
        }
    }

    const heap = new MinHeap();
    heap.push(new HeapNode(0, startR, startC));

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (heap.size > 0) {
        const curr = heap.pop()!;
        const d = curr.cost;
        const r = curr.r;
        const c = curr.c;
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
            let cost = 0;
            if (ch >= '0' && ch <= '9') {
                cost = parseInt(ch, 10);
            } else if (ch === 'T') {
                cost = 0;
            } else if (ch === 'S') {
                cost = 0;
            }
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                heap.push(new HeapNode(newDist, nr, nc));
            }
        }
    }

    console.log(-1);
}

main();
