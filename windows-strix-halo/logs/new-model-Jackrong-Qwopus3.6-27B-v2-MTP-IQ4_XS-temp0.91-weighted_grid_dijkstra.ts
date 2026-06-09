import * as fs from 'fs';

const data = fs.readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = data[0].split(' ').map(Number);
const grid: string[][] = [];
for (let i = 0; i < H; i++) {
    grid.push(data[i + 1].split(''));
}

const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

let startH = -1, startW = -1;

for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            startH = i;
            startW = j;
        }
    }
}

dist[startH][startW] = 0;

// Priority queue: [cost, h, w]
const pq: [number, number, number][] = [];
const addPq = (cost: number, h: number, w: number) => {
    pq.push([cost, h, w]);
    pq.sort((a, b) => a[0] - b[0]);
};

addPq(0, startH, startW);

while (pq.length > 0) {
    const [d, h, w] = pq.shift()!;
    if (d > dist[h][w]) continue;
    if (grid[h][w] === 'T') {
        console.log(d);
        process.exit(0);
    }
    for (const [dh, dw] of dirs) {
        const nh = h + dh;
        const nw = w + dw;
        if (nh < 0 || nh >= H || nw < 0 || nw >= W) continue;
        const ch = grid[nh][nw];
        if (ch === '#') continue;
        let cost = 0;
        if (ch >= '0' && ch <= '9') {
            cost = parseInt(ch, 10);
        }
        const nd = d + cost;
        if (nd < dist[nh][nw]) {
            dist[nh][nw] = nd;
            addPq(nd, nh, nw);
        }
    }
}

console.log(-1);
