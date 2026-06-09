import * as fs from 'fs';

class MinHeap {
    private heap: [number, number, number][] = [];

    constructor() {}

    push(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): [number, number, number] {
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(idx: number): void {
        const heap = this.heap;
        const item = heap[idx];
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (item[0] >= heap[parent][0]) break;
            heap[idx] = heap[parent];
            idx = parent;
        }
        heap[idx] = item;
    }

    private bubbleDown(idx: number): void {
        const heap = this.heap;
        const half = heap.length >> 1;
        const item = heap[idx];
        while (idx < half) {
            const left = (idx << 1) + 1;
            const right = left + 1;
            let smallest = left;
            if (right < heap.length && heap[right][0] < heap[left][0]) {
                smallest = right;
            }
            if (heap[smallest][0] >= item[0]) break;
            heap[idx] = heap[smallest];
            idx = smallest;
        }
        heap[idx] = item;
    }
}

function main(): void {
    const data = fs.readFileSync(0, 'utf8').trim();
    const lines = data.split(/\r?\n/);
    const firstLine = lines[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);

    const cellCost: number[][] = new Array(H);
    let startX = 0, startY = 0, targetX = 0, targetY = 0;

    for (let i = 0; i < H; i++) {
        const row = lines[i + 1].trim();
        cellCost[i] = new Array(W);
        for (let j = 0; j < W; j++) {
            const ch = row[j];
            if (ch === '#') {
                cellCost[i][j] = -1;
            } else if (ch === 'S') {
                cellCost[i][j] = 0;
                startX = i;
                startY = j;
            } else if (ch === 'T') {
                cellCost[i][j] = 0;
                targetX = i;
                targetY = j;
            } else if (ch >= '0' && ch <= '9') {
                cellCost[i][j] = parseInt(ch, 10);
            } else {
                // Unexpected character, treat as wall
                cellCost[i][j] = -1;
            }
        }
    }

    const dist: number[][] = new Array(H);
    for (let i = 0; i < H; i++) {
        dist[i] = new Array(W).fill(Infinity);
    }
    dist[startX][startY] = 0;

    const pq = new MinHeap();
    pq.push([0, startX, startY]);

    const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    while (!pq.isEmpty()) {
        const [cost, x, y] = pq.pop();
        if (cost > dist[x][y]) continue;
        if (x === targetX && y === targetY) {
            console.log(cost);
            return;
        }
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < H && ny >= 0 && ny < W && cellCost[nx][ny] !== -1) {
                const newCost = cost + cellCost[nx][ny];
                if (newCost < dist[nx][ny]) {
                    dist[nx][ny] = newCost;
                    pq.push([newCost, nx, ny]);
                }
            }
        }
    }

    // unreachable
    console.log(-1);
}

main();
