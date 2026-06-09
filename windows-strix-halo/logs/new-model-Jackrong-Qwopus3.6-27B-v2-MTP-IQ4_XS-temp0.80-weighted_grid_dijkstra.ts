import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const [H, W] = lines[0].split(' ').map(Number);

const grid: string[][] = [];
let startRow = -1;
let startCol = -1;

for (let i = 0; i < H; i++) {
    const line = lines[i + 1];
    grid.push(line.split(''));
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            startRow = i;
            startCol = j;
        }
    }
}

const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(Infinity));
dist[startRow][startCol] = 0;

// Priority queue: [cost, row, col]
const pq: [number, number, number][] = [];

function pushPQ(cost: number, r: number, c: number) {
    pq.push([cost, r, c]);
    // bubble up
    let i = pq.length - 1;
    while (i > 0) {
        const parent = (i - 1) >> 1;
        if (pq[parent][0] <= pq[i][0]) break;
        [pq[i], pq[parent]] = [pq[parent], pq[i]];
        i = parent;
    }
}

function popPQ(): [number, number, number] | undefined {
    if (pq.length === 0) return undefined;
    const top = pq[0];
    const last = pq.pop()!;
    if (pq.length > 0) {
        pq[0] = last;
        let i = 0;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < pq.length && pq[left][0] < pq[smallest][0]) smallest = left;
            if (right < pq.length && pq[right][0] < pq[smallest][0]) smallest = right;
            if (smallest === i) break;
            [pq[i], pq[smallest]] = [pq[smallest], pq[i]];
            i = smallest;
        }
    }
    return top;
}

pushPQ(0, startRow, startCol);

const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

while (pq.length > 0) {
    const [cost, r, c] = popPQ()!;
    if (cost > dist[r][c]) continue;
    if (grid[r][c] === 'T') {
        console.log(cost);
        process.exit(0);
    }
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
        const cell = grid[nr][nc];
        if (cell === '#') continue;
        const moveCost = cell === 'S' || cell === 'T' ? 0 : parseInt(cell, 10);
        const newCost = cost + moveCost;
        if (newCost < dist[nr][nc]) {
            dist[nr][nc] = newCost;
            pushPQ(newCost, nr, nc);
        }
    }
}

console.log(-1);
