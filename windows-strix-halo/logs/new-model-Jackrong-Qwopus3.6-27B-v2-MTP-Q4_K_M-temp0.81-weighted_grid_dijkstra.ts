import * as fs from 'fs';

function main() {
    const data = fs.readFileSync(0, 'utf8');
    const lines = data.trim().split(/\r?\n/);
    const firstLine = lines[0].trim();
    const [H, W] = firstLine.split(/\s+/).map(Number);
    const grid: string[] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(lines[i].trim());
    }

    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;

    for (let r = 0; r < H; r++) {
        const row = grid[r];
        for (let c = 0; c < W; c++) {
            const ch = row[c];
            if (ch === 'S') {
                startR = r; startC = c;
            } else if (ch === 'T') {
                targetR = r; targetC = c;
            }
        }
    }

    function getCost(r: number, c: number): number {
        const ch = grid[r][c];
        if (ch === '#') return Infinity;
        if (ch === 'S' || ch === 'T') return 0;
        return parseInt(ch, 10);
    }

    const INF = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = [];
    for (let r = 0; r < H; r++) {
        dist.push(new Array(W).fill(INF));
    }
    dist[startR][startC] = 0;

    class MinHeap {
        private heap: [number, number, number][];
        constructor() {
            this.heap = [];
        }
        private parent(i: number): number { return (i - 1) >> 1; }
        private left(i: number): number { return 2 * i + 1; }
        private right(i: number): number { return 2 * i + 2; }
        private swap(i: number, j: number): void {
            [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
        }
        private siftUp(i: number): void {
            while (i > 0 && this.heap[this.parent(i)][0] > this.heap[i][0]) {
                this.swap(i, this.parent(i));
                i = this.parent(i);
            }
        }
        private siftDown(i: number): void {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < this.heap.length && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
            if (r < this.heap.length && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
            if (smallest !== i) {
                this.swap(i, smallest);
                this.siftDown(smallest);
            }
        }
        push(priority: number, r: number, c: number): void {
            this.heap.push([priority, r, c]);
            this.siftUp(this.heap.length - 1);
        }
        pop(): [number, number, number] | null {
            if (this.heap.length === 0) return null;
            const top = this.heap[0];
            const last = this.heap.pop();
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.siftDown(0);
            }
            return top;
        }
        isEmpty(): boolean {
            return this.heap.length === 0;
        }
    }

    const pq = new MinHeap();
    pq.push(0, startR, startC);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (!pq.isEmpty()) {
        const entry = pq.pop();
        if (entry === null) break;
        const [d, r, c] = entry;
        if (d > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
            const ch = grid[nr][nc];
            if (ch === '#') continue;
            const cost = getCost(nr, nc);
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                pq.push(newDist, nr, nc);
            }
        }
    }

    const ans = dist[targetR][targetC];
    console.log(ans === INF ? -1 : ans);
}

main();
