const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, "utf8").trim().split(/\r?\n/);
    const firstLine = input[0].trim();
    const parts = firstLine.split(/\s+/);
    const H = parseInt(parts[0], 10);
    const W = parseInt(parts[1], 10);

    const grid: string[] = [];
    let lineIdx = 1;
    for (let i = 0; i < H; i++) {
        while (lineIdx < input.length && input[lineIdx].trim() === '') {
            lineIdx++;
        }
        grid.push(input[lineIdx].trim());
        lineIdx++;
    }

    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const ch = grid[r][c];
            if (ch === 'S') {
                startR = r; startC = c;
            } else if (ch === 'T') {
                targetR = r; targetC = c;
            }
        }
    }

    const INF = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = Array.from({length: H}, () => new Array(W).fill(INF));
    dist[startR][startC] = 0;

    const heap = new MinHeap();
    heap.push([0, startR, startC]);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (!heap.isEmpty()) {
        const [cost, r, c] = heap.pop();
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
            const cellCost = (ch >= '0' && ch <= '9') ? parseInt(ch, 10) : 0;
            const newCost = cost + cellCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                heap.push([newCost, nr, nc]);
            }
        }
    }

    console.log(-1);
}

class MinHeap {
    private heap: [number, number, number][];

    constructor() {
        this.heap = [];
    }

    push(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): [number, number, number] {
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    peek(): [number, number, number] {
        return this.heap[0];
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[i][0] >= this.heap[parent][0]) break;
            this.swap(i, parent);
            i = parent;
        }
    }

    private sinkDown(i: number): void {
        const n = this.heap.length;
        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;
            if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
            if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
            if (smallest === i) break;
            this.swap(i, smallest);
            i = smallest;
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}

main();
