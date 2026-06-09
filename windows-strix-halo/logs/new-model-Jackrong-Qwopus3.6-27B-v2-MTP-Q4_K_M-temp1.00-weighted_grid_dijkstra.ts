const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    if (lines.length < 1) return;

    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/).map(Number);
    if (parts.length < 2) return;

    const H = parts[0], W = parts[1];
    const grid: string[] = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;

    for (let i = 1; i <= H; i++) {
        if (i >= lines.length) break;
        const row = lines[i].trim();
        grid.push(row);
        for (let j = 0; j < row.length; j++) {
            if (row[j] === 'S') {
                startR = i - 1;
                startC = j;
            } else if (row[j] === 'T') {
                targetR = i - 1;
                targetC = j;
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

    class MinHeap {
        private heap: [number, number, number][] = [];
        private comp = (a: [number, number, number], b: [number, number, number]) => a[0] - b[0];
        private parent(i: number) { return (i - 1) >> 1; }
        private left(i: number) { return 2 * i + 1; }
        private right(i: number) { return 2 * i + 2; }
        private swap(i: number, j: number) { const t = this.heap[i]; this.heap[i] = this.heap[j]; this.heap[j] = t; }

        push(item: [number, number, number]) {
            this.heap.push(item);
            this.siftUp(this.heap.length - 1);
        }

        pop(): [number, number, number] {
            const top = this.heap[0];
            const last = this.heap.pop();
            if (this.heap.length > 0) {
                this.heap[0] = last!;
                this.siftDown(0);
            }
            return top;
        }

        isEmpty() { return this.heap.length === 0; }

        private siftUp(i: number) {
            while (i > 0) {
                const p = this.parent(i);
                if (this.comp(this.heap[i], this.heap[p]) < 0) {
                    this.swap(i, p);
                    i = p;
                } else break;
            }
        }

        private siftDown(i: number) {
            const n = this.heap.length;
            while (true) {
                let smallest = i;
                const l = this.left(i), r = this.right(i);
                if (l < n && this.comp(this.heap[l], this.heap[smallest]) < 0) smallest = l;
                if (r < n && this.comp(this.heap[r], this.heap[smallest]) < 0) smallest = r;
                if (smallest !== i) {
                    this.swap(i, smallest);
                    i = smallest;
                } else break;
            }
        }
    }

    const pq = new MinHeap();
    pq.push([0, startR, startC]);

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (!pq.isEmpty()) {
        const [d, r, c] = pq.pop();
        if (d > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
            const ch = grid[nr][nc];
            if (ch === '#') continue;
            let cost: number;
            if (ch === 'S' || ch === 'T') cost = 0;
            else if (ch >= '0' && ch <= '9') cost = parseInt(ch, 10);
            else continue; // unexpected character
            const nd = d + cost;
            if (nd < dist[nr][nc]) {
                dist[nr][nc] = nd;
                pq.push([nd, nr, nc]);
            }
        }
    }

    console.log(-1);
}

solve();
