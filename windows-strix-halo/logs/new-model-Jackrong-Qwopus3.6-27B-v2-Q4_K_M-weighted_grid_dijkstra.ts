import * as fs from 'fs';

class MinHeap {
    private data: [number, number, number][] = [];

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }

    private siftUp(i: number): void {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p][0] > this.data[i][0]) {
                this.swap(i, p);
                i = p;
            } else {
                break;
            }
        }
    }

    private siftDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l][0] < this.data[smallest][0]) {
                smallest = l;
            }
            if (r < n && this.data[r][0] < this.data[smallest][0]) {
                smallest = r;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }

    push(cost: number, r: number, c: number): void {
        this.data.push([cost, r, c]);
        this.siftUp(this.data.length - 1);
    }

    pop(): [number, number, number] | null {
        if (this.data.length === 0) return null;
        const top = this.data[0];
        const last = this.data.pop();
        if (last !== top) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/).map(Number);
    const H = parts[0];
    const W = parts[1];

    const grid: string[] = [];
    for (let i = 1; i <= H; i++) {
        if (i < lines.length) {
            grid.push(lines[i].trim());
        } else {
            grid.push('');
        }
    }

    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        const row = grid[r];
        for (let c = 0; c < W; c++) {
            const ch = row[c];
            if (ch === 'S') {
                startR = r;
                startC = c;
            } else if (ch === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }

    if (startR === -1 || targetR === -1) {
        console.log(-1);
        return;
    }

    if (startR === targetR && startC === targetC) {
        console.log(0);
        return;
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    const pq = new MinHeap();
    pq.push(0, startR, startC);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (!pq.isEmpty()) {
        const top = pq.pop();
        if (top === null) break;
        const [cost, r, c] = top;
        if (cost > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }
        for (let d = 0; d < 4; d++) {
            const nr = r + dr[d];
            const nc = c + dc[d];
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
            const ch = grid[nr][nc];
            if (ch === '#') continue;
            let cellCost = 0;
            if (ch === 'S' || ch === 'T') {
                cellCost = 0;
            } else if (ch >= '0' && ch <= '9') {
                cellCost = parseInt(ch, 10);
            } else {
                cellCost = 0; // should not happen
            }
            const newCost = cost + cellCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push(newCost, nr, nc);
            }
        }
    }

    console.log(-1);
}

main();
